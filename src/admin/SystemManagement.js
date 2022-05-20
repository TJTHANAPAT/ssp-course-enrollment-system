import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import Admin from './Admin';

import * as auth from '../functions/adminFunctions/authenticationFuctions';
import * as system from '../functions/systemFunctions';

class SystemManagement extends React.Component {
    state = {
        isLoading: true
    }

    componentDidMount = async () => {
        try {
            const user = await auth.checkAuthState();
            this.setState({
                currentUser: user,
                isLogin: !!user
            });
            if (!!user) {
                console.log('SSP Course Enrollment System © 2021 Created by TJTHANAPAT')
                const getSystemConfig = await system.getSystemConfig(false);
                const isFirstInitSystem = getSystemConfig.isFirstInitSystem;
                this.setState({ isFirstInitSystem: isFirstInitSystem });
                if (!isFirstInitSystem) {
                    const systemConfig = getSystemConfig.systemConfig;
                    this.setState({
                        selectedCourseYear: systemConfig.currentCourseYear,
                        courseYearArr: systemConfig.courseYears
                    });
                    this.getCoursesData(systemConfig.currentCourseYear);
                }
            }
        }
        catch (err) {
            console.error(err);
            this.setState({
                isLoading: false,
                isError: true,
                errorMessage: err.message
            })
        }
    }

    getCoursesData = (courseYear) => {
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course');
        this.setState({isLoading: true});
        courseRef.onSnapshot(querySnapshot => {
            let coursesArr = [];
            querySnapshot.forEach(doc => {
                coursesArr.push(doc.data())
            })
            this.setState({
                courses: coursesArr,
                isLoading: false
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
                return (
                    <div className="admin course-dashboard-item course row" key={i}>
                        <div className="col-md-9">
                            <div className="row align-items-center">
                                <div className="detail col-sm-6">
                                    <span className="course-name">{course.courseID} {course.courseName}</span>
                                    <span className="course-teacher"><i className="fa fa-fw fa-user" aria-hidden="false" /> {course.courseTeacher}</span>
                                    <span className="course-grade"><i className="fa fa-fw fa-check-square-o" aria-hidden="false" /> มัธยมศึกษาปีที่ {course.courseGrade.join(', ')}</span>
                                    <span className="course-day"><i className="fa fa-fw fa-calendar-check-o" aria-hidden="false" /> {system.translateDayToThai(course.courseDay)}</span>
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
        this.setState({ isLoading: true });
        auth.signOut()
            .then(() => {
                this.setState({
                    isLoading: false,
                    isLogin: false
                });
            })
    }

    getCourseStudentsData = (courseYear, courseDay, courseID) => {
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').where(`enrolledCourse.${courseDay}`, 'array-contains', courseID);
        return new Promise((resolve, reject) => {
            studentRef.onSnapshot(querySnapshot => {
                let studentsArr = [];
                querySnapshot.forEach(function (doc) {
                    const {
                        studentID, 
                        nameTitle, 
                        nameFirst, 
                        nameLast, 
                        studentGrade,
                        studentClass,
                        studentRoll
                    } = doc.data()
                    studentsArr.push({
                        เลขประจำตัว: studentID,
                        คำนำหน้า: nameTitle,
                        ชื่อ: nameFirst,
                        นามสกุล: nameLast,
                        ชั้น: studentGrade,
                        ห้อง: studentClass,
                        เลขที่: studentRoll,
                        วิชาที่ลงทะเบียน: courseID
                    });
                });
                resolve(studentsArr)
            })
        })
    }

    convertToCSV = (objectArr) => {
        const array = [Object.keys(objectArr[0])].concat(objectArr)
        return array.map(it => {
            return Object.values(it).toString()
        }).join('\n')
    }

    exportStudentList = async () => {
        const { courses } = this.state;
        const courseYear = this.state.selectedCourseYear;
        
        try {
            if (courses.length === 0) {
                alert(`ยังไม่มีรายวิชาที่ถูกเพิ่มในปีการศึกษา ${courseYear}`)
            } else {
                this.setState({ isLoading: true })
                let studentsArr = []
                for (const course of courses) {
                    let {courseID, courseDay} = course
                    let studentsData = await this.getCourseStudentsData(courseYear, courseDay, courseID)
                    studentsArr = studentsArr.concat(studentsData)
                }
                const csv = this.convertToCSV(studentsArr);
                const filename =  `StudentList_${courseYear}.csv` || 'export.csv';

                var blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, filename);
                } else {
                    var link = document.createElement("a");
                    if (link.download !== undefined) { // feature detection
                        // Browsers that support HTML5 download attribute
                        var url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", filename);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }
                this.setState({ isLoading: false })
            }
        } catch (err) {
            this.setState({
                isLoading: false,
                isError: true,
                errorMessage: err.message
            })
        }
    }

    render() {
        const {
            isLoading,
            isLogin,
            isFirstInitSystem,
            isError,
            errorMessage
        } = this.state;

        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'none'} />
        } else if (isLogin) {
            if (isFirstInitSystem) {
                return (
                    <div className="body bg-gradient">
                        <div className="wrapper">
                            <h1>ระบบลงทะเบียนรายวิชาเพิ่มเติม</h1>
                            <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                            <h5>เข้าใช้งานระบบในชื่อ {this.state.currentUser.displayName}</h5>
                            <p className="mt-2">ดูเหมือนว่ายังไม่มีปีการศึกษาถูกเพิ่มในระบบ กดปุ่มด้านล่างเพื่อตั้งค่าปีการศึกษา</p>
                            <div className="mt-2">
                                <a role="button" className="btn btn-purple" href="/admin/system/configyear">ตั้งค่าปีการศึกษา</a>
                                <button className="btn btn-green ml-2" onClick={this.signOut}><i className="fa fa-sign-out"></i> ลงชื่อออก</button>
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
                            <h1>ระบบลงทะเบียนเรียน</h1>
                            <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                            <h5>เข้าใช้งานระบบในชื่อ {this.state.currentUser.displayName}</h5>
                            <label htmlFor="courseyear-selector">เลือกปีการศึกษา:</label>
                            {this.courseYearSelector()}
                            {this.courseDashboard(courses)}
                            <div>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/createcourse?courseYear=${selectedCourseYear}`}>เพิ่มรายวิชาใหม่</a>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/configcourseyear?courseYear=${selectedCourseYear}`}>ตั้งค่าปีการศึกษา {selectedCourseYear}</a>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/managestudent?courseYear=${selectedCourseYear}`}>การจัดการนักเรียน</a>
                                <button className="btn btn-purple m-1" onClick={this.exportStudentList}>ดาวน์โหลดรายชื่อนักเรียนทั้งหมด</button>
                            </div>
                            <hr />
                            <div>
                                <button className="btn btn-green m-1" onClick={this.signOut}><i className="fa fa-sign-out"></i> ลงชื่อออก</button>
                                <a role="button" className="btn btn-green m-1" href="/admin/system/configyear">ตั้งค่าปีการศึกษา</a>
                                <a role="button" className="btn btn-green m-1" href="/admin/system/settings">ตั้งค่าระบบ</a>
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
