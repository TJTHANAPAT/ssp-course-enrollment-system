import React from 'react';
import * as system from '../functions/systemFunctions';
import Footer from '../components/Footer';

class EnrollmentCompletePage extends React.Component {

    getCourseName = (courseID, coursesData) => {
        for (let i = 0; i < coursesData.length; i++) {
            const course = coursesData[i];
            if (courseID === course.courseID) {
                return course.courseName;
            }
        }
    }

    render() {
        const {
            courseYear,
            coursesData,
            studentData
        } = this.props;
        const {
            nameTitle,
            nameFirst,
            nameLast,
            studentID,
            studentEnrollPlan,
            enrolledCourse
        } = studentData;
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
        const studentEnrolledCourseDetail = studentEnrolledCourse.map((detail, i) => {
            const enrolledCourseDetail = detail.course.map((courseID, j) => {
                return <li className="list-group-item py-2" key={j}>{courseID} {this.getCourseName(courseID, coursesData)}</li>
            })
            return (
                <div key={i} className="my-3">
                    <h5>{detail.numOfCourse} รายวิชาสำหรับ{system.translateDayToThai(detail.day)}</h5>
                    <ul className="list-group">
                        {enrolledCourseDetail}
                    </ul>
                </div>
            )
        })
        return (
            <div className="body bg-gradient">
                <div className="wrapper">
                    <div className="row align-items-center">
                        <div className="col-sm-3 text-center mb-3">
                            <i className="fa fa-check fa-5x" aria-hidden="false"></i>
                        </div>
                        <div className="col-sm-9 text-left">
                            <h1>คุณลงทะเบียนสำเร็จแล้ว</h1>
                            <p>
                                <b>{nameTitle}{nameFirst} {nameLast}</b> (เลขประจำตัวนักเรียน : {studentID})
                                ได้ทำการลงทะเบียนเรียนรายวิชาเพิ่มเติมรูปแบบ '{studentEnrollPlan}' ในปีการศึกษา {courseYear} ในรายวิชาดังนี้
                            </p>
                            {studentEnrolledCourseDetail}
                        </div>
                    </div>
                    <a className="btn btn-wrapper-bottom btn-green" href="/">กลับหน้าแรก</a>
                </div>
                <Footer />
            </div>
        )
    }
}

export default EnrollmentCompletePage;
