import React from 'react';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import * as system from '../functions/systemFunctions';
import * as auth from '../functions/adminFunctions/authenticationFuctions';
import updateCourse from '../functions/adminFunctions/updateCourseFunction';
import deleteCourse from '../functions/adminFunctions/deleteCourseFunction';

class EditCourse extends React.Component {
    state = {
        isLoading: true
    }

    componentDidMount = async () => {
        try {
            await auth.checkAuthState();
            const courseYear = await system.getURLParam('courseYear');
            const courseID = await system.getURLParam('courseID');
            const course = await system.getCourseData(courseYear, courseID);
            const getCourseYearConfig = await system.getCourseYearConfig(courseYear, false);
            this.setState({
                courseYear: courseYear,
                gradesArr: getCourseYearConfig.config.grades,

                courseName: course.courseName,
                courseID: course.courseID,
                courseCapacity: course.courseCapacity,
                courseTeacher: course.courseTeacher,
                courseGrade: course.courseGrade,
                courseDay: course.courseDay
            })
            this.setState({ isLoading: false });
            this.setCheckBoxGrade();
        }
        catch (err) {
            console.error(err);
            this.setState({
                isError: true,
                errorMessage: err
            });
        }
        finally {
            this.setState({ isLoading: false });
        }
    }

    goBack = () => {
        window.history.back();
    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    // Functions for updating course data.
    updateCourse = (event) => {
        event.preventDefault();
        const {
            courseYear,
            courseName,
            courseID,
            courseTeacher,
            courseGrade,
            courseDay,
            courseCapacity
        } = this.state
        const courseData = {
            courseName: courseName,
            courseID: courseID,
            courseGrade: courseGrade,
            courseDay: courseDay,
            courseTeacher: courseTeacher,
            courseCapacity: parseInt(courseCapacity),
        }
        if (courseGrade.length !== 0 && courseDay.length !== 0) {
            this.setState({ isLoading: true });
            updateCourse(courseYear, courseData)
                .then(() => {
                    this.setState({
                        isLoading: false
                    });
                    this.setCheckBoxGrade();
                    alert(`บันทึกข้อมูลการแก้ไขรายวิชา ${courseID} ${courseName} ปีการศึกษา ${courseYear} สำเร็จ`);
                })
                .catch(err => {
                    console.error(err);
                    this.setState({
                        isLoading: false,
                        isError: true,
                        errorMessage: err
                    })
                })
        } else {
            alert('ต้องมีอย่างน้อยหนึ่งชั้นเรียนสำหรับรายวิชานี้');
        }
    }
    UpdateCourseForm = () => {
        return (
            <form onSubmit={this.updateCourse}>
                <div className="form-row">
                    <div className="form-group col-sm-3">
                        <label htmlFor="courseID">รหัสวิชา</label>
                        <input type="text" className="form-control" id="รหัสวิชา" placeholder="รหัสวิชา" onChange={this.updateInput} value={this.state.courseID} required disabled />
                    </div>
                    <div className="form-group col-sm-9">
                        <label htmlFor="courseName">ชื่อรายวิชา</label>
                        <input type="text" className="form-control" id="courseName" placeholder="ชื่อรายวิชา" onChange={this.updateInput} value={this.state.courseName} required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="courseTeacher">ชื่อผู้สอน</label>
                    <input type="text" className="form-control" id="courseTeacher" placeholder="ชื่อผู้สอน" onChange={this.updateInput} value={this.state.courseTeacher} required />
                </div>
                <div className="form-group">
                    <label htmlFor="courseGrade">ระดับชั้น</label><br />
                    <i>รายวิชานี้สำหรับนักเรียนในชั้น</i>
                    {this.GradeSelector()}
                </div>
                <div className="form-group">
                    <label htmlFor="courseDay">วันที่ทำการเรียนการสอน</label><br />
                    {this.daySelector()}
                </div>
                <div className="form-group">
                    <label htmlFor="courseCapacity">จำนวนรับสมัคร</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="courseCapacity" placeholder="จำนวนรับสมัคร" onChange={this.updateInput} value={this.state.courseCapacity} required />
                </div>
                <button type="submit" className="btn btn-purple">บันทึก</button>
                <button onClick={this.deleteCourse} className="btn btn-danger ml-2">ลบทิ้ง</button>
                <button onClick={this.goBack} className="btn btn-secondary ml-2">ย้อนกลับ</button>
            </form>
        )
    }

    GradeSelector = () => {
        const { gradesArr } = this.state
        let gradeSelector = gradesArr.map((grade, i) => {
            return (
                <div className="form-check" key={i}>
                    <input className="form-check-input" type="checkbox" name="courseGradeCheckBox" value={grade} id={`grade-${grade}`} onChange={this.updateCourseGrade} />
                    <label className="form-check-label" htmlFor={`grade-${grade}`}>
                        มัธยมศึกษาปีที่ {grade}
                    </label>
                </div>
            )
        })
        return (
            <div>
                {gradeSelector}
                <button onClick={this.uncheckAll} className="btn btn-green btn-sm mt-1">Uncheck All</button>
            </div>
        );
    }
    updateCourseGrade = (event) => {
        const courseGradeArr = this.state.courseGrade
        if (event.target.checked) {
            console.log(`Checked Grade ${event.target.value}`)
            courseGradeArr.push(parseInt(event.target.value))
            courseGradeArr.sort((a, b) => a - b)
            this.setState({ courseGrade: courseGradeArr })
        } else {
            console.log(`Unchecked Grade ${event.target.value}`)
            for (var i = 0; i < courseGradeArr.length; i++) {
                if (courseGradeArr[i] === parseInt(event.target.value)) {
                    courseGradeArr.splice(i, 1);
                }
            }
            this.setState({ courseGrade: courseGradeArr })
        }
        console.log('Current GradesArr: ', this.state.gradesArr);
        console.log('Current Course Grade: ', this.state.courseGrade);
    }
    uncheckAll = (event) => {
        event.preventDefault();
        let checkboxes = document.getElementsByName('courseGradeCheckBox')
        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            checkbox.checked = false;
        }
        const courseGrade = [];
        this.setState({ courseGrade: courseGrade });
        console.log('Uncheck All');
        console.log('Current GradesArr: ', this.state.gradesArr);
        console.log('Current Course Grade: ', courseGrade);
    }
    setCheckBoxGrade = () => {
        const courseGradeArr = this.state.courseGrade;
        let checkboxes = document.getElementsByName('courseGradeCheckBox')
        for (let i = 0; i < courseGradeArr.length; i++) {
            const grade = courseGradeArr[i];
            for (let j = 0; j < checkboxes.length; j++) {
                const checkbox = checkboxes[j];
                if (grade === parseInt(checkbox.value)) {
                    checkbox.checked = true;
                }
            }
        }
    }

