import React from 'react';
import 'firebase/firestore';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from '../functions/adminFunctions/authenticationFuctions';
import * as system from '../functions/systemFunctions';
import createCourse from '../functions/adminFunctions/createCourseFunction';

class CreateCourse extends React.Component {
    state = {
        courseGrade: [],
        isLoading: true
    }

    componentDidMount = async () => {
        try {
            await auth.checkAuthState()
            const courseYear = await system.getURLParam('courseYear');
            const getSystemConfig = await system.getSystemConfig();
            const systemConfig = getSystemConfig.systemConfig;
            const courseYearsArr = systemConfig.courseYears;
            const getCourseYearConfig = await system.getCourseYearConfig(courseYear, courseYearsArr);
            const courseYearConfig = getCourseYearConfig.config;
            this.setState({
                courseYear: courseYear,
                courseYearConfig: courseYearConfig,
                gradesArr: courseYearConfig.grades
            })
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

    goBack = (event) => {
        event.preventDefault();
        window.history.back();
    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    createCourse = (event) => {
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
            courseEnrolled: 0
        }
        if (courseGrade.length !== 0) {
            this.setState({ isLoading: true });
            createCourse(courseYear, courseData)
                .then(() => {
                    this.setState({
                        courseName: '',
                        courseID: '',
                        courseGrade: [],
                        courseDay: [],
                        courseCapacity: '',
                        courseTeacher: '',
                        isLoading: false
                    });
                    let courseGradeCheckBoxes = document.getElementsByName('courseGradeCheckBox')
                    for (let i = 0; i < courseGradeCheckBoxes.length; i++) {
                        const checkbox = courseGradeCheckBoxes[i];
                        checkbox.checked = false;
                    }
                    let courseDayCheckBoxes = document.getElementsByName('courseDayCheckBox')
                    for (let i = 0; i < courseDayCheckBoxes.length; i++) {
                        const checkbox = courseDayCheckBoxes[i];
                        checkbox.checked = false;
                    }
                    alert(`รายวิชา ${courseID} ${courseName} ถูกเพิ่มลงในปีการศึกษา ${courseYear} เรียบร้อยแล้ว`);
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

    handleChangeCourseGrade = (event) => {
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
        console.log('Current Course Grade: ', this.state.courseGrade);
    }

    uncheckAllGrade = (event) => {
        event.preventDefault();
        let checkboxes = document.getElementsByName('courseGradeCheckBox')
        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            checkbox.checked = false;
        }
        const courseGrade = [];
        this.setState({ courseGrade: courseGrade });
        console.log('Uncheck All');
        console.log('Current Course Grade: ', courseGrade);
    }

    gradeSelector = () => {
        const { gradesArr } = this.state
        let gradeSelector = gradesArr.map((grade, i) => {
            return (
                <div className="form-check" key={i}>
                    <input className="form-check-input" type="checkbox" name="courseGradeCheckBox" value={grade} id={`grade-${grade}`} onChange={this.handleChangeCourseGrade} />
                    <label className="form-check-label" htmlFor={`grade-${grade}`}>
                        มัธยมศึกษาปีที่ {grade}
                    </label>
                </div>
            )
        })
        return (
            <div>
                {gradeSelector}
                <button onClick={this.uncheckAllGrade} className="btn btn-green btn-sm mt-1">ยกเลิกการเลือกทั้งหมด</button>
            </div>
        );
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
            <select id="courseDay" className="form-control" onChange={this.updateInput} defaultValue="" required>
                <option value="" disabled>เลือก...</option>
                {dayOptions}
            </select>
        );
    }

    createCourseForm = () => {
        return (
            <form onSubmit={this.createCourse}>
                <div className="form-row">
                    <div className="form-group col-sm-3">
                        <label htmlFor="courseID">รหัสวิชา</label>
                        <input type="text" className="form-control" id="courseID" placeholder="รหัสวิชา" onChange={this.updateInput} required />
                    </div>
                    <div className="form-group col-sm-9">
                        <label htmlFor="courseName">ชื่อรายวิชา</label>
                        <input type="text" className="form-control" id="courseName" placeholder="ชื่อรายวิชา" onChange={this.updateInput} required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="courseTeacher">ชื่อผู้สอน</label>
                    <input type="text" className="form-control" id="courseTeacher" placeholder="ชื่อผู้สอน" onChange={this.updateInput} required />
                </div>
                <div className="form-group">
                    <label htmlFor="courseGrade">ระดับชั้น</label><br />
                    <i>รายวิชานี้สำหรับนักเรียนในชั้น...</i>
                    {this.gradeSelector()}
                </div>
                <div className="form-group">
                    <label htmlFor="courseDay">วันที่ทำการเรียนการสอน</label>
                    {this.daySelector()}
                </div>
                <div className="form-group">
                    <label htmlFor="courseCapacity">จำนวนรับสมัคร</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="courseCapacity" placeholder="จำนวนรับสมัคร" onChange={this.updateInput} required />
                </div>
                <button type="submit" className="btn btn-purple">เพิ่ม</button>
                <button onClick={this.goBack} className="btn btn-secondary ml-2">ย้อนกลับ</button>
            </form>
        )
    }

    render() {
        const { isLoading, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else {
            const { courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>เพิ่มรายวิชาใหม่</h1>
                        <p>คุณกำลังเพิ่มรายวิชาใหม่ในปีการศึกษา {courseYear}</p>
                        {this.createCourseForm()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default CreateCourse;