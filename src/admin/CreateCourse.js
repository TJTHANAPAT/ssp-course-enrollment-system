import React from 'react';
import 'firebase/firestore';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';
import createCourse from './functions/createCourseFunction';

class CreateCourse extends React.Component {
    state = {
        courseName: '',
        courseID: '',
        courseCapacity: '',
        courseTeacher: '',
        courseGrade: [],
        gradesArr: [],
        isLoadingComplete: false
    }

    componentDidMount = () => {
        auth.checkAuthState()
            .then(() => {
                return system.getURLParam('courseYear');
            })
            .then(res => {
                const courseYear = res;
                this.setState({ courseYear: courseYear });
                return system.getSystemConfig();
            })
            .then(res => {
                const courseYearsArr = res.systemConfig.courseYears;
                const { courseYear } = this.state;
                return system.getCourseYearGrades(courseYear, courseYearsArr);
            })
            .then(res => {
                this.setState({
                    gradesArr: res.grades,
                    isLoadingComplete: true
                })
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
            courseCapacity
        } = this.state
        const courseData = {
            courseName: courseName,
            courseID: courseID,
            courseGrade: courseGrade,
            courseTeacher: courseTeacher,
            courseCapacity: parseInt(courseCapacity),
            courseEnrolled: 0
        }
        if (courseGrade.length !== 0) {
            this.setState({ isLoadingComplete: false });
            createCourse(courseYear, courseData)
                .then(() => {
                    this.setState({
                        courseName: '',
                        courseID: '',
                        courseGrade: [],
                        courseCapacity: '',
                        courseTeacher: '',
                        isLoadingComplete: true
                    });
                    let checkboxes = document.getElementsByName('courseGradeCheckBox')
                    for (let i = 0; i < checkboxes.length; i++) {
                        const checkbox = checkboxes[i];
                        checkbox.checked = false;
                    }
                    alert(`รายวิชา ${courseID} ${courseName} ถูกเพิ่มลงในปีการศึกษา ${courseYear} เรียบร้อยแล้ว`);
                })
                .catch(err => {
                    console.error(err);
                    this.setState({
                        isLoadingComplete: true,
                        isError: true,
                        errorMessage: err
                    })
                })
        } else {
            alert('ต้องมีอย่างน้อยหนึ่งชั้นเรียนสำหรับรายวิชานี้');
        }
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
        console.log('Current Course Grade: ', courseGrade);
    }

    gradeSelector = () => {
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
                <button onClick={this.uncheckAll} className="btn btn-green btn-sm mt-1">ยกเลิกการเลือกทั้งหมด</button>
            </div>
        );
    }

    createCourseForm = () => {
        return (
            <form onSubmit={this.createCourse}>
                <div className="form-group">
                    <label htmlFor="courseID">รหัสวิชา</label>
                    <input type="text" className="form-control" id="courseID" placeholder="รหัสวิชา" onChange={this.updateInput} value={this.state.courseID} required />
                </div>
                <div className="form-group">
                    <label htmlFor="courseName">ชื่อรายวิชา</label>
                    <input type="text" className="form-control" id="courseName" placeholder="ชื่อรายวิชา" onChange={this.updateInput} value={this.state.courseName} required />
                </div>
                <div className="form-group">
                    <label htmlFor="courseTeacher">ชื่อผู้สอน</label>
                    <input type="text" className="form-control" id="courseTeacher" placeholder="ชื่อผู้สอน" onChange={this.updateInput} value={this.state.courseTeacher} required />
                </div>
                <div className="form-group">
                    <label htmlFor="courseGrade">ระดับชั้น</label><br />
                    <i>รายวิชานี้สำหรับนักเรียนในชั้น</i>
                    {this.gradeSelector()}
                </div>
                <div className="form-group">
                    <label htmlFor="courseCapacity">จำนวนรับสมัคร</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="courseCapacity" placeholder="จำนวนรับสมัคร" onChange={this.updateInput} value={this.state.courseCapacity} required />
                </div>
                <button type="submit" className="btn btn-purple">เพิ่ม</button> <button onClick={this.goBack} className="btn btn-secondary">ย้อนกลับ</button>
            </form>
        )
    }

    render() {
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
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