    daySelector = () => {
        const daysArr = [
            { en: 'sunday', th: 'วันอาทิตย์' },
            { en: 'monday', th: 'วันจันทร์' },
            { en: 'tuesday', th: 'วันอังคาร' },
            { en: 'wednesday', th: 'วันพุธ' },
            { en: 'thursday', th: 'วันพฤหัสบดี' },
            { en: 'friday', th: 'วันศุกร์' },
            { en: 'saturday', th: 'วันเสาร์' },
        ]
        let dayOptions = daysArr.map((day, i) => {
            return <option key={i} value={day.en}>{day.th}</option>
        })
        return (
            <select id="courseDay" className="form-control" onChange={this.updateInput} defaultValue={this.state.courseDay} required>
                <option value="" disabled>เลือก...</option>
                {dayOptions}
            </select>
        );
    }

    // Functions for deleting course data.
    deleteCourse = async (event) => {
        try {
            event.preventDefault();
            const confirmDelete = window.confirm('คุณยืนยันที่จะลบรายวิชานี้หรือไม่');
            if (confirmDelete) {
                this.setState({ isLoading: true });
                const { courseYear, courseID } = this.state;
                console.log(`Deleting course ${courseID}...`)
                const courseData = await system.getCourseData(courseYear, courseID);
                console.log(courseData);
                if (courseData.courseEnrolled === 0) {
                    await deleteCourse(courseYear, courseID);
                    this.setState({ isDeleteCourseComplete: true });
                } else {
                    const err = 'ข้อมูลของนักเรียนทุกคนที่ทำการลงทะเบียนในรายวิชานี้ต้องถูกลบทิ้งก่อนทำการลบรายวิชานี้';
                    throw err;
                }
            }
        }
        catch (err) {
            console.error(err);
            this.setState({
                isError: true,
                errorMessage: err
            });
        }
        finally {
            this.setState({ isLoading: false });
        }
    }

    CompleteDeleteCoursePage = () => {
        const { courseID, courseName, courseYear } = this.state
        return (
            <div className="body body-center bg-gradient">
                <div className="wrapper">
                    <div className="row align-items-center">
                        <div className="col-sm-3 text-center mb-3">
                            <i className="fa fa-trash-o fa-5x" aria-hidden="false"></i>
                        </div>
                        <div className="col-sm-9 text-left">
                            <h2>ลบรายวิชา {courseID} {courseName} สำเร็จ</h2>
                            <p>รายวิชา {courseID} {courseName} ปีการศึกษา {courseYear} ถูกลบทิ้งสำเร็จแล้ว</p>
                        </div>
                    </div>
                    <button className="btn btn-wrapper-bottom btn-green" onClick={this.goBack}>ย้อนกลับ</button>
                </div>
                <Footer />
            </div>
        )
    }

    render() {
        const { isLoading, isError, errorMessage, isDeleteCourseComplete } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else if (isDeleteCourseComplete) {
            return this.CompleteDeleteCoursePage();
        } else {
            const { courseID, courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>แก้ไขรายวิชา {courseID}</h1>
                        <p>คุณกำลังแก้ไขรายวิชา {courseID} ปีการศึกษา {courseYear}</p>
                        {this.UpdateCourseForm()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default EditCourse;