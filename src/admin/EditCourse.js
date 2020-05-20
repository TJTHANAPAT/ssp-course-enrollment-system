import React from 'react';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';
import updateCourse from './functions/updateCourseFunction';
import deleteCourse from './functions/deleteCourseFunction';

class EditCourse extends React.Component {
    state = {
        isLoadingComplete: false
    }

    componentDidMount = () => {
        auth.checkAuthState()
            .then(() => {
                return system.getURLParam('courseYear')
            })
            .then(res => {
                const courseYear = res;
                this.setState({ courseYear: courseYear });
                return system.getURLParam('courseID');
            })
            .then(res => {
                const courseID = res;
                const { courseYear } = this.state;
                return system.getCourseData(courseYear, courseID);
            })
            .then(course => {
                const courseDay = course.courseDay !== undefined ? course.courseDay : []
                this.setState({
                    courseName: course.courseName,
                    courseID: course.courseID,
                    courseCapacity: course.courseCapacity,
                    courseTeacher: course.courseTeacher,
                    courseGrade: course.courseGrade,
                    courseDay: courseDay
                })
                console.log(courseDay)
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
                this.setCheckBoxGrade();
                this.setCourseDayCheckBox();
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
            this.setState({ isLoadingComplete: false });
            updateCourse(courseYear, courseData)
                .then(() => {
                    this.setState({
                        isLoadingComplete: true
                    });
                    this.setCheckBoxGrade();
                    this.setCourseDayCheckBox();
                    alert(`บันทึกข้อมูลการแก้ไขรายวิชา ${courseID} ${courseName} สำเร็จ`);
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
            alert('ต้องมีอย่างน้อยหนึ่งชั้นเรียนและหนึ่งวันสำหรับรายวิชานี้');
        }
    }
    UpdateCourseForm = () => {
        return (
            <form onSubmit={this.updateCourse}>
                <div className="form-group">
                    <label htmlFor="courseID">รหัสวิชา</label>
                    <input type="text" className="form-control" id="รหัสวิชา" placeholder="รหัสวิชา" onChange={this.updateInput} value={this.state.courseID} required disabled />
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
                    {this.GradeSelector()}
                </div>
                <div className="form-group">
                    <label htmlFor="courseDay">วันทำการเรียนการสอน</label><br />
                    <i>รายวิชานี้ทำการเรียนการสอนในวัน...</i>
                    {this.daySelector()}
                </div>


                <div className="form-group">
                    <label htmlFor="courseCapacity">จำนวนรับสมัคร</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="courseCapacity" placeholder="จำนวนรับสมัคร" onChange={this.updateInput} value={this.state.courseCapacity} required />
                </div>

                <button type="submit" className="btn btn-purple">บันทึก</button>
                <button onClick={this.initDeleteCourse} className="btn btn-danger ml-2">ลบทิ้ง</button>
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

    handleChangeCourseDay = (event) => {
        const courseDayArr = this.state.courseDay
        if (event.target.checked) {
            console.log(`Checked Day ${event.target.value}`)
            courseDayArr.push(event.target.value)
            let courseDayArrSorted = this.sortCourseDayArr(courseDayArr);
            this.setState({ courseDay: courseDayArrSorted })
            console.log('Current Course Day: ', courseDayArrSorted);
        } else {
            console.log(`Unchecked Day ${event.target.value}`)
            for (var i = 0; i < courseDayArr.length; i++) {
                if (courseDayArr[i] === event.target.value) {
                    courseDayArr.splice(i, 1);
                }
            }
            this.setState({ courseDay: courseDayArr })
            console.log('Current Course Day: ', this.state.courseDay);
        }
    }

    sortCourseDayArr = (courseDayArr) => {
        const daysArr = [
            'sunday',
            'monday', 
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ]
        let courseDayArrSorted = []
        for (let i = 0; i < daysArr.length; i++) {
            for (let j = 0; j < courseDayArr.length; j++) {
                if (daysArr[i] === courseDayArr[j]) {
                    courseDayArrSorted.push(courseDayArr[j])
                }
            }
        }
        return courseDayArrSorted
    }

    uncheckAllDay = (event) => {
        event.preventDefault();
        console.log(this.state.courseDay)
        let checkboxes = document.getElementsByName('courseDayCheckBox')
        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            checkbox.checked = false;
        }
        const courseDay = [];
        this.setState({ courseDay: courseDay });
        console.log('Uncheck All');
        console.log('Current Course Grade: ', courseDay);
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
        let daySelector = daysArr.map((day, i) => {
            return (
                <div className="form-check" key={i}>
                    <input className="form-check-input" type="checkbox" name="courseDayCheckBox" value={day.en} id={`day-${day.en}`} onChange={this.handleChangeCourseDay} />
                    <label className="form-check-label" htmlFor={`day-${day.en}`}>
                        {day.th}
                    </label>
                </div>
            )
        })
        return (
            <div>
                {daySelector}
                <button onClick={this.uncheckAllDay} className="btn btn-green btn-sm mt-1">ยกเลิกการเลือกทั้งหมด</button>
            </div>
        );
    }
    setCourseDayCheckBox = () => {
        const courseDayArr = this.state.courseDay;
        let checkboxes = document.getElementsByName('courseDayCheckBox')
        for (let i = 0; i < courseDayArr.length; i++) {
            const day = courseDayArr[i];
            for (let j = 0; j < checkboxes.length; j++) {
                const checkbox = checkboxes[j];
                if (day === checkbox.value) {
                    checkbox.checked = true;
                }
            }
        }
    }

    // Functions for deleting course data.
    deleteCourse = (event) => {
        event.preventDefault();
        const { courseYear, courseID } = this.state;
        console.log(courseYear, courseID)
        this.setState({ isLoadingComplete: false });
        deleteCourse(courseYear, courseID)
            .then(() => {
                this.setState({
                    isLoadingComplete: true,
                    isDeleteCourseComplete: true
                });
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
    initDeleteCourse = () => {
        this.setState({ isDeleteCourse: true });
    }
    ConfirmDeleteCoursePage = () => {
        const { courseID, courseName, courseYear } = this.state
        return (
            <div className="body body-center bg-gradient">
                <div className="wrapper">
                    <div className="row align-items-center">
                        <div className="col-sm-3 text-center mb-3">
                            <i className="fa fa-exclamation-triangle fa-5x" aria-hidden="false"></i>
                        </div>
                        <div className="col-sm-9 text-left">
                            <h2>ลบรายวิชา {courseID} {courseName}</h2>
                            <p>การกระทำนี้ไม่สามารถย้อนกลับได้ คุณกำลังลบรายวิชา {courseID} {courseName} ปีการศึกษา {courseYear} ข้อมูลของนักเรียนที่ได้ทำการลงทะเบียนในรายวิชานี้ไปแล้วนั้นจะถูกลบด้วยและไม่สามารถกู้คืนได้ กรุณายืนยันที่จะลบรายวิชานี้ทิ้ง</p>
                            {this.ConfirmDeleteCourseForm()}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
    ConfirmDeleteCourseForm = () => {
        const { courseID, isDeleteCourseConfirm } = this.state;
        const setTimeOutThenDo = (timeout, callback) => {
            setTimeout(() => {
                callback()
            }, timeout)
        }
        let handleChangeConfirmDelete = (event) => {
            const iconConfirmStatus = document.getElementById('iconConfirmStatus')
            iconConfirmStatus.className = 'fa fa-circle-o-notch fa-spin fa-fw';
            this.setState({ isDeleteCourseConfirm: false });
            const confirmText = event.target.value
            setTimeOutThenDo(300, () => {
                if (confirmText === courseID) {
                    iconConfirmStatus.className = 'fa fa-check fa-fw';
                    this.setState({ isDeleteCourseConfirm: true });
                } else {
                    iconConfirmStatus.className = 'fa fa-times fa-fw';
                    this.setState({ isDeleteCourseConfirm: false });
                }
            })
        }
        let btnDeleteCourse = () => {
            if (isDeleteCourseConfirm) {
                return <button className="btn btn-danger" type="submit">ลบทิ้ง</button>
            } else {
                return <button className="btn btn-danger" disabled>ลบทิ้ง</button>
            }
        }
        let cancelDeleteProcess = () => {
            this.setState({ isDeleteCourse: false });
        }
        return (
            <form onSubmit={this.deleteCourse} autoComplete="off">
                <span>พิมพ์ '{courseID}' เพื่อยืนยัน</span>
                <div className="input-group mt-2">
                    <div className="input-group-prepend">
                        <div className="input-group-text"><i id="iconConfirmStatus" className="fa fa-times fa-fw"></i></div>
                    </div>
                    <input type="text" className="form-control" id="confirmDeleteCourse" placeholder={courseID} onChange={handleChangeConfirmDelete} value={this.state.confirmDeleteCourse} required />
                </div>
                <div className="mt-2">
                    {btnDeleteCourse()}
                    <button className="btn btn-secondary ml-2" onClick={cancelDeleteProcess} type="button">ย้อนกลับ</button>
                </div>
            </form>
        )
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
                            <p>รายวิชา {courseID} {courseName} ปีการศึกษา {courseYear} และข้อมูลของนักเรียนที่ได้ทำการลงทะเบียนในรายวิชานี้ถูกลบทิ้งสำเร็จแล้ว</p>
                        </div>
                    </div>
                    <button className="btn btn-wrapper-bottom btn-green" onClick={this.goBack}>ย้อนกลับ</button>
                </div>
                <Footer />
            </div>
        )
    }

    render() {
        const { isLoadingComplete, isError, errorMessage, isDeleteCourse, isDeleteCourseComplete } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else if (isDeleteCourseComplete) {
            return this.CompleteDeleteCoursePage();
        } else if (isDeleteCourse) {
            return this.ConfirmDeleteCoursePage();
        } else {
            const { courseID, courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>แก้ไขรายวิชา {courseID}</h1>
                        <p>คุณกำลังแก้ไขรายวิชา {courseID} ปีการศึกษา {courseYear}.</p>
                        {this.UpdateCourseForm()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default EditCourse;