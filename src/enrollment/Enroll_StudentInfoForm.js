import React from 'react';
import Footer from '../components/Footer';

class StudentInfoEnrollForm extends React.Component {

    componentDidMount = () => {
        const studentInfo = this.props.studentInfo !== undefined ?
            this.props.studentInfo :
            {
                studentID: '',
                nameTitle: '',
                nameFirst: '',
                nameLast: '',
                studentGrade: '',
                studentClass: '',
                studentRoll: ''
            };
        const {
            studentID,
            nameTitle,
            nameFirst,
            nameLast,
            studentGrade,
            studentClass,
            studentRoll
        } = studentInfo;
        this.setState({
            studentID: studentID,
            nameTitle: nameTitle,
            nameFirst: nameFirst,
            nameLast: nameLast,
            studentGrade: studentGrade,
            studentClass: studentClass,
            studentRoll: studentRoll,
        })
    }

    goBack = (event) => {
        event.preventDefault();
        window.history.back();
    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    goNextStep = (event) => {
        event.preventDefault();
        const {
            studentID,
            nameTitle,
            nameFirst,
            nameLast,
            studentGrade,
            studentClass,
            studentRoll
        } = this.state;
        const studentData = {
            studentID: studentID,
            nameTitle: nameTitle,
            nameFirst: nameFirst,
            nameLast: nameLast,
            studentGrade: studentGrade,
            studentClass: studentClass,
            studentRoll: studentRoll,
        }
        this.props.goNextStepFunction(studentData)
    }

    studentInfoEnrollForm = () => {
        const { gradesArr } = this.props;
        const studentInfo = this.props.studentInfo !== undefined ?
            this.props.studentInfo :
            {
                studentID: '',
                nameTitle: '',
                nameFirst: '',
                nameLast: '',
                studentGrade: '',
                studentClass: '',
                studentRoll: ''
            };
        const {
            studentID,
            nameTitle,
            nameFirst,
            nameLast,
            studentGrade,
            studentClass,
            studentRoll
        } = studentInfo;
        const updateInput = this.updateInput;
        const gradeSelector = () => {
            let gradeOptions = gradesArr.map((grade, i) => {
                return <option value={grade} key={i}>มัธยมศึกษาปีที่ {grade}</option>
            })
            return (
                <select id="studentGrade" className="form-control" onChange={this.updateInput} defaultValue={studentGrade} required>
                    <option value="" disabled>เลือก...</option>
                    {gradeOptions}
                </select>
            )
        }
        return (
            <form onSubmit={this.goNextStep}>
                <h5>กรอกข้อมูลส่วนตัวของคุณ</h5>
                <div className="form-group">
                    <label htmlFor="studentID">เลขประจำตัวนักเรียน</label>
                    <input 
                        type="text" className="form-control" id="studentID" 
                        pattern="[0-9]{5}" inputmode="numeric"
                        title="กรุณากรอกเลขประจำตัวนักเรียน 5 หลัก" 
                        placeholder="เลขประจำตัวนักเรียน 5 หลัก" 
                        onChange={updateInput} defaultValue={studentID} required 
                    />
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
                        <label htmlFor="nameFirst">ชื่อ</label>
                        <input type="text" className="form-control" id="nameFirst" placeholder="ชื่อ" onChange={updateInput} defaultValue={nameFirst} required />
                    </div>
                    <div className="col-sm-5 form-group">
                        <label htmlFor="nameLast">นามสกุล</label>
                        <input type="text" className="form-control" id="nameLast" placeholder="นามสกุล" onChange={updateInput} defaultValue={nameLast} required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="studentGrade">ชั้น</label>
                    {gradeSelector()}
                </div>
                <div className="form-row">
                    <div className="col-sm-6 form-group">
                        <label htmlFor="studentClass">ห้องเรียน</label>
                        <input type="number" pattern="[0-9]*" min="1" className="form-control" id="studentClass" placeholder="เช่น ม.1/4 ให้กรอกเลข 4" onChange={updateInput} defaultValue={studentClass} required />
                    </div>
                    <div className="col-sm-6 form-group">
                        <label htmlFor="studentRoll">เลขที่</label>
                        <input type="number" pattern="[0-9]*" min="1" className="form-control" id="studentRoll" placeholder="เลขที่" onChange={updateInput} defaultValue={studentRoll} required />
                    </div>
                </div>
                <button type="submit" className="btn btn-purple">ถัดไป</button>
                <button className="btn btn-secondary ml-2" onClick={this.goBack}>ย้อนกลับ</button>
            </form>
        )
    }

    render() {
        return (
            <div className="body bg-gradient">
                <div className="wrapper">
                    <h1>ระบบลงทะเบียนเรียน</h1>
                    <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                    <h4>ปีการศึกษา {this.props.courseYear}</h4>
                    {this.studentInfoEnrollForm()}
                </div>
                <Footer />
            </div>
        )
    }
}

export default StudentInfoEnrollForm;
