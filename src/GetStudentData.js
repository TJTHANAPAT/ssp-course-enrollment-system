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
        isLoading: true,
        isLoadingData: false,
        isGetDataComplete: false,
        isDataExists: false,
        alertMessage: ''
    }
    async componentDidMount() {
        try {
            const getSystemConfig = await system.getSystemConfig();
            const systemConfig = await getSystemConfig.systemConfig;
            const isSearchEnabled = systemConfig.isSearchEnabled;
            if (isSearchEnabled) {
                const currentCourseYear = systemConfig.currentCourseYear;
                const courseYearArr = systemConfig.courseYears;
                this.setState({
                    courseYearArr: courseYearArr,
                    selectedCourseYear: currentCourseYear,
                    isLoading: false
                })
            } else {
                const err = 'การค้นหาข้อมูลนักเรียนถูกปิดการใช้งานโดยผู้ดูแลระบบ';
                throw err;
            }
        }
        catch (err) {
            console.error(err);
            this.setState({
                isLoading: false,
                isError: true,
                errorMessage: err
            })
        }
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
        if ((searchStudentID !== studentID) || (selectedCourseYear !== lastSearchCourseYear)) {
            this.setState({
                isGetDataComplete: false,
                isLoadingData: true
            });
            studentRef.doc(searchStudentID).get()
                .then(studentDoc => {
                    if (studentDoc.exists) {
                        const { studentID } = studentDoc.data();
                        this.setState({
                            studentID: studentID,
                            studentData: studentDoc.data(),
                            lastSearchCourseYear: selectedCourseYear,
                            isLoadingData: false,
                            isGetDataComplete: true,
                            isDataExists: true,
                            alertMessage: ''
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
            isLoadingData,
            isGetDataComplete,
            isDataExists
        } = this.state;

        if (isLoadingData) {
            return <p><i className="fa fa-circle-o-notch fa-spin fa-fw"></i> กำลังค้นหา...</p>
        } else if (isGetDataComplete && isDataExists) {
            const { studentData } = this.state;
            const {
                nameTitle,
                nameFirst,
                nameLast,
                studentID,
                studentGrade,
                studentClass,
                studentRoll,
                enrolledCourse
            } = studentData
            const studentEnrollPlan = studentData.studentEnrollPlan !== undefined ? studentData.studentEnrollPlan : 'ลงทะเบียนในระบบรูปแบบเก่า';
            const timestamp = studentData.timestamp !== undefined ? new Date(studentData.timestamp.seconds * 1000).toLocaleString() : 'ไม่พบข้อมูลเวลาการลงทะเบียน';
            let studentEnrolledCourseDetail;
            if (studentData.studentEnrollPlan !== undefined) {
                const daysArr = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday'
                ]
                let studentEnrolledCourse = [];
                for (let i = 0; i < daysArr.length; i++) {
                    const day = daysArr[i];
                    if (enrolledCourse[day] !== undefined) {
                        if (enrolledCourse[day].length > 0) {
                            let enrolledCourseDay = {
                                day: day,
                                numOfCourse: enrolledCourse[day].length,
                                course: enrolledCourse[day]
                            }
                            studentEnrolledCourse.push(enrolledCourseDay)
                        }
                    }
                }
                
                studentEnrolledCourseDetail = studentEnrolledCourse.map((detail, i) => {
                    const enrolledCourseDetail = detail.course.map((courseID, j) => {
                    return <li className="list-group-item py-2" key={j}>{courseID}</li>
                    })
                    return (
                        <div key={i} className="my-3">
                            <h6>{detail.numOfCourse} รายวิชาสำหรับ{system.translateDayToThai(detail.day)}</h6>
                            <ul className="list-group">
                                {enrolledCourseDetail}
                            </ul>
                        </div>
                    )
                })
            } else {
                studentEnrolledCourseDetail = `วิชาที่ลงทะเบียน: ${enrolledCourse}`
            }
            
            return (
                <div>
                    <h5>{nameFirst} {nameLast} ({studentID})</h5>
                    <p>
                        ชื่อ-นามสกุล: {nameTitle}{nameFirst} {nameLast}<br />
                        เลขประจำตัวนักเรียน: {studentID}<br />
                        ชั้น: มัธยมศึกษาปีที่ {studentGrade}/{studentClass} เลขที่: {studentRoll}<br/>
                        รูปแบบการลงทะเบียน: {studentEnrollPlan}
                    </p>
                    {studentEnrolledCourseDetail}
                    <p><i>ทำการลงทะเบียนเมื่อ {timestamp}</i></p>
                </div>
            )
        } else if (isGetDataComplete) {
            const { studentID } = this.state;
            return (
                <div>
                    <h5>ไม่พบข้อมูลของนักเรียน {studentID} ในระบบ</h5>
                    <p>เลขประจำตัวนักเรียนที่กรอกอาจไม่ถูกต้องหรือยังไม่ได้ทำการลงทะเบียน</p>
                </div>
            )
        }
    }

    render() {
        const { isLoading, isError, errorMessage } = this.state;
        if (isLoading) {
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