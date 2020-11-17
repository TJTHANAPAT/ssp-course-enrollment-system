import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from '../functions/adminFunctions/authenticationFuctions';
import * as system from '../functions/systemFunctions';

class ViewCourse extends React.Component {
    state = {
        isLoading: true,
    }

    componentDidMount = async () => {
        try {
            await auth.checkAuthState();
            const courseYear = await system.getURLParam('courseYear');
            const courseID = await system.getURLParam('courseID');
            const course = await system.getCourseData(courseYear, courseID);
            this.setState({
                courseYear: courseYear,
                courseID: courseID,
            })
            this.getCourseData(courseYear, courseID)
            this.getCourseStudentsData(courseYear, courseID, course.courseDay)
        }
        catch (err) {
            console.error(err);
            this.setState({
                isError: true,
                errorMessage: err,
                isLoading: false
            });
        }
    }

    goBack = (event) => {
        event.preventDefault()
        window.history.back();
    }

    convertToCSV = (objectArr) => {
        const array = [Object.keys(objectArr[0])].concat(objectArr)
        return array.map(it => {
            return Object.values(it).toString()
        }).join('\n')
    }

    exportCSVFile = (objectArr, fileTitle) => {
        var csv = this.convertToCSV(objectArr);
        console.log(csv);
        var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

        var blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    exportStudentList = (event) => {
        event.preventDefault();
        const { studentsArr, courseYear, courseID } = this.state;
        let fileTitle = `${courseYear}_${courseID}`;
        let studentsArrFormated = [];
        studentsArr.map(student => {
            let studentDataFormated = {
                เลขประจำตัว: student.studentID,
                คำนำหน้า: student.nameTitle,
                ชื่อ: student.nameFirst,
                นามสกุล: student.nameLast,
                ชั้น: student.studentGrade,
                ห้อง: student.studentClass,
                เลขที่: student.studentRoll,
                วิชาที่ลงทะเบียน: courseID
            }
            studentsArrFormated.push(studentDataFormated);
            return null;
        })
        this.exportCSVFile(studentsArrFormated, fileTitle);
    }

    getCourseData = (courseYear, courseID) => {
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
        courseRef.onSnapshot(doc => {
            this.setState({
                courseData: doc.data()
            })
            console.log(doc.data())
        })
    }

    getCourseStudentsData = (courseYear, courseID, courseDay) => {
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').where(`enrolledCourse.${courseDay}`, 'array-contains', courseID);
        this.setState({ isLoading: true });
        studentRef.onSnapshot(querySnapshot => {
            let studentsArr = [];
            querySnapshot.forEach(function (doc) {
                studentsArr.push(doc.data());
            });
            let studentTimestamp = [];
            studentsArr.forEach(student => {
                studentTimestamp.push(student.timestamp.seconds);
            })
            studentTimestamp.sort((a, b) => a - b)
            let studentsArrOrderByTimestamp = [];
            for (let i = 0; i < studentTimestamp.length; i++) {
                const timestamp = studentTimestamp[i];
                for (let j = 0; j < studentsArr.length; j++) {
                    const student = studentsArr[j];
                    if (timestamp === student.timestamp.seconds) {
                        studentsArrOrderByTimestamp.push(student)
                        studentsArr.splice(j, 1);
                    }
                }
            }
            this.setState({
                studentsArr: studentsArrOrderByTimestamp,
                isLoading: false
            });
        })
    }

    courseStatus = () => {
        const course = this.state.courseData
        let stat = (text, number) => {
            return (
                <div className="col stat">
                    <span className="stat-description">{text}</span>
                    <span className="stat-number">{number}</span>
                </div>
            )
        }
        let courseStatus;
        if (course.courseEnrolled < course.courseCapacity) {
            courseStatus = course.courseCapacity - course.courseEnrolled
        } else {
            courseStatus = 'เต็ม'
        }
        return (
            <div className="course row align-items-center mb-2">
                {stat('รับสมัคร', course.courseCapacity)}
                {stat('สมัครแล้ว', course.courseEnrolled)}
                {stat('ที่ว่าง', courseStatus)}
            </div>
        )
    }

    studentsList = () => {
        const { studentsArr } = this.state
        if (studentsArr.length === 0) {
            return <p className="text-center">ยังไม่มีนักเรียนลงทะเบียนในรายวิชานี้</p>
        } else {
            let studentsList = studentsArr.map((student, i) => {
                return (
                    <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{student.studentID}</td>
                        <td>{student.nameTitle}</td>
                        <td>{student.nameFirst}</td>
                        <td>{student.nameLast}</td>
                        <td>{student.studentGrade} / {student.studentClass}</td>
                        <td>{student.studentRoll}</td>
                        <td>{new Date(student.timestamp.seconds * 1000).toLocaleString()}</td>
                    </tr>
                )
            })
            return (
                <div>
                    <table className="table table-hover table-responsive-md">
                        <thead>
                            <tr>
                                <th scope="col-1">#</th>
                                <th scope="col-1">เลขประจำตัว</th>
                                <th scope="col-1">คำนำหน้า</th>
                                <th scope="col-4">ชื่อ</th>
                                <th scope="col-4">นามสกุล</th>
                                <th scope="col-1">ชั้น/ห้อง</th>
                                <th scope="col-1">เลขที่</th>
                                <th scope="col-1">timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsList}
                        </tbody>
                    </table>
                    <p><i>หมายเหตุ: รายชื่อเรียงตามเวลาที่ทำการลงทะเบียน</i></p>
                    <button className="btn btn-purple" onClick={this.exportStudentList}><i className="fa fa-download fa-fw"></i> ส่งออกเป็นไฟล์ CSV</button>
                </div>

            )
        }
    }

    render() {
        const { isLoading, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else {
            const { courseID, courseData, courseYear } = this.state
            let courseDescription = null
            if (!!courseData.courseDescription) {
                courseDescription = courseData.courseDescription
            } else {
                courseDescription = 'ไม่มีคำอธิบายรายวิชาเพิ่มไว้สำหรับรายวิชานี้'
            }
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>{courseID} {courseData.courseName}</h1>
                        <p>รายวิชาเพิ่มเติม {courseID} {courseData.courseName} ปีการศึกษา {courseYear}</p>
                        <p>
                            ชื่อผู้สอน: {courseData.courseTeacher}<br/>
                            ระดับชั้น: มัธยมศึกษาปีที่ {courseData.courseGrade.join(', ')}<br/>
                            วันที่ทำการเรียนการสอน: {system.translateDayToThai(courseData.courseDay)}<br/>
                            คำอธิบายรายวิชา: {courseDescription}
                        </p>
                        {this.courseStatus()}
                        {this.studentsList()}
                        <button className="btn btn-wrapper-bottom btn-green" onClick={this.goBack}>ย้อนกลับ</button>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default ViewCourse;