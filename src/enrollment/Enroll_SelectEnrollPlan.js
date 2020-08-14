import React from 'react';
import * as system from '../functions/systemFunctions';
import Footer from '../components/Footer';

class CoursesSelector extends React.Component {

    state = {
        studentEnrollPlan: this.props.studentEnrollPlan
    }

    componentDidMount = (event) => {
        if (this.props.studentEnrollPlan !== undefined) {
            let checkboxes = document.getElementsByName('enrollPlans')
            for (let i = 0; i < checkboxes.length; i++) {
                const checkbox = checkboxes[i];
                if(checkbox.value === this.props.studentEnrollPlan) {
                    checkbox.checked = true;
                }
            }
        }
    }

    goPreviousStep = (event) => {
        event.preventDefault();
        this.props.goPreviousStepFunction();
    }

    goNextStep = (event) => {
        event.preventDefault();
        this.props.goNextStepFunction(this.state.studentEnrollPlan);
    }

    handleChangeEnrollPlanSelector = (event) => {
        this.setState({ studentEnrollPlan: event.target.value });
    }

    enrollPlanSelector = () => {
        const enrollPlans = this.props.enrollPlans;
        const enrollPlanSelector = enrollPlans.map((enrollPlan, i) => {
            let enrollPlanDetail = enrollPlan.plan.map((day, j) => {
                if (day.numOfCourse !== 0) {
                    return <span key={j}>{system.translateDayToThai(day.day)} {day.numOfCourse} วิชา </span>
                } else {
                    return null;
                }
            })
            return (
                <li className="list-group-item enroll-selector" key={i}>
                    <label className="full-width" htmlFor={enrollPlan.name}>
                        <div className="enroll-selector-group">
                            <div className="enroll-selector-check-input">
                                <input
                                    className="form-check-input" type="radio" name="enrollPlans"
                                    id={enrollPlan.name} value={enrollPlan.name}
                                    onChange={this.handleChangeEnrollPlanSelector}
                                    required
                                />
                            </div>
                            <div className="enroll-selector-label full-width">
                                <h5>{enrollPlan.name}</h5>
                                {enrollPlanDetail}
                            </div>
                        </div>
                    </label>
                </li>
            )
        })
        return (
            <div>
                <h5 className="mb-3">เลือกรูปแบบการลงทะเบียน</h5>
                <form onSubmit={this.goNextStep}>
                    <ul className="list-group admin mb-3">
                        {enrollPlanSelector}
                    </ul>
                    <button type="submit" className="btn btn-purple">ถัดไป</button>
                    <button onClick={this.goPreviousStep} className="btn btn-secondary ml-2">ย้อนกลับ</button>
                </form>
            </div>
        )
    }

    render() {
        return (
            <div className="body bg-gradient">
                <div className="wrapper">
                    <h1>ระบบลงทะเบียนเรียน</h1>
                    <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                    <h4>ปีการศึกษา {this.props.courseYear}</h4>
                    {this.enrollPlanSelector()}
                </div>
                <Footer />
            </div>
        )
    }
}

export default CoursesSelector;
