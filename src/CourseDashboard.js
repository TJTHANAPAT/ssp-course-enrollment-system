import React from 'react';
import * as system from './functions/systemFunctions';
import { getCoursesData } from './functions/enrollCourseFunction';
import LoadingPage from './components/LoadingPage';
import ErrorPage from './components/ErrorPage';
import Footer from './components/Footer';


class Dashboard extends React.Component {
    state = {
        courses: [],
        coursesData: [],
        gradeFilter: 'all',
        isLoading: true,
    }

    componentDidMount = async () => {
        try {
            const courseYear = await system.getURLParam('courseYear');
            const getSystemConfig = await system.getSystemConfig();
            const systemConfig = getSystemConfig.systemConfig;
            const courseYearsArr = systemConfig.courseYears;
            const getCourseYearConfig = await system.getCourseYearConfig(courseYear, courseYearsArr);
            const courseYearConfig = getCourseYearConfig.config;
            const coursesData = await getCoursesData(courseYear);
            const coursesDataFiltered = await this.filterCoursesDataByGrade(coursesData, 'all');
            this.setState({
                courseYear: courseYear,
                courseYearConfig: courseYearConfig,
                gradesArr: courseYearConfig.grades,
                coursesData: coursesData,
                courses: coursesDataFiltered
            });
        }
        catch (err) {
            console.error(err);
            this.setState({
                isError: true,
                errorMessage: err
            })
        }
        finally {
            this.setState({ isLoading: false });
        }
    }

    filterCoursesDataByGrade = (coursesData, grade) => {
        return new Promise(resolve => {
            let coursesDataFiltered = [];
            if (grade === 'all') {
                coursesDataFiltered = coursesData
            } else {
                for (let i = 0; i < coursesData.length; i++) {
                    const course = coursesData[i];
                    for (let j = 0; j < course.courseGrade.length; j++) {
                        const courseGrade = course.courseGrade[j];
                        if (courseGrade === grade || courseGrade === parseInt(grade)) {
                            coursesDataFiltered.push(course);
                        }
                    }
                }
            }
            resolve(coursesDataFiltered);
        })

    }

    handleChangeFilter = (event) => {
        const { coursesData } = this.state;
        const gradeFilter = event.target.value;
        this.filterCoursesDataByGrade(coursesData, gradeFilter)
            .then(res => {
                const coursesDataFiltered = res;
                this.setState({
                    courses: coursesDataFiltered,
                    gradeFilter: gradeFilter
                });
            })
    }

    courseDashboard = (coursesData) => {
        if (coursesData.length === 0) {
            return (
                <div className="mt-4 text-center">
                    <p>ขออภัย ไม่พบรายวิชาที่คุณต้องการ</p>
                </div>
            )
        } else {
            let courseDashboard = coursesData.map((course, i) => {
                let courseStatus;
                if (course.courseEnrolled < course.courseCapacity) {
                    courseStatus = course.courseCapacity - course.courseEnrolled
                } else {
                    courseStatus = 'เต็ม'
                }
                let courseDescription = () => {
                    if (!!course.courseDescription) {
                        return (
                            <span className="course-day"><i className="fa fa-fw fa-info" aria-hidden="false" /> {course.courseDescription}</span>
                        )
                    }
                }
                return (
                    <div className="course-dashboard-item course row align-items-center" key={i}>
                        <div className="detail col-sm-6">
                            <span className="course-name">{course.courseID} {course.courseName}</span>
                            <span className="course-teacher"><i className="fa fa-fw fa-user" aria-hidden="true"></i> {course.courseTeacher}</span>
                            <span className="course-grade"><i className="fa fa-fw fa-check-square-o" aria-hidden="true"></i> มัธยมศึกษาปีที่ {course.courseGrade.join(', ')}</span>
                            {courseDescription()}
                        </div>
                        <div className="col-sm-6">
                            <div className="row align-items-center">
                                <div className="col stat">
                                    <span className="stat-description">รับสมัคร</span>
                                    <span className="stat-number">{course.courseCapacity}</span>
                                </div>
                                <div className="col stat">
                                    <span className="stat-description">สมัครแล้ว</span>
                                    <span className="stat-number">{course.courseEnrolled}</span>
                                </div>
                                <div className="col stat">
                                    <span className="stat-description">ที่ว่าง</span>
                                    <span className="stat-number">{courseStatus}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
            return (courseDashboard)
        }
    }

    render() {
        const { isLoading, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'home'} />
        } else {
            const { courses, courseYear, gradesArr } = this.state;
            const courseDashboard = this.courseDashboard;
            return (
                <div id="course-dashboard" className="body bg-gradient">
                    <div className="wrapper">
                        <h1>ระบบลงทะเบียนเรียน</h1>
                        <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                        <h4>รายวิชาเพิ่มเติมปีการศึกษา {courseYear}</h4>
                        <label htmlFor="grade-filter">กรองรายวิชาโดยชั้นเรียน:</label>
                        <select id="grade-filter" className="form-control" defaultValue="all" onChange={this.handleChangeFilter}>
                            <option value="all">ทั้งหมด</option>
                            {gradesArr.map((grade, i) => { return (<option value={grade} key={i}>มัธยมศึกษาปีที่ {grade}</option>) })}
                        </select>
                        {courseDashboard(courses)}
                        <a href="/" className="btn btn-wrapper-bottom btn-green">กลับหน้าแรก</a>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default Dashboard;
