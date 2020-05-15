import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as system from './functions/systemFunctions';
import LoadingPage from './components/LoadingPage';
import ErrorPage from './components/ErrorPage';
import Footer from './components/Footer';

class GetStudentData extends React.Component {
    state = {
        searchStudentID: '',
        studentID: '',

        courseYearArr: [],
        selectedCourseYear: '',
        lastSearchCourseYear: '',

        isSelectedCourseYearChange: false,
        isLoadingComplete: false,
        isLoadingData: false,
        isGetDataComplete: false,
        isDataExists: false,
        alertMessage: ''
    }
    componentDidMount = () => {
        system.getSystemConfig()
            .then(res => {
                const systemConfig = res.systemConfig;
                const isSearchEnabled = systemConfig.isSearchEnabled;
                if (isSearchEnabled) {
                    const currentCourseYear = systemConfig.currentCourseYear;
                    const courseYearArr = systemConfig.courseYears;
                    this.setState({
                        courseYearArr: courseYearArr,
                        selectedCourseYear: currentCourseYear,
                        isLoadingComplete: true
                    })
                } else {
                    this.setState({
                        isLoadingComplete: true,
                        isError: true,
                        errorMessage: 'ขออภัย การค้นหาข้อมูลนักเรียนถูกปิดการใช้งานโดยผู้ดูแลระบบ'
                    })
                }

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

    updateInputByID = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        })
    }

    selectCourseYear = (event) => {
        const newSelectCourseYear = event.target.value;
        this.setState({ selectedCourseYear: newSelectCourseYear });
    }

    searchStudentByID = (event) => {
        event.preventDefault();
        const {
            searchStudentID,
            studentID,
            selectedCourseYear,
            lastSearchCourseYear
        } = this.state;
        const db = firebase.firestore();
        const studentRef = db.collection(selectedCourseYear).doc('student').collection('student');
        const courseRef = db.collection(selectedCourseYear).doc('course').collection('course');

        if ((searchStudentID !== studentID) || (selectedCourseYear !== lastSearchCourseYear)) {
            this.setState({
                isGetDataComplete: false,
                isLoadingData: true
            });
            studentRef.doc(searchStudentID).get()
                .then(studentDoc => {
                    if (studentDoc.exists) {
                        const {
                            nameTitle,
                            nameFirst,
                            nameLast,
                            studentID,
                            studentGrade,
                            studentClass,
                            studentRoll,
                            enrolledCourse,
                            timestamp
                        } = studentDoc.data();

                        courseRef.doc(enrolledCourse).get()
                            .then(courseDoc => {
                                const { courseName } = courseDoc.data()
                                const studentData = {
                                    studentID: studentID,
                                    nameTitle: nameTitle,
                                    nameFirst: nameFirst,
                                    nameLast: nameLast,
                                    studentGrade: studentGrade,
                                    studentClass: studentClass,
                                    studentRoll: studentRoll,
                                    enrolledCourse: enrolledCourse,
                                    courseName: courseName,
                                    timestamp: new Date(timestamp.seconds * 1000).toLocaleString()
                                }
                                this.setState({
                                    studentID: studentID,
                                    studentData: studentData,
                                    lastSearchCourseYear: selectedCourseYear,
                                    isLoadingData: false,
                                    isGetDataComplete: true,
                                    isDataExists: true,
                                    alertMessage: ''
                                })
                            })
                            .catch(err => {
                                console.error(err);
                                this.setState({
                                    isError: true,
                                    alertMessage: `Error: ${err.message}`
                                });
                            })
                    } else {
                        this.setState({
                            isGetDataComplete: true,
                            isLoadingData: false,
                            isDataExists: false,
                            studentID: searchStudentID,
                            lastSearchCourseYear: selectedCourseYear,
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    this.setState({
                        isError: true,
                        alertMessage: `Error: ${err.message}`
                    });
                })
        }
    }

    studentData = () => {
        const {
            studentData,
            studentID,
            isLoadingData,
            isGetDataComplete,
            isDataExists
        } = this.state;

        if (isLoadingData) {
            return <p><i className="fa fa-circle-o-notch fa-spin fa-fw"></i> กำลังค้นหา...</p>
        } else if (isGetDataComplete && isDataExists) {
            const {
                nameTitle,
                nameFirst,
                nameLast,
                studentID,
                studentGrade,
                studentClass,
                studentRoll,
                enrolledCourse,
                courseName,
                timestamp
            } = studentData
            return (
                <div>
                    <h5>{nameFirst} {nameLast} ({studentID})</h5>
                    <p>
                        ชื่อ-นามสกุล: {nameTitle}{nameFirst} {nameLast}<br />
                        เลขประจำตัวนักเรียน: {studentID}<br />
                        ชั้น: มัธยมศึกษาปีที่ {studentGrade}/{studentClass} เลขที่: {studentRoll}<br />
                        วิชาที่เลือก: {enrolledCourse} {courseName}
                    </p>
                    <p><i>ทำการลงทะเบียนเมื่อ {timestamp}</i></p>
                </div>
            )
        } else if (isGetDataComplete) {
            return (
                <div>
                    <h5>ไม่พบข้อมูลของนักเรียน {studentID} ในระบบ</h5>
                    <p>เลขประจำตัวนักเรียนที่กรอกอาจไม่ถูกต้องหรือยังไม่ได้ทำการลงทะเบียน</p>
                </div>
            )
        }
    }

    render() {
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'home'} />
        } else {
            const {
                searchStudentID,
                courseYearArr,
                selectedCourseYear
            } = this.state;
            const courseYearSelector = courseYearArr.map((courseYear, i) => {
                return <option value={courseYear.year} key={i}>ปีการศึกษา {courseYear.year}</option>
            });
            return (
                <div className="body body-center bg-gradient">
                    <div className="wrapper text-left">
                        <h1>ค้นหา</h1>
                        <p>เลือกปีการศึกษาและกรอกเลขประจำตัวนักเรียนเพื่อดูข้อมูล</p>
                        <select className="form-control mb-3" defaultValue={selectedCourseYear} onChange={this.selectCourseYear}>
                            {courseYearSelector}
                        </select>
                        <form onSubmit={this.searchStudentByID}>
                            <div className="form-group">
                                <input type="number" pattern="[0-9]*" id="searchStudentID" className="form-control" onChange={this.updateInputByID} value={searchStudentID} placeholder="เลขประจำตัวนักเรียน" required />
                            </div>
                            <button type="submit" className="btn btn-purple">ค้นหา</button>
                            <button onClick={this.goBack} className="btn btn-secondary ml-2">กลับ</button>
                        </form>
                        <br />
                        {this.studentData()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default GetStudentData;