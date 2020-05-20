import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import Admin from './Admin';

import * as auth from './functions/authenticationFuctions';
import * as admin from '../functions/systemFunctions';

class SystemManagement extends React.Component {
    state = {
        courses: [],

        isLoadingComplete: false,
        isError: false,
        errorMessage: '',
        isFirstInitSystem: false,

        courseYearArr: [],
        selectedCourseYear: ''
    }

    componentDidMount = () => {
        auth.checkAuthState()
            .then(res => {
                const user = res.user;
                const isLogin = res.isLogin;
                this.setState({
                    currentUser: user,
                    isLogin: isLogin,
                })
                return admin.getSystemConfig(false)
            })
            .then(res => {
                const isFirstInitSystem = res.isFirstInitSystem;
                if (!isFirstInitSystem) {
                    const systemConfig = res.systemConfig;
                    this.setState({
                        selectedCourseYear: systemConfig.currentCourseYear,
                        courseYearArr: systemConfig.courseYears
                    });
                    this.getCoursesData(systemConfig.currentCourseYear);
                } else {
                    this.setState({
                        isFirstInitSystem: true,
                    })
                }
                console.log(res);
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                })
            })
    }

    getCoursesData = (courseYear) => {
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course');
        let coursesArr = [];
        courseRef.onSnapshot(querySnapshot => {
            coursesArr = [];
            querySnapshot.forEach(doc => {
                coursesArr.push(doc.data())
            })
            this.setState({
                courses: coursesArr,
                isLoadingComplete: true,
            });
        });
    }

    courseDashboard = (coursesData) => {
        const courseYear = this.state.selectedCourseYear;
        if (coursesData.length === 0) {
            return (
                <div className="mt-4 text-center">
                    <p>ยังไม่มีรายวิชาที่ถูกเพิ่มในปีการศึกษา {courseYear}</p>
                </div>
            )
        } else {
            let courseDashboard = coursesData.map((course, i) => {
                let courseStatus = null;
                let courseEditLink = `/admin/editcourse?courseYear=${courseYear}&courseID=${course.courseID}`;
                let courseViewLink = `/admin/viewcourse?courseYear=${courseYear}&courseID=${course.courseID}`;
                if (course.courseEnrolled < course.courseCapacity) {
                    courseStatus = course.courseCapacity - course.courseEnrolled
                } else {
                    courseStatus = 'เต็ม'
                }
                let stat = (text, number) => {
                    return (
                        <div className="col stat">
                            <span className="stat-description">{text}</span>
                            <span className="stat-number">{number}</span>
                        </div>
                    )
                }
                let courseDayArr = course.courseDay !== undefined ? course.courseDay : ['not set']
                const daysLabel = [
                    { en: 'sunday', th: 'วันอาทิตย์' },
                    { en: 'monday', th: 'วันจันทร์' },
                    { en: 'tuesday', th: 'วันอังคาร' },
                    { en: 'wednesday', th: 'วันพุธ' },
                    { en: 'thursday', th: 'วันพฤหัสบดี' },
                    { en: 'friday', th: 'วันศุกร์' },
                    { en: 'saturday', th: 'วันเสาร์' },
                    { en: 'not set', th: 'ยังไม่ได้ตั้งค่า' }
                ]
                let courseDayTH = []
                for (let i = 0; i < courseDayArr.length; i++) {
                    for (let j = 0; j < daysLabel.length; j++) {
                        if (courseDayArr[i] === daysLabel[j].en) {
                            courseDayTH.push(daysLabel[j].th)
                        }
                    }
                }

                return (
                    <div className="course row admin" key={i}>
                        <div className="col-md-9">
                            <div className="row align-items-center">
                                <div className="detail col-sm-6">
                                    <span className="course-name">{course.courseID} {course.courseName}</span>
                                    <span className="course-teacher"><i className="fa fa-fw fa-user" aria-hidden="false" /> {course.courseTeacher}</span>
                                    <span className="course-grade"><i className="fa fa-fw fa-check-square-o" aria-hidden="false" /> มัธยมศึกษาปีที่ {course.courseGrade.join(', ')}</span>
                                    <span className="course-day"><i className="fa fa-fw fa-calendar-check-o" aria-hidden="false" /> {courseDayTH.join(', ')}</span>
                                </div>
                                <div className="col-sm-6">
                                    <div className="row align-items-center">
                                        {stat('รับสมัคร', course.courseCapacity)}
                                        {stat('สมัครแล้ว', course.courseEnrolled)}
                                        {stat('ที่ว่าง', courseStatus)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="course-btn col-md-3">
                            <a className="col btn btn-admin btn-left btn-purple fa fa-file-text-o" href={courseViewLink}></a>
                            <a className="col btn btn-admin btn-right btn-green fa fa-pencil" href={courseEditLink}></a>
                        </div>
                    </div>
                )
            })
            return (courseDashboard)
        }
    }

    selectCourseYear = (event) => {
        const { selectCourseYear } = this.state;
        const newSelectCourseYear = event.target.value;
        if (selectCourseYear !== newSelectCourseYear) {
            this.setState({ selectedCourseYear: newSelectCourseYear });
            this.getCoursesData(newSelectCourseYear);
        }
    }

    courseYearSelector = () => {
        const { courseYearArr, selectedCourseYear } = this.state;
        let courseYearSelector = courseYearArr.map((courseYear, i) => {
            return <option value={courseYear.year} key={i}>ปีการศึกษา {courseYear.year}</option>
        });
        return (
            <select id="courseyear-selector" className="form-control form-control-lg" defaultValue={selectedCourseYear} onChange={this.selectCourseYear}>
                {courseYearSelector}
            </select>
        )
    }

    signOut = () => {
        this.setState({ isLoadingComplete: false });
        auth.signOut()
            .then(() => {
                this.setState({
                    isLoadingComplete: true,
                    isLogin: false
                })
            })
    }

    render() {
        const {
            isLoadingComplete,
            isLogin,
            isFirstInitSystem,
            isError,
            errorMessage
        } = this.state;

        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'none'} />
        } else if (isLogin) {
            if (isFirstInitSystem) {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper text-left">
                            <h1>ระบบลงทะเบียนรายวิชาเพิ่มเติม</h1>
                            <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                            <h2>System Configuration</h2>
                            <p className="mt-2">No course year has been created. You have to create one by press the button below</p>
                            <div className="mt-2 text-center">
                                <a role="button" className="btn btn-purple m-1" href="/admin/system/config/year">Config Course Years</a>
                                <button className="btn btn-green m-1" onClick={this.signOut}><i className="fa fa-sign-out"></i> Logout</button>
                            </div>
                        </div>
                        <Footer />
                    </div>
                )
            } else {
                const { courses, selectedCourseYear } = this.state;
                return (
                    <div className="body bg-gradient">
                        <div className="wrapper">
                            <h1>ระบบลงทะเบียนรายวิชาเพิ่มเติม</h1>
                            <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                            <h5>เข้าใช้งานระบบในชื่อ {firebase.auth().currentUser.displayName}</h5>
                            <label htmlFor="courseyear-selector">เลือกปีการศึกษา:</label>
                            {this.courseYearSelector()}
                            {this.courseDashboard(courses)}
                            <div>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/createcourse?courseYear=${selectedCourseYear}`}>เพิ่มรายวิชาใหม่</a>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/config/courseyear?courseYear=${selectedCourseYear}`}>ตั้งค่าปีการศึกษา {selectedCourseYear}</a>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/managestudent?courseYear=${selectedCourseYear}`}>การจัดการนักเรียน</a>
                            </div>
                            <hr />
                            <div>
                                <button className="btn btn-green m-1" onClick={this.signOut}><i className="fa fa-sign-out"></i> ลงชื่อออก</button>
                                <a role="button" className="btn btn-green m-1" href="/admin/system/config/year">ตั้งค่าปีการศึกษา</a>
                                <a role="button" className="btn btn-green m-1" href="/admin/settings">ตั้งค่าระบบ</a>
                            </div>
                        </div>
                        <Footer />
                    </div>
                )
            }
        } else {
            return <Admin />
        }
    }
}

export default SystemManagement;
