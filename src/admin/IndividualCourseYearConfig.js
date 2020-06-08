import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import * as auth from '../functions/adminFunctions/authenticationFuctions';
import * as system from '../functions/systemFunctions';

class IndividualCourseYearConfig extends React.Component {
    state = {
        isLoading: true,
        gradeAdd: '',
        newEnrollPlanName: '',
        newEnrollPlan: [
            { day: 'sunday', numOfCourse: 0 },
            { day: 'monday', numOfCourse: 0 },
            { day: 'tuesday', numOfCourse: 0 },
            { day: 'wednesday', numOfCourse: 0 },
            { day: 'thursday', numOfCourse: 0 },
            { day: 'friday', numOfCourse: 0 },
            { day: 'saturday', numOfCourse: 0 }
        ]
    }
    componentDidMount = async () => {
        try {
            await auth.checkAuthState()
            const courseYear = await system.getURLParam('courseYear');
            const getCourseYearConfig = await system.getCourseYearConfig(courseYear, false);
            const courseYearConfig = getCourseYearConfig.config;
            this.setState({
                courseYear: courseYear,
                enrollPlans: courseYearConfig.enrollPlans,
                gradesArr: courseYearConfig.grades,
                isFirstInitConfig: courseYearConfig.isFirstInitConfig,
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

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        })
        console.log(event.target.id, ':', event.target.value)
    }

    addNewGrade = (event) => {
        event.preventDefault();
        const { gradeAdd, gradesArr } = this.state
        const isArrContains = (array, item) => {
            for (let i = 0; i < array.length; i++) {
                if (array[i] === item) { return true }
            }
            return false
        }
        if (!isArrContains(gradesArr, parseInt(gradeAdd))) {
            gradesArr.push(parseInt(gradeAdd))
            gradesArr.sort((a, b) => a - b)
            this.setState({ gradesArr: gradesArr, gradeAdd: '' })
            console.log(gradesArr)
        } else {
            alert(`ระดับชั้น ${gradeAdd} ถูกเพิ่มไว้อยู่ก่อนแล้ว`)
            this.setState({ gradeAdd: '' })
        }
    }

    removeGrade = (event) => {
        event.preventDefault();
        const gradesArr = this.state.gradesArr
        for (var i = 0; i < gradesArr.length; i++) {
            if (gradesArr[i] === parseInt(event.target.value)) {
                gradesArr.splice(i, 1);
                console.log('Remove Grade', event.target.value)
            }
        }
        this.setState({ gradesArr: gradesArr })
    }

    saveGrade = (event) => {
        event.preventDefault();
        const {
            courseYear,
            isFirstInitConfig,
            gradesArr,
            enrollPlans
        } = this.state
        const db = firebase.firestore();
        const configRef = db.collection(courseYear).doc('config')
        const config = { grades: gradesArr, enrollPlans: enrollPlans }
        if (!isFirstInitConfig) {
            configRef.update(config)
                .then(() => {
                    console.log('Update successfully!')
                    alert('บันทึกสำเร็จ')
                })
                .catch(err => {
                    console.error('Error: ', err)
                    alert('บันทึกไม่สำเร็จ')
                })
        } else {
            configRef.set(config)
                .then(() => {
                    console.log('Update successfully!')
                    alert('บันทึกสำเร็จ')
                })
                .catch(err => {
                    console.error('Error: ', err)
                    alert('บันทึกไม่สำเร็จ')
                })
        }

    }

    gradeList = () => {
        const { gradesArr } = this.state;
        if (gradesArr.length !== 0) {
            let gradeList = gradesArr.map((grade, i) => {
                return (
                    <li className="list-group-item" key={i}>
                        <div className="list-item-text">
                            <span>มัธยมศึกษาปีที่ {grade}</span>
                        </div>
                        <div className="list-item-action-panel">
                            <button className="btn btn-danger m-1 fa fa-trash" onClick={this.removeGrade} value={grade}></button>
                        </div>
                    </li>
                )
            })
            return <ul className="list-group admin">{gradeList}</ul>
        } else {
            return <p>ยังไม่มีชั้นเรียนถูกเพิ่มในปีการศึกษานี้</p>
        }
    }

    gradeConfig = () => {
        return (
            <div>
                <h3>ตั้งค่าระดับชั้น</h3>
                {this.gradeList()}
                <form onSubmit={this.addNewGrade} className="mt-3">
                    <div className="form-config row">
                        <div className="col-9 form-input-inline form-group">
                            <input type="number" pattern="[0-9]*" className="form-control" id="gradeAdd" placeholder="เพิ่มระดับชั้นใหม่" onChange={this.updateInput} value={this.state.gradeAdd} required />
                        </div>
                        <div className="col-3 form-btn-inline">
                            <button type="submit" className="btn btn-purple full-width">เพิ่ม</button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    // Functions for Enrollment Planner
    handleChangeNumberOfCourse = (event) => {
        const enrollPlan = this.state.newEnrollPlan;
        const day = event.target.id;
        const numOfCourse = parseInt(event.target.value);
        console.log(event.target.id, event.target.value)
        if (event.target.value < 0) {
            alert('Number of Courses must be more than or equal to 0.')
        } else {
            for (let i = 0; i < enrollPlan.length; i++) {
                if (enrollPlan[i].day === day) {
                    enrollPlan[i].numOfCourse = numOfCourse;
                }
            }
        }
        this.setState({ newEnrollPlan: enrollPlan });
        console.log(enrollPlan)
    }

    enrollmentPlannerForm = () => {
        const enrollPlan = this.state.newEnrollPlan;
        const handleChange = this.handleChangeNumberOfCourse;
        const daysLabel = [
            { en: 'sunday', th: 'วันอาทิตย์' },
            { en: 'monday', th: 'วันจันทร์' },
            { en: 'tuesday', th: 'วันอังคาร' },
            { en: 'wednesday', th: 'วันพุธ' },
            { en: 'thursday', th: 'วันพฤหัสบดี' },
            { en: 'friday', th: 'วันศุกร์' },
            { en: 'saturday', th: 'วันเสาร์' },
        ]
        const enrollmentPlanner = enrollPlan.map((day, i) => {
            let dayLabelTH = null;
            for (let i = 0; i < daysLabel.length; i++) {
                if (day.day === daysLabel[i].en) {
                    dayLabelTH = daysLabel[i].th
                }
            }
            return (
                <div className="col-sm mt-1" key={i}>
                    <span>{dayLabelTH}</span>
                    <input id={day.day} type="number" pattern="[0-9]*" className="form-control" placeholder="# of course" min="0" value={day.numOfCourse} onChange={handleChange} />
                </div>
            )
        })
        return (
            <div>
                <h5>เพิ่มรูปแบบการลงทะเบียนใหม่</h5>
                <form onSubmit={this.addNewEnrollPlan} className="mt-3">
                    <div className="form-group">
                        <input type="text" className="form-control" id="newEnrollPlanName" placeholder="ชื่อรูปแบบการลงทะเบียน" onChange={this.updateInput} value={this.state.newEnrollPlanName} required />
                    </div>
                    <div className="row">
                        {enrollmentPlanner}
                    </div>
                    <button type="submit" className="btn btn-purple mt-3">เพิ่ม</button>
                </form>
            </div>
        )
    }

    addNewEnrollPlan = (event) => {
        event.preventDefault();
        const { enrollPlans, newEnrollPlanName, newEnrollPlan } = this.state;
        const defaultNewEnrollPlan = [
            { day: 'sunday', numOfCourse: 0 },
            { day: 'monday', numOfCourse: 0 },
            { day: 'tuesday', numOfCourse: 0 },
            { day: 'wednesday', numOfCourse: 0 },
            { day: 'thursday', numOfCourse: 0 },
            { day: 'friday', numOfCourse: 0 },
            { day: 'saturday', numOfCourse: 0 }
        ]
        const checkNewEnrollPlan = (enrollPlan = []) => {
            if (enrollPlan.length === 0) { return false }
            for (let i = 0; i < enrollPlan.length; i++) {
                let numOfCourse = enrollPlan[i].numOfCourse
                if (numOfCourse > 0) { return true }
            }
            return false
        }
        const isEnrollPlanExists = (enrollPlanName) => {
            for (let i = 0; i < enrollPlans.length; i++) {
                if (enrollPlanName === enrollPlans[i].name) { return true }
            }
            return false
        }

        if (!checkNewEnrollPlan(newEnrollPlan)) {
            alert('ต้องเลือกอย่างน้อยหนึ่งวันสำหรับการเพิ่มรูปแบบการลงทะเบียนใหม่')
        } else if (isEnrollPlanExists(newEnrollPlanName)) {
            alert('รูปแบบการลงทะเบียนนี้ถูกใช้ไปแล้ว กรุณาใช้ชื่ออื่น')
        } else {
            console.log('adding', newEnrollPlanName);
            const enrollPlan = { name: newEnrollPlanName, plan: newEnrollPlan }
            enrollPlans.push(enrollPlan);
            const enrollPlansNameSorted = [];
            for (let i = 0; i < enrollPlans.length; i++) {
                const enrollPlan = enrollPlans[i];
                enrollPlansNameSorted.push(enrollPlan.name);
            }
            enrollPlansNameSorted.sort();
            console.log(enrollPlansNameSorted)
            const enrollPlansSorted = [];
            for (let i = 0; i < enrollPlansNameSorted.length; i++) {
                const enrollPlansName = enrollPlansNameSorted[i];
                for (let j = 0; j < enrollPlans.length; j++) {
                    const enrollPlan = enrollPlans[j];
                    if (enrollPlansName === enrollPlan.name) {
                        enrollPlansSorted.push(enrollPlan)
                    }
                }
            }
            this.setState({
                enrollPlans: enrollPlansSorted,
                newEnrollPlan: defaultNewEnrollPlan,
                newEnrollPlanName: ''
            });
            console.log(enrollPlans)
        }
    }

    enrollPlanList = () => {
        const { enrollPlans } = this.state;
        const daysLabel = [
            { en: 'sunday', th: 'วันอาทิตย์' },
            { en: 'monday', th: 'วันจันทร์' },
            { en: 'tuesday', th: 'วันอังคาร' },
            { en: 'wednesday', th: 'วันพุธ' },
            { en: 'thursday', th: 'วันพฤหัสบดี' },
            { en: 'friday', th: 'วันศุกร์' },
            { en: 'saturday', th: 'วันเสาร์' },
        ]
        if (enrollPlans.length === 0) {
            return <p>ยังไม่มีรูปแบบการลงทะเบียนถูกเพิ่มในปีการศึกษานี้</p>
        }
        else {
            const enrollPlanList = enrollPlans.map((enrollPlan, i) => {
                let enrollPlanDetail = enrollPlan.plan.map((day, j) => {
                    if (day.numOfCourse !== 0) {
                        let dayLabelTH = null;
                        for (let i = 0; i < daysLabel.length; i++) {
                            if (day.day === daysLabel[i].en) {
                                dayLabelTH = daysLabel[i].th
                            }
                        }
                        return (
                            <div className="col" key={j}>
                                <span>{dayLabelTH}</span><br />
                                <span>{day.numOfCourse} วิชา</span>
                            </div>
                        )
                    } else {
                        return null
                    }
                })
                return (
                    <li className="list-group-item" key={i}>
                        <div className="row">
                            <div className="col-md-10">
                                <h5>{enrollPlan.name}</h5>
                                <div className="row">{enrollPlanDetail}</div>
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-danger fa fa-trash full-width" onClick={this.removeEnrollPlan} value={enrollPlan.name}></button>
                            </div>
                        </div>

                    </li>
                )
            })
            return <ul className="list-group admin">{enrollPlanList}</ul>
        }
    }

    removeEnrollPlan = (event) => {
        event.preventDefault();
        console.log('delete', event.target.value);
        const { enrollPlans } = this.state;
        const enrollPlanName = event.target.value;
        for (let i = 0; i < enrollPlans.length; i++) {
            if (enrollPlans[i].name === enrollPlanName) {
                enrollPlans.splice(i, 1);
            }
        }
        this.setState({ enrollPlans: enrollPlans });
    }

    enrollmentPlansManagement = () => {
        return (
            <div>
                <h3>ตั้งค่ารูปแบบการลงทะเบียน</h3>
                {this.enrollPlanList()}
                <hr />
                {this.enrollmentPlannerForm()}
            </div>
        )
    }

    render() {
        const { isLoading, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else {
            const { courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper text-left">
                        <h1>ตั้งค่าปีการศึกษา {courseYear}</h1>
                        <p>ตั้งค่าระดับชั้นเรียนและรูปแบบการลงทะเบียนสำหรับปีการศึกษา {courseYear}</p>
                        <hr className="mt-4 mb-4" />
                        {this.gradeConfig()}
                        <hr className="mt-4 mb-4" />
                        {this.enrollmentPlansManagement()}
                        <hr className="mt-4 mb-4" />
                        <div className="mt-2">
                            <button type="submit" className="btn btn-purple" onClick={this.saveGrade}>บันทึก</button>
                            <button onClick={this.goBack} className="btn btn-secondary ml-2">ย้อนกลับ</button>
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default IndividualCourseYearConfig;