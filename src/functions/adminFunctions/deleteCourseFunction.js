import firebase from 'firebase/app';
import 'firebase/firestore';

const deleteCourseData = (courseYear, courseID) => {
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
    return new Promise((resolve, reject) => {
        courseRef.delete()
            .then(() => {
                console.log(`Course ${courseID} data has been deleted from course database of course year ${courseYear} successfully!`)
                resolve()
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed deleting course ${courseID} data from database. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const deleteCourseValidateData = (courseYear, courseID) => {
    const db = firebase.firestore();
    const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID)
    return new Promise((resolve, reject) => {
        courseValidateRef.delete()
            .then(() => {
                console.log(`Course ${courseID} validate data has been deleted from courseValidate database of course year ${courseYear} successfully!`)
                resolve()
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed deleting course ${courseID} validate data from database. ${err.message}`;
                reject(errorMessage);
            })
    })
}

export default function deleteCourse(courseYear = '', courseID = '') {
    return new Promise((resolve, reject) => {
         deleteCourseData(courseYear, courseID)
            .then(() => {
                return deleteCourseValidateData(courseYear, courseID);
            })
            .then(() => {
                resolve()
            })
            .catch(err => {
                reject(err);
            })
    })
}