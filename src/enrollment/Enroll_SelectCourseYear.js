import React from 'react';
import * as system from '../functions/systemFunctions';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';
import Footer from '../components/Footer';

class EnrollSelectCourseYear extends React.Component {
    state = {
        courseYearArr: [],
        isLoading: true
    }
    componentDidMount = async () => {
        try {
            const getSystemConfig = await system.getSystemConfig();
            const systemConfig = await getSystemConfig.systemConfig;
            const currentCourseYear = systemConfig.currentCourseYear;
            const courseYearArr = systemConfig.courseYears;
            this.setState({
                courseYearArr: courseYearArr,
                selectedCourseYear: currentCourseYear,
                isLoading: false
            })
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

    goBack = (event) => {
        event.preventDefault();
        window.history.back();
    }

    selectCourseYear = (event) => {
        this.setState({ selectedCourseYear: event.target.value });
    }

    render() {
        const { isLoading, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'home'} />
        } else {
            const {
                courseYearArr,
                selectedCourseYear
            } = this.state;
            const courseYearSelector = courseYearArr.map((courseYear, i) => {
                return <option value={courseYear.year} key={i}>ปีการศึกษา {courseYear.year}</option>
            });
            return (
                <div className="body bg-gradient">
                    <div className="wrapper text-left">
                        <h1>ระบบลงทะเบียนรายวิชาเพิ่มเติม</h1>
                        <h2>โรงเรียนสตรีสมุทรปราการ</h2>
                        <p>เลือกปีการศึกษาที่ต้องการลงทะเบียน</p>
                        <select className="form-control mb-3" defaultValue={selectedCourseYear} onChange={this.selectCourseYear}>
                            {courseYearSelector}
                        </select>
                        <a href={`/enroll/enrollment?courseYear=${selectedCourseYear}`} className="btn btn-purple">เลือก</a>
                        <button onClick={this.goBack} className="btn btn-secondary ml-2">กลับ</button>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default EnrollSelectCourseYear;