import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';
import Footer from '../components/Footer';

class ManageStudent extends React.Component {
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
        auth.checkAuthState()
            .then(() => {
                return system.getURLParam('courseYear');
            })
            .then(res => {
                this.setState({ selectedCourseYear: res });
                return system.getSystemConfig();
            })
            .then(res => {
                const systemConfig = res.systemConfig;
                const courseYearArr = systemConfig.courseYears;
                this.setState({
                    courseYearArr: courseYearArr,
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

    updateStudentData = (event) => {
        const studentData = this.state.studentData;
        const newStudentData = { ...studentData, ...{ [event.target.id]: event.target.value } };
        this.setState({ studentData: newStudentData });
    }

    saveStudentData = (event) => {
        event.preventDefault();
        this.setState({ isLoadingComplete: false });
        const courseYear = this.state.lastSearchCourseYear;
        const { studentData } = this.state;
        const studentID = studentData.studentID
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
        studentRef.update(studentData)
            .then(() => {
                this.setState({ isLoadingComplete: true });
                alert('Update student data successfully!');
            })
            .catch(err => {
                this.setState({ isLoadingComplete: true });
                alert('Failed updating student data.');
                console.error(err);
            })
    }

    deleteStudentData = (event) => {
        event.preventDefault();
        const courseYear = this.state.lastSearchCourseYear;
        const { studentData } = this.state;
        const { studentID, enrolledCourse } = studentData
        console.log('Delete Student Data.')
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(enrolledCourse);
        const confirmDelete = window.confirm('คุณยืนยันที่จะลบข้อมูลของนักเรียนคนนี้หรือไม่');
        if (confirmDelete) {
            this.setState({ isLoadingComplete: false });
            studentRef.delete()
                .then(() => {
                    courseRef.get()
                        .then(doc => {
                            const courseEnrolled = doc.data().courseEnrolled;
                            const updateCourseEnrolled = courseEnrolled - 1;
                            courseRef.update({ courseEnrolled: updateCourseEnrolled })
                                .then(() => {
                                    this.setState({ isLoadingComplete: true });
                                    alert('ข้อมูลของนักเรียนคนนี้ถูกลบทิ้งสำเร็จแล้ว')
                                    window.location.reload();
                                })
                                .catch(err => {
                                    console.log(err);
                                    alert('มีบางอย่างผิดพลาด การลบข้อมูลของนักเรียนคนนี้ทิ้งไม่สำเร็จ')
                                })
                        })
                        .catch(err => {
                            console.log(err);
                            alert('มีบางอย่างผิดพลาด การลบข้อมูลของนักเรียนคนนี้ทิ้งไม่สำเร็จ')
                        })
                })
                .catch(err => {
                    console.log(err);
                    alert('มีบางอย่างผิดพลาด การลบข้อมูลของนักเรียนคนนี้ทิ้งไม่สำเร็จ')
                })

        }

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
                                    timestamp: timestamp
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
                            lastSearchCourseYear: selectedCourseYear
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
            const { lastSearchCourseYear } = this.state;
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
            const updateInput = this.updateStudentData;
            return (
                <div>
                    <h4>นักเรียน {studentID} ปีการศึกษา {lastSearchCourseYear}</h4>
                    <form onSubmit={this.saveStudentData}>
                        <div className="form-group">
                            <label htmlFor="studentID">เลขประจำตัวนักเรียน</label>
                            <input type="number" className="form-control" id="studentID" placeholder="เลขประจำตัวนักเรียน" value={studentID} disabled />
                        </div>
                        <div className="form-row">
                            <div className="col-sm-2 form-group">
                                <label htmlFor="nameTitle">คำนำหน้า</label>
                                <select id="nameTitle" className="form-control" onChange={updateInput} defaultValue={nameTitle} required>
                                    <option value="" disabled>เลือก...</option>
                                    <option value="เด็กชาย">เด็กชาย</option>
                                    <option value="เด็กหญิง">เด็กหญิง</option>
                                    <option value="นาย">นาย</option>
                                    <option value="นางสาว">นางสาว</option>
                                </select>
                            </div>
                            <div className="col-sm-5 form-group">
                                <label htmlFor="nameFirst">ชื่อจริง</label>
                                <input type="text" className="form-control" id="nameFirst" placeholder="ชื่อจริง" onChange={updateInput} value={nameFirst} required />
                            </div>
                            <div className="col-sm-5 form-group">
                                <label htmlFor="nameLast">นามสกุล</label>
                                <input type="text" className="form-control" id="nameLast" placeholder="นามสกุล" onChange={updateInput} value={nameLast} required />
                            </div>

                            <div className="col-sm-4 form-group">
                                <label htmlFor="studentGrade">ระดับชั้น</label>
                                <input type="number" pattern="[0-9]*" className="form-control" id="studentGrade" placeholder="ระดับชั้น" value={studentGrade} disabled />
                            </div>
                            <div className="col-sm-4 form-group">
                                <label htmlFor="studentClass">ห้องเรียน</label>
                                <input type="number" pattern="[0-9]*" className="form-control" id="studentClass" placeholder="ห้องเรียน" onChange={updateInput} value={studentClass} required />
                            </div>
                            <div className="col-sm-4 form-group">
                                <label htmlFor="studentRoll">เลขที่</label>
                                <input type="number" pattern="[0-9]*" className="form-control" id="studentRoll" placeholder="เลขที่" onChange={updateInput} value={studentRoll} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nameLast">วิชาที่ลงทะเบียน</label>
                            <input type="text" className="form-control" value={`${enrolledCourse} ${courseName}`} disabled />
                            <p><i>ทำการลงทะเบียนเมื่อ {new Date(timestamp.seconds * 1000).toLocaleString()}</i></p>
                        </div>
                        <div>
                            <button type="submit" className="btn btn-purple m-1">บันทึก</button>
                            <button className="btn btn-danger m-1" onClick={this.deleteStudentData}>ลบทิ้ง</button>
                        </div>
                    </form>
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
                        <h1>การจัดการนักเรียน</h1>
                        <p>เลือกปีการศึกษาและกรอกเลขประจำตัวนักเรียนเพื่อดูข้อมูล</p>
                        <select className="form-control mb-3" defaultValue={selectedCourseYear} onChange={this.selectCourseYear}>
                            {courseYearSelector}
                        </select>
                        <form onSubmit={this.searchStudentByID}>
                            <div className="form-group">
                                <input type="text" id="searchStudentID" className="form-control" onChange={this.updateInputByID} value={searchStudentID} placeholder="เลขประจำตัวนักเรียน" required />
                            </div>
                            <button type="submit" className="btn btn-purple">ค้นหา</button>
                            <button onClick={this.goBack} className="btn btn-secondary ml-2">ย้อนกลับ</button>
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

export default ManageStudent;