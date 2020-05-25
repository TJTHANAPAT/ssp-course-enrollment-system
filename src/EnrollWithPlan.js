import React from 'react';
import * as system from './functions/systemFunctions';
import * as enroll from './functions/enrollCourseFunction'
import LoadingPage from './components/LoadingPage';
import ErrorPage from './components/ErrorPage';
import Footer from './components/Footer';

class EnrollWithPlan extends React.Component {
    state = {
        courses: [],
        coursesData: [],
        isLoadingComplete: false,
        isError: false,
        studentEnrollPlan: '',
        isAllowSelectCourses: false
    }
    componentDidMount = () => {
        system.getSystemConfig()
            .then(res => {
                const systemConfig = res.systemConfig;
                const courseYear = systemConfig.currentCourseYear;
                this.setState({
                    courseYear: courseYear,
                    systemConfig: systemConfig
                });
                return enroll.checkCourseYearAvailable(courseYear, systemConfig);
            })
            .then(() => {
                const { systemConfig, courseYear } = this.state;
                const courseYearsArr = systemConfig.courseYears;
                return system.getCourseYearConfig(courseYear, courseYearsArr)
            })
            .then(res => {
                const { courseYear } = this.state;
                const courseYearConfig = res.config;
                this.setState({
                    courseGrade: courseYearConfig.grades,
                    courseYearConfig: courseYearConfig
                });
                return enroll.getCoursesData(courseYear);
            })
            .then(res => {
                const coursesData = res;
                this.setState({
                    coursesData: coursesData,
                    isLoadingComplete: true
                });
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                });
            })
    }

    goBack = (event) => {
        event.preventDefault();
        window.history.back();
    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    enrollPlanSelector = () => {
        const { courseYearConfig } = this.state;
        const enrollPlans = courseYearConfig.enrollPlans;
        const enrollPlanSelector = enrollPlans.map((enrollPlan, i) => {
            let enrollPlanDetail = enrollPlan.plan.map((day, j) => {
                if (day.numOfCourse !== 0) {
                    return <span key={j}>{system.translateDayToThai(day.day)} {day.numOfCourse} วิชา </span>
                } else {
                    return null;
                }
            })
            return (
                <li className="list-group-item enroll-selector" key={i}>
                    <label className="full-width" htmlFor={enrollPlan.name}>
                        <div className="enroll-selector-group">
                            <div className="enroll-selector-check-input">
                                <input
                                    className="form-check-input" type="radio" name="enrollPlans"
                                    id={enrollPlan.name} value={enrollPlan.name}
                                    onChange={this.handleChangeEnrollPlanSelector}
                                />
                            </div>
                            <div className="enroll-selector-label full-width">
                                <h5>{enrollPlan.name}</h5>
                                {enrollPlanDetail}
                            </div>
                        </div>
                    </label>
                </li>
            )
        })
        return (
            <div className="mb-4">
                <h5 className="mb-3">เลือกรูปแบบการลงทะเบียน</h5>
                <ul className="list-group admin">
                    {enrollPlanSelector}
                </ul>
            </div>
        )
    }

    handleChangeEnrollPlanSelector = (event) => {
        const defaultStudentEnrolledCourse = {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: []
        }
        let checkboxes = document.getElementsByName('selectCourseCheckbox')
        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            checkbox.checked = false;
        }
        this.setState({
            studentEnrollPlan: event.target.value,
            studentEnrolledCourse: defaultStudentEnrolledCourse,
            isAllowSelectCourses: true
        })
    }

    courseDashboard = (coursesData, day) => {
        if (coursesData.length === 0) {
            return (
                <div className="mx-4 text-center">
                    <p>ขออภัย ไม่พบรายวิชาที่คุณต้องการ</p>
                </div>
            )
        } else {
            let courseDashboard = coursesData.map((course, i) => {
                let courseStatus = null;
                let checkBoxEnroll = null;
                if (course.courseEnrolled < course.courseCapacity) {
                    courseStatus = course.courseCapacity - course.courseEnrolled
                    checkBoxEnroll = () => {
                        return <input className="form-check-input" type="checkbox" name="selectCourseCheckbox" id={course.courseID} value={day} onChange={this.handleChangeSelectCourse} />
                    }
                } else {
                    courseStatus = 'เต็ม'
                    checkBoxEnroll = () => {
                        return <input className="form-check-input" type="checkbox" name="selectCourseCheckbox" disabled />
                    }
                }
                return (
                    <li className="list-group-item enroll-selector" key={i}>
                        <label className="full-width" htmlFor={course.courseID}>
                            <div className="enroll-selector-group">
                                <div className="enroll-selector-check-input">
                                    {checkBoxEnroll()}
                                </div>
                                <div className="enroll-selector-label">
                                    <div className="course-selector row align-items-center">
                                        <div className="detail col-sm-6">
                                            <span className="course-name">{course.courseID} {course.courseName}</span>
                                            <span className="course-teacher"><i className="fa fa-fw fa-user" aria-hidden="true"></i> {course.courseTeacher}</span>
                                            <span className="course-grade"><i className="fa fa-fw fa-check-square-o" aria-hidden="true"></i> มัธยมศึกษาปีที่ {course.courseGrade.join(', ')}</span>
                                            <span className="course-day"><i className="fa fa-fw fa-calendar-check-o" aria-hidden="false" /> {system.translateDayToThai(course.courseDay)}</span>
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
                                </div>
                            </div>
                        </label>
                    </li>
                )
            })
            return <ul className="list-group">{courseDashboard}</ul>
        }
    }

    filterCoursesDataByDay = (coursesData, day = '') => {
        const daysArr = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ]
        let isDayValid = false;
        for (let i = 0; i < daysArr.length; i++) {
            if (day === daysArr[i]) {
                isDayValid = true;
            }
        }
        if (!isDayValid) {
            const err = 'Day is not valid.';
            console.error(err);
        } else {
            let coursesDataFiltered = [];
            for (let i = 0; i < coursesData.length; i++) {
                const course = coursesData[i];
                if (course.courseDay === day) {
                    coursesDataFiltered.push(course);
                }
            }
            return (coursesDataFiltered);
        }
    }

    coursesSelector = () => {
        const {
            isAllowSelectCourses,
            coursesData,
            courseYearConfig,
            studentEnrollPlan
        } = this.state;
        if (isAllowSelectCourses) {
            const enrollPlans = courseYearConfig.enrollPlans
            let selectedEnrollPlan = null;
            for (let i = 0; i < enrollPlans.length; i++) {
                const enrollPlan = enrollPlans[i];
                if (enrollPlan.name === studentEnrollPlan) {
                    selectedEnrollPlan = enrollPlan
                }
            }
            const enrollPlanDetail = selectedEnrollPlan.plan.map((day, i) => {
                if (day.numOfCourse > 0) {
                    const coursesDataFiltered = this.filterCoursesDataByDay(coursesData, day.day)
                    return (
                        <div key={i} className="mt-2 mb-3">
                            <h5>เลือก {day.numOfCourse} รายวิชาสำหรับ{system.translateDayToThai(day.day)}</h5>
                            {this.courseDashboard(coursesDataFiltered, day.day)}
                        </div>
                    )
                } else {
                    return null;
                }
            })
            return (
                <div>
                    <hr className="mb-3" />
                    {enrollPlanDetail}
                    <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="chkConfirm" required />
                        <label className="form-check-label" htmlFor="chkConfirm">ข้าพเจ้ายืนยันว่าข้อมูลที่กรอกไปข้างต้นนั้นถูกต้องและสมบูรณ์</label>
                    </div>
                    <br />
                    <button type="submit" className="btn btn-purple">ลงทะเบียน</button>
                </div>
            )
        } else {
            return null;
        }

    }

    handleChangeSelectCourse = (event) => {
        const courseID = event.target.id;
        const courseDay = event.target.value;
        const { courseYearConfig, studentEnrollPlan, studentEnrolledCourse } = this.state;
        if (event.target.checked) {
            const enrollPlans = courseYearConfig.enrollPlans
            let selectedEnrollPlan = null;
            for (let i = 0; i < enrollPlans.length; i++) {
                const enrollPlan = enrollPlans[i];
                if (enrollPlan.name === studentEnrollPlan) {
                    selectedEnrollPlan = enrollPlan
                }
            }
            const currentNumOfEnrolledCourse = studentEnrolledCourse[courseDay].length;
            let limitNumOfEnrolledCourse = null;
            for (let i = 0; i < selectedEnrollPlan.plan.length; i++) {
                const enrollPlan = selectedEnrollPlan.plan[i];
                if (courseDay === enrollPlan.day) {
                    limitNumOfEnrolledCourse = enrollPlan.numOfCourse
                }
            }
            if (currentNumOfEnrolledCourse < limitNumOfEnrolledCourse) {
                studentEnrolledCourse[courseDay].push(courseID)
                studentEnrolledCourse[courseDay].sort()
                this.setState({ studentEnrolledCourse: studentEnrolledCourse });
            } else {
                event.target.checked = false;
                alert(`ไม่สามารถเลือกรายวิชาเพิ่มได้ คุณสามารถเลือกได้เพียง ${limitNumOfEnrolledCourse} รายวิชาสำหรับ${system.translateDayToThai(courseDay)}`)
            }
            
        } else {
            for (var i = 0; i < studentEnrolledCourse[courseDay].length; i++) {
                if (courseID === studentEnrolledCourse[courseDay][i]) {
                    studentEnrolledCourse[courseDay].splice(i, 1);
                }
            }
            this.setState({ studentEnrolledCourse: studentEnrolledCourse });
        }
        console.log('Current Student Selected Courses: ',this.state.studentEnrolledCourse)

    }

    enrollmentForm = () => {
        const { courseGrade } = this.state;
        const updateInput = this.updateInput;
        const gradeSelector = () => {
            let gradeOptions = courseGrade.map((grade, i) => {
                return <option value={grade} key={i}>มัธยมศึกษาปีที่ {grade}</option>
            })
            return (
                <select id="studentGrade" className="form-control" onChange={updateInput} defaultValue="" required>
                    <option value="" disabled>เลือก...</option>
                    {gradeOptions}
                </select>
            )
        }
        return (
            <form onSubmit={this.enrollCourse}>
                <h5>กรอกข้อมูลส่วนตัวของคุณ</h5>
                <div className="form-group">
                    <label htmlFor="studentID">เลขประจำตัวนักเรียน</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="studentID" placeholder="เลขประจำตัวนักเรียน" onChange={updateInput} required />
                </div>
                <div className="form-row">
                    <div className="col-sm-2 form-group">
                        <label htmlFor="nameTitle">คำนำหน้า</label>
                        <select id="nameTitle" className="form-control" onChange={updateInput} defaultValue="" required>
                            <option value="" disabled>เลือก...</option>
                            <option value="เด็กชาย">เด็กชาย</option>
                            <option value="เด็กหญิง">เด็กหญิง</option>
                            <option value="นาย">นาย</option>
                            <option value="นางสาว">นางสาว</option>
                        </select>
                    </div>
                    <div className="col-sm-5 form-group">
                        <label htmlFor="nameFirst">ชื่อ</label>
                        <input type="text" className="form-control" id="nameFirst" placeholder="ชื่อ" onChange={updateInput} required />
                    </div>
                    <div className="col-sm-5 form-group">
                        <label htmlFor="nameLast">นามสกุล</label>
                        <input type="text" className="form-control" id="nameLast" placeholder="นามสกุล" onChange={updateInput} required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="studentGrade">ชั้น</label>
                    {gradeSelector()}
                </div>
                <div className="form-row">
                    <div className="col-6 form-group">
                        <label htmlFor="studentClass">ห้องเรียน</label>
                        <input type="number" pattern="[0-9]*" className="form-control" id="studentClass" placeholder="ห้องเรียน" onChange={updateInput} required />
                    </div>
                    <div className="col-6 form-group">
                        <label htmlFor="studentRoll">เลขที่</label>
                        <input type="number" pattern="[0-9]*" className="form-control" id="studentRoll" placeholder="เลขที่" onChange={updateInput} required />
                    </div>
                </div>
                <hr />
                {this.enrollPlanSelector()}
                {this.coursesSelector()}
            </form>
        );
    }

    render() {
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'home'} />
        } else {
            const { courseYear } = this.state;
            return (
                <div id="course-dashboard" className="body bg-gradient">
                    <div className="wrapper">
                        <h1>ระบบลงทะเบียนรายวิชาเพิ่มเติม</h1>
                        <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                        <h4>ปีการศึกษา {courseYear}</h4>
                        <hr />
                        {this.enrollmentForm()}
                        <a href="/" className="btn btn-wrapper-bottom btn-green">กลับหน้าแรก</a>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default EnrollWithPlan;