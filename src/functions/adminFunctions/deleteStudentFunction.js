import firebase from 'firebase/app';
import 'firebase/database';
import { getCourseData } from '../systemFunctions';

export function updateCourseEnrolledIndividualCourse(courseYear, courseID) {
    return new Promise((resolve, reject) => {
        let courseData;
        getCourseData(courseYear, courseID)
            .then(res => {
                courseData = res;
                return updateCourseEnrolled(courseYear, courseData);
            })
            .then(() => {
                console.log(`Update course ${courseID} in course year ${courseYear} for deleting successfully.`)
                resolve();
            })
            .catch(err => {
                reject(err);
            })
    })
}

export function updateCourseEnrolled(courseYear, courseData) {
    const course = courseData;
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(course.courseID);
    return new Promise((resolve, reject) => {
        const updateCourseEnrolled = course.courseEnrolled - 1;
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

export function deleteStudentData(studentID, courseYear) {
    const db = firebase.firestore();
    const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID)
    return new Promise((resolve, reject) => {
        studentRef.delete()
            .then(() => {
                console.log(`Delete student ${studentID} in course year ${courseYear} successfully.`)
                resolve();
            })
            .catch(err => {
                const errorMessage = `Failed deleting student ${studentID} in course year ${courseYear}. ${err.message}`;
                reject(errorMessage);
            })
    })
}