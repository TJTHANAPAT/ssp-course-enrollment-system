import React from 'react';
import { daysArr, translateDayToThai } from '../functions/systemFunctions';
import * as enroll from './enrollCourseFunction';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';
import Footer from '../components/Footer';

class CoursesSelector extends React.Component {

    state = {
        isLoading: false,
        studentEnrolledCourse: {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: []
        }
    }

    componentDidMount = () => {
        const {
            courseYear,
            coursesData,
            enrollPlans,
            studentEnrollPlan,
            studentInfo
        } = this.props;
        this.setState({
            courseYear: courseYear,
            coursesData: coursesData,
            enrollPlans: enrollPlans,
            studentEnrollPlan: studentEnrollPlan,
            studentInfo: studentInfo
        });
    }

    goPreviousStep = (event) => {
        event.preventDefault();
        this.props.goPreviousStepFunction();
    }

    courseDashboard = (coursesData, day) => {
        if (coursesData.length === 0) {
            return (
                <div className="mx-4 text-center">
                    <p>ขออภัย ไม่พบรายวิชาที่คุณสามารถเลือกได้</p>
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
                                            <span className="course-day"><i className="fa fa-fw fa-calendar-check-o" aria-hidden="false" /> {translateDayToThai(course.courseDay)}</span>
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

    filterCoursesDataByGrade = (coursesData, grade) => {
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
        return (coursesDataFiltered);
    }

    filterCoursesDataByDay = (coursesData, day = '') => {
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

    getCourseName = (courseID, coursesData) => {
        for (let i = 0; i < coursesData.length; i++) {
            const course = coursesData[i];
            if (courseID === course.courseID) {
                return course.courseName;
            }
        }
    }

    coursesSelector = () => {
        const {
            coursesData,
            enrollPlans,
            studentEnrollPlan,
            studentInfo
        } = this.props;
        const studentGrade = studentInfo.studentGrade
        const coursesDataFilteredByGrade = this.filterCoursesDataByGrade(coursesData, studentGrade)
        let selectedEnrollPlan = null;
        for (let i = 0; i < enrollPlans.length; i++) {
            const enrollPlan = enrollPlans[i];
            if (enrollPlan.name === studentEnrollPlan) {
                selectedEnrollPlan = enrollPlan
            }
        }
        const enrollPlanDetail = selectedEnrollPlan.plan.map((day, i) => {
            if (day.numOfCourse > 0) {
                const coursesDataFiltered = this.filterCoursesDataByDay(coursesDataFilteredByGrade, day.day)
                return (
                    <div key={i} className="mt-2 mb-3">
                        <h5>เลือก {day.numOfCourse} รายวิชาสำหรับ{translateDayToThai(day.day)}</h5>
                        {this.courseDashboard(coursesDataFiltered, day.day)}
                    </div>
                )
            } else {
                return null;
            }
        })
        return (
            <form onSubmit={this.enrollCourse}>
                {enrollPlanDetail}
                <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="checkConfirm" required />
                    <label className="form-check-label" htmlFor="checkConfirm">ข้าพเจ้ายืนยันว่าข้อมูลที่กรอกไปนั้นถูกต้องและสมบูรณ์ และเข้าใจว่าจะไม่สามารถเปลี่ยนแปลงรายวิชาที่ทำการลงทะเบียนไปแล้วได้</label>
                </div>
                <br />
                <button type="submit" className="btn btn-purple">ลงทะเบียน</button>
                <button onClick={this.goPreviousStep} className="btn btn-secondary ml-2">ย้อนกลับ</button>
            </form>
        )
    }

    handleChangeSelectCourse = (event) => {
        const courseID = event.target.id;
        const courseDay = event.target.value;
        const { enrollPlans, studentEnrollPlan, studentEnrolledCourse } = this.state;
        if (event.target.checked) {
            let selectedEnrollPlan;
            for (let i = 0; i < enrollPlans.length; i++) {
                const enrollPlan = enrollPlans[i];
                if (enrollPlan.name === studentEnrollPlan) {
                    selectedEnrollPlan = enrollPlan
                }
            }
            const currentNumOfEnrolledCourse = studentEnrolledCourse[courseDay].length;
            let limitNumOfEnrolledCourse;
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
                alert(`ไม่สามารถเลือกรายวิชาเพิ่มได้ คุณสามารถเลือกได้เพียง ${limitNumOfEnrolledCourse} รายวิชาสำหรับ${translateDayToThai(courseDay)}`)
            }

        } else {
            for (var i = 0; i < studentEnrolledCourse[courseDay].length; i++) {
                if (courseID === studentEnrolledCourse[courseDay][i]) {
                    studentEnrolledCourse[courseDay].splice(i, 1);
                }
            }
            this.setState({ studentEnrolledCourse: studentEnrolledCourse });
        }
        console.log('Current Student Selected Courses: ', this.state.studentEnrolledCourse)

    }

    enrollCourse = (event) => {
        event.preventDefault();
        console.log('enrolling...')
        const { enrollPlans, studentEnrollPlan, studentEnrolledCourse } = this.state;
        if (studentEnrollPlan !== '' && studentEnrollPlan !== undefined) {
            let selectedEnrollPlan;
            for (let i = 0; i < enrollPlans.length; i++) {
                const enrollPlan = enrollPlans[i];
                if (enrollPlan.name === studentEnrollPlan) {
                    selectedEnrollPlan = enrollPlan
                }
            }
            let isStudentEnrolledCourseValid = true;
            for (let i = 0; i < selectedEnrollPlan.plan.length; i++) {
                const dayPlan = selectedEnrollPlan.plan[i];
                if (studentEnrolledCourse[dayPlan.day].length !== dayPlan.numOfCourse) {
                    isStudentEnrolledCourseValid = false;
                }
            }
            if (!isStudentEnrolledCourseValid) {
                alert('เลือกรายวิชาไม่ถูกต้อง');
            } else {
                console.log('เลือกรายวิชาถูกต้อง');
                console.log('รูปแบบ: ', studentEnrollPlan, selectedEnrollPlan.plan)
                console.log('วิชาที่ลงทะเบียน: ', studentEnrolledCourse)
                this.enrollCoursesWithPlan();
            }
        }
    }

    enrollCoursesWithPlan = async () => {
        try {
            this.setState({ isLoading: true });
            const {
                courseYear,
                studentInfo,
                studentEnrollPlan,
                studentEnrolledCourse
            } = this.state;
            const {
                studentID,
                nameTitle,
                nameFirst,
                nameLast,
                studentGrade,
                studentClass,
                studentRoll
            } = studentInfo;
            const studentData = {
                studentID: studentID,
                nameTitle: nameTitle,
                nameFirst: nameFirst,
                nameLast: nameLast,
                studentGrade: studentGrade,
                studentClass: studentClass,
                studentRoll: studentRoll,
                studentEnrollPlan: studentEnrollPlan,
                enrolledCourse: studentEnrolledCourse
            }
            await enroll.checkStudentID(courseYear, studentID);
            for (let i = 0; i < daysArr.length; i++) {
                const day = daysArr[i];
                if (studentEnrolledCourse[day].length > 0) {
                    for (const courseID of studentEnrolledCourse[day]) {
                        await enroll.validateIndividualCourse(courseYear, courseID, studentData);
                    }
                }
            }
            for (let i = 0; i < daysArr.length; i++) {
                const day = daysArr[i];
                if (studentEnrolledCourse[day].length > 0) {
                    for (const courseID of studentEnrolledCourse[day]) {
                        await enroll.updateCourseEnrolledIndividualCourse(courseYear, courseID);
                    }
                }
            }
            await enroll.addStudentDataNew(courseYear, studentData);
            console.log(`Enrollment of student with ID ${studentID} has benn completed!`);
            this.props.goNextStepFunction(studentData);
        } catch (err) {
            console.error(err);
            this.setState({
                isLoading: false,
                isError: true,
                errorMessage: err
            });
        }
    }

    render() {
        const { isLoading, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'home'} />
        } else {
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>ระบบลงทะเบียนรายวิชาเพิ่มเติม</h1>
                        <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                        <h4>ปีการศึกษา {this.props.courseYear}</h4>
                        {this.coursesSelector()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default CoursesSelector;
