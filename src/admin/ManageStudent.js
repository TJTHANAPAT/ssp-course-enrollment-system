import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as system from '../functions/systemFunctions';
import * as auth from '../functions/adminFunctions/authenticationFuctions';
import * as deleteStudent from '../functions/adminFunctions/deleteStudentFunction';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';
import Footer from '../components/Footer';

class GetStudentData extends React.Component {
    state = {
        searchStudentID: '',
        studentID: '',
        lastSearchCourseYear: '',

        isLoading: true,
        isLoadingStudentData: false,
        isGetStudentDataComplete: false,
        isStudentDataExists: false
    }
    componentDidMount = async () => {
        try {
            await auth.checkAuthState();
            const selectedCourseYear = await system.getURLParam('courseYear');
            const getSystemConfig = await system.getSystemConfig();
            const systemConfig = await getSystemConfig.systemConfig;
            const courseYearArr = systemConfig.courseYears;
            this.setState({
                selectedCourseYear: selectedCourseYear,
                courseYearArr: courseYearArr
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

    updateInputByID = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        })
    }

    selectCourseYear = (event) => {
        const newSelectCourseYear = event.target.value;
        this.setState({ selectedCourseYear: newSelectCourseYear });
    }

    getCourseName = (courseID, coursesData) => {
        for (let i = 0; i < coursesData.length; i++) {
            const course = coursesData[i];
            if (courseID === course.courseID) {
                return course.courseName;
            }
        }
    }

    getStudentData = (studentID, courseYear) => {
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student');
        return new Promise((resolve, reject) => {
            studentRef.doc(studentID).get()
                .then(doc => {
                    if (doc.exists) {
                        const studentData = {
                            data: doc.data(),
                            isExists: true
                        }
                        resolve(studentData);
                    } else {
                        const studentData = {
                            data: null,
                            isExists: false
                        }
                        resolve(studentData);
                    }
                })
                .catch(err => {
                    console.error(err);
                    const errorMessage = `Failed getting student ${studentID} data in course year ${courseYear}. ${err.message}`;
                    reject(errorMessage)
                })
        })
    }

    getCourseData(courseYear = '', courseID = '') {
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
        return new Promise((resolve, reject) => {
            courseRef.get()
                .then(doc => {
                    if (doc.exists) {
                        resolve(doc.data());
                    } else {
                        resolve({
                            courseID: courseID,
                            courseName: 'รายวิชานี้อาจถูกลบออกจากระบบ โปรดติดต่อผู้ดูแลระบบสำหรับข้อมูลเพิ่มเติม'
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    const errorMessage = `Firebase failed getting course data of course ${courseID} in ${courseYear}. ${err.message}`;
                    reject(errorMessage);
                })
        })
    }

    searchStudentByID = async (event) => {
        try {
            event.preventDefault();
            const {
                searchStudentID,
                studentID,
                selectedCourseYear,
                lastSearchCourseYear
            } = this.state;
            if ((searchStudentID !== studentID) || (selectedCourseYear !== lastSearchCourseYear)) {
                this.setState({
                    isGetStudentDataComplete: false,
                    isLoadingStudentData: true
                });
                const studentData = await this.getStudentData(searchStudentID, selectedCourseYear);
                let enrolledCoursesID = [];
                let enrolledCoursesData = [];
                if (studentData.isExists && studentData.data.studentEnrollPlan !== undefined) {
                    const daysArr = [
                        'sunday',
                        'monday',
                        'tuesday',
                        'wednesday',
                        'thursday',
                        'friday',
                        'saturday'
                    ]
                    for (let i = 0; i < daysArr.length; i++) {
                        const day = daysArr[i];
                        if (studentData.data.enrolledCourse[day].length > 0) {
                            console.log(studentData.data.enrolledCourse[day])
                            studentData.data.enrolledCourse[day].forEach(courseID => {
                                enrolledCoursesID.push(courseID)
                            });
                        }
                    }
                    console.log(enrolledCoursesID)

                    for (const courseID of enrolledCoursesID) {
                        const courseData = await this.getCourseData(selectedCourseYear, courseID);
                        enrolledCoursesData.push(courseData);
                    }
                    studentData.data.enrolledCoursesData = enrolledCoursesData
                    console.log(enrolledCoursesData)
                }
                this.setState({
                    studentID: searchStudentID,
                    studentData: studentData.data,
                    isStudentDataExists: studentData.isExists,
                    isGetStudentDataComplete: true,
                    isLoadingStudentData: false,
                    lastSearchCourseYear: selectedCourseYear,
                })
            }
        }
        catch (err) {
            console.error(err);
            this.setState({
                isError: true,
                errorMessage: err
            });
        }
    }

    studentData = () => {
        const {
            isLoadingStudentData,
            isGetStudentDataComplete,
            isStudentDataExists
        } = this.state;

        if (isLoadingStudentData) {
            return <p><i className="fa fa-circle-o-notch fa-spin fa-fw"></i> กำลังค้นหา...</p>
        } else if (isGetStudentDataComplete && isStudentDataExists) {
            const { studentData, lastSearchCourseYear } = this.state;
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
                        return <li className="list-group-item list-item-disabled py-2" key={j}>{courseID} {this.getCourseName(courseID, studentData.enrolledCoursesData)}</li>
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

            const updateInput = this.updateStudentData;

            return (
                <div>
                    <h4>นักเรียนหมายเลขประจำตัว {studentID} ปีการศึกษา {lastSearchCourseYear}</h4>
                    <form onSubmit={this.saveUpdateStudentData}>
                        <div className="form-group">
                            <label htmlFor="studentID">เลขประจำตัวนักเรียน</label>
                            <input type="number" className="form-control" id="studentID" value={studentID} disabled />
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
                            <label htmlFor="studentID">รูปแบบการลงทะเบียน</label>
                            <input type="text" className="form-control" id="studentEnrollPlan" value={studentEnrollPlan} disabled />
                        </div>
                        {studentEnrolledCourseDetail}
                        <p><i>ทำการลงทะเบียนเมื่อ {timestamp}</i></p>
                        <button type="submit" className="btn btn-purple">บันทึก</button>
                        <button className="btn btn-danger ml-2" onClick={this.deleteStudentData}>ลบทิ้ง</button>
                    </form>
                </div>
            )
        } else if (isGetStudentDataComplete) {
            const { studentID } = this.state;
            return (
                <div>
                    <h5>ไม่พบข้อมูลของนักเรียน {studentID} ในระบบ</h5>
                    <p>เลขประจำตัวนักเรียนที่กรอกอาจไม่ถูกต้องหรือยังไม่ได้ทำการลงทะเบียน</p>
                </div>
            )
        }
    }

    updateStudentData = (event) => {
        const studentData = this.state.studentData;
        const newStudentData = { ...studentData, ...{ [event.target.id]: event.target.value } };
        console.log('NewStudentData', newStudentData)
        this.setState({ studentData: newStudentData });
    }

    saveUpdateStudentData = (event) => {
        event.preventDefault();
        this.setState({ isLoading: true });
        const courseYear = this.state.lastSearchCourseYear;
        const { studentData } = this.state;
        const {
            nameTitle,
            nameFirst,
            nameLast,
            studentClass,
            studentRoll
        } = studentData;
        const newStudentData = {
            nameTitle: nameTitle,
            nameFirst: nameFirst,
            nameLast: nameLast,
            studentClass: studentClass,
            studentRoll: studentRoll
        }
        const studentID = studentData.studentID
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
        studentRef.update(newStudentData)
            .then(() => {
                this.setState({ isLoading: false });
                alert('Update student data successfully!');
            })
            .catch(err => {
                this.setState({ isLoading: false });
                alert('Failed updating student data.');
                console.error(err);
            })
    }

    deleteStudentData = async (event) => {
        try {
            event.preventDefault();
            const confirmDelete = window.confirm('คุณยืนยันที่จะลบข้อมูลของนักเรียนคนนี้หรือไม่');
            if (confirmDelete) {
                const { studentData, lastSearchCourseYear } = this.state;
                const { studentID, enrolledCourse } = studentData;
                const courseYear = lastSearchCourseYear;
                const studentEnrolledCourse = enrolledCourse;
                console.log(`Deleting ${studentID}...`)
                this.setState({ isLoading: true });
                const daysArr = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday'
                ]
                for (let i = 0; i < daysArr.length; i++) {
                    const day = daysArr[i];
                    if (studentEnrolledCourse[day].length > 0) {
                        for (const courseID of studentEnrolledCourse[day]) {
                            await deleteStudent.updateCourseEnrolledIndividualCourse(courseYear, courseID)
                        }
                    }
                }
                await deleteStudent.deleteStudentData(studentID, courseYear)
                alert('ข้อมูลของนักเรียนคนนี้ถูกลบทิ้งสำเร็จแล้ว')
                window.location.reload();
                this.setState({ isLoading: false });
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
                        <h1>การจัดการนักเรียน</h1>
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