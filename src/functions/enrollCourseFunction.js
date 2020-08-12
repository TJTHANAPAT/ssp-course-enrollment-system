import firebase from 'firebase/app';
import 'firebase/firestore';

export function checkCourseYearAvailable(courseYear = '', systemConfig = {}) {
    return new Promise((resolve, reject) => {
        const courseYearsArr = systemConfig.courseYears;
        let isCourseYearExists = false;
        let isCourseYearAvailable = false;
        for (let i = 0; i < courseYearsArr.length; i++) {
            if (courseYearsArr[i].year === courseYear) {
                isCourseYearAvailable = courseYearsArr[i].available;
                isCourseYearExists = true;
            }
        }
        if (!isCourseYearExists) {
            reject(`ไม่พบปีการศึกษา ${courseYear} ในระบบ`)
        } else if (isCourseYearAvailable) {
            resolve();
        } else {
            reject(`ระบบลงทะเบียนรายวิชาเพิ่มเติมสำหรับปีการศึกษา ${courseYear} ยังไม่เปิดให้ลงทะเบียนในขณะนี้`);
        }
    })
}

const getCourseStudentsData = (courseYear, courseID, courseDay) => {
    const db = firebase.firestore();
    const studentRef = db.collection(courseYear).doc('student').collection('student').where(`enrolledCourse.${courseDay}`, 'array-contains', courseID);
    return new Promise((resolve, reject) => {
        studentRef.get()
            .then(querySnapshot => {
                let studentsArr = [];
                querySnapshot.forEach(function (doc) {
                    studentsArr.push(doc.data());
                });
                resolve(studentsArr);
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed getting student data of course ${courseID} in ${courseYear}. (${err.errorMessage})`
                reject(errorMessage)
            })
    })
}

export function checkCourseAvailable(courseYear = '', courseData = {}) {
    const {
        courseID,
        courseCapacity,
        courseEnrolled,
        courseDay 
    } = courseData;
    return new Promise((resolve, reject) => {
        getCourseStudentsData(courseYear, courseID, courseDay)
            .then(studentsArr => {
                if (courseEnrolled < courseCapacity) {
                    if (studentsArr.length == courseEnrolled) {
                        resolve();
                    } else {
                        const db = firebase.firestore();
                        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID);
                        courseRef.update({ courseEnrolled: courseEnrolled })
                            .then(() => {
                                resolve();
                            })
                            .catch(err => {
                                console.error(err);
                                const errorMessage = `System failed updating course enrolled student. ${err.message}`;
                                reject(errorMessage);
                            })
                    }
                } else {
                    const err = `รายวิชาเพิ่มเติม ${courseID} ปีการศึกษา ${courseYear} เต็ม`
                    reject(err);
                }
            })
            .catch(err => {
                reject(err);
            })
    })
}

export function getCoursesData(courseYear = '') {
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course');
    return new Promise((resolve, reject) => {
        courseRef.get()
            .then(snapshot => {
                if (snapshot.empty) {
                    const err = `ยังไม่มีรายวิชาถูกเพิ่มในปีการศึกษา ${courseYear}`
                    reject(err);
                } else {
                    let coursesArr = [];
                    snapshot.forEach(doc => {
                        coursesArr.push(doc.data());
                    });
                    resolve(coursesArr);
                }
            })
            .catch(err => {
                const errorMessage = `Error getting courses data in course year ${courseYear} from database. ${err.message}`;
                reject(errorMessage);
            });
    })
}

export function getCourseData(courseYear = '', courseID = '') {
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
    return new Promise((resolve, reject) => {
        courseRef.get()
            .then(doc => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    const err = `Course ${courseID} data in ${courseYear} has not been found in database.`
                    reject(err);
                }
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed getting course data of course ${courseID} in ${courseYear}. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const getCourseValidateData = (courseYear = '', courseID = '') => {
    const db = firebase.firestore();
    const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID);
    return new Promise((resolve, reject) => {
        courseValidateRef.get()
            .then(doc => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    const err = `Course ${courseID} validate data in ${courseYear} has not been found in database.`
                    reject(err);
                }
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed getting course data of course ${courseID} in ${courseYear}. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const arraysEqual = (arr1, arr2) => {
    // arraysEqual function used to validate course grade.
    if (arr1 === arr2) return true;
    if (arr1 == null || arr2 == null) return false;
    arr1.sort((a, b) => a - b);
    arr2.sort((a, b) => a - b);
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

const checkStudentGrade = (studentData, courseYear, courseData) => {
    const { studentGrade } = studentData;
    const { courseID, courseName, courseGrade } = courseData;
    return new Promise((resolve, reject) => {
        let isStudentGradeValid = false;
        for (let i = 0; i < courseGrade.length; i++) {
            if (parseInt(studentGrade) === courseGrade[i]) {
                isStudentGradeValid = true;
            }
        }
        if (isStudentGradeValid) {
            resolve();
        } else {
            const err = `${courseName} (${courseID}) in course year ${courseYear} is only available for students at grade ${courseGrade.join(', ')}.`;
            reject(err);
        }
    })
}

export function checkStudentID(courseYear, studentID) {
    const db = firebase.firestore();
    const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
    return new Promise((resolve, reject) => {
        studentRef.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('This studentID is valid.')
                    resolve();
                } else {
                    const student = doc.data();
                    const err = `เลขประจำตัวนักเรียน ${student.studentID} ถูกใช้ลงทะเบียนเรียนในชื่อของ ${student.nameFirst} ${student.nameLast} ไปแล้วในรายวิชาหนึ่งของปีการศึกษา ${courseYear} หากเลขประจำตัวนี้เป็นของคุณกรุณาติดต่อผู้ดูแลระบบ`
                    reject(err);
                }
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `System failed checking student ID. ${err.message}`;
                reject(errorMessage);
            })
    })
}

export function updateCourseEnrolled(courseYear, courseData) {
    const course = courseData;
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(course.courseID);
    return new Promise((resolve, reject) => {
        const updateCourseEnrolled = course.courseEnrolled + 1;
        courseRef.update({ courseEnrolled: updateCourseEnrolled })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `System failed updating course enrolled student. ${err.message}`;
                reject(errorMessage);
            })
    })
}

export function updateCourseEnrolledIndividualCourse(courseYear, courseID) {
    return new Promise((resolve, reject) => {
        let courseData;
        getCourseData(courseYear, courseID)
            .then(res => {
                courseData = res;
                return updateCourseEnrolled(courseYear, courseData);
            })
            .then(() => {
                console.log(`Enroll in a course ${courseID} in course year ${courseYear} successfully.`)
                resolve();
            })
            .catch(err => {
                reject(err);
            })
    })
}

export function addStudentDataNew(courseYear, studentData) {
    const { studentID } = studentData;
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    studentData = { ...studentData, ...{ timestamp: timestamp } };
    const db = firebase.firestore();
    const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
    return new Promise((resolve, reject) => {
        studentRef.set(studentData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `System failed adding student data. ${err.message}`;
                reject(errorMessage);
            })
    })
}

export function validateIndividualCourse(courseYear = '', courseID = '', studentData = { studentID: '' }) {
    return new Promise((resolve, reject) => {
        let courseData;
        let courseValidateData;
        getCourseData(courseYear, courseID)
            .then(res => {
                courseData = res;
                return checkCourseAvailable(courseYear, courseData);
            })
            .then(() => {
                return checkStudentGrade(studentData, courseYear, courseData);
            })
            .then(() => {
                return getCourseValidateData(courseYear, courseID);
            })
            .then(res => {
                courseValidateData = res;
                return validateCourseData(courseYear, courseData, courseValidateData);
            })
            .then(() => {
                resolve();
                console.log('ValidateIndividualCourse is successful.')
            })
            .catch(err => {
                console.error('ValidateIndividualCourse error: ', err);
                reject(err);
            })
    })
}

const validateCourseData = (courseYear, courseData, courseValidateData) => {
    return new Promise((resolve, reject) => {
        const { courseID } = courseData;
        const validateCourseCapacity = courseData.courseCapacity === courseValidateData.courseCapacity;
        if (validateCourseCapacity) {
            resolve();
        } else {
            const err = `Technical issue has been found in the system. The data of course ${courseID} in course year ${courseYear} is not valid. Please contact admin for more infomation.`;
            reject(err);
        }
    })
}
