import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Switch from 'react-switch';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';

class CourseYearConfig extends React.Component {
    state = {
        isLoadingComplete: false,
        isSaveFirstInitSystem: false,
        courseYearAdd: '',
    }
    componentDidMount = () => {
        auth.checkAuthState()
            .then(res => {
                const user = res.user;
                const isLogin = res.isLogin;
                this.setState({
                    currentUser: user,
                    isLogin: isLogin,
                })
                return system.getSystemConfig(false)
            })
            .then(res => {
                const isFirstInitSystem = res.isFirstInitSystem;
                this.setState({ isFirstInitSystem: isFirstInitSystem });
                if (!isFirstInitSystem) {
                    const systemConfig = res.systemConfig;
                    this.setState({
                        isLoadingComplete: true,
                        currentCourseYear: systemConfig.currentCourseYear,
                        courseYearsArr: systemConfig.courseYears
                    });
                } else {
                    console.warn('No course year config has ever been found in database. It will be initialized after saving.')
                    this.setState({
                        isSaveFirstInitSystem: true,
                        isLoadingComplete: true,
                        currentCourseYear: '',
                        courseYearsArr: []
                    })
                }
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                })
            })
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

    addNewCourseYear = (event) => {
        event.preventDefault();
        const { courseYearAdd, courseYearsArr } = this.state
        if (courseYearAdd.includes('/')) {
            alert(`Course year must not contain slash ( / ).`)
        } else if (!system.checkCourseYearExist(courseYearAdd, courseYearsArr)) {
            const newCourseYear = {
                year: courseYearAdd.toString(),
                available: false,
            };
            courseYearsArr.push(newCourseYear)
            const courseYearsArrSortedYear = [];
            for (let i = 0; i < courseYearsArr.length; i++) {
                courseYearsArrSortedYear.push(courseYearsArr[i].year);
            }
            courseYearsArrSortedYear.sort((a, b) => a - b);
            const courseYearsArrSorted = [];
            for (let i = 0; i < courseYearsArrSortedYear.length; i++) {
                const year = courseYearsArrSortedYear[i];
                for (let j = 0; j < courseYearsArr.length; j++) {
                    const courseYear = courseYearsArr[j];
                    if (year === courseYear.year) {
                        courseYearsArrSorted.push(courseYear);
                    }
                }
            }
            this.setState({
                courseYearsArr: courseYearsArrSorted,
                courseYearAdd: ''
            })
            console.log(courseYearsArrSorted)
        } else {
            alert(`${courseYearAdd} is already exist!`)
        }

    }

    removeCourseYear = (event) => {
        event.preventDefault();
        const { courseYearsArr, currentCourseYear } = this.state;
        const courseYear = event.target.value
        for (let i = 0; i < courseYearsArr.length; i++) {
            if (courseYearsArr[i].year === courseYear) {
                courseYearsArr.splice(i, 1);
                console.log('Remove Course Year', courseYear)
            }
        }
        if (currentCourseYear === courseYear) {
            this.setState({ currentCourseYear: '' });
        }
        this.setState({ courseYearsArr: courseYearsArr });
    }

    setCurrentCourseYear = (event) => {
        event.preventDefault();
        this.setState({ currentCourseYear: event.target.value });
    }

    save = (event) => {
        event.preventDefault();
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config')
        const { courseYearsArr, currentCourseYear, isFirstInitSystem } = this.state;
        let config = {
            courseYears: courseYearsArr,
            currentCourseYear: currentCourseYear
        }
        if (currentCourseYear === '') {
            alert('You have to set the current course year.');
        } else if (!isFirstInitSystem) {
            configRef.update(config)
                .then(() => {
                    console.log('Save successfully!')
                    alert('Save successfully!')
                })
                .catch(err => {
                    console.error('Error: ', err)
                    alert('Save failed!')
                })
        } else {
            config = { ...config, ...{ isRegisterEnabled: false, isSearchEnabled: true } }
            configRef.set(config)
                .then(() => {
                    this.setState({ isSaveFirstInitSystem: true });
                    console.log('Save successfully!')
                    alert('Save successfully!')
                })
                .catch(err => {
                    console.error('Error: ', err)
                    alert('Save failed!')
                })
        }
    }

    handleChangeCourseYearAvailable = (checked, event, id) => {
        event.preventDefault();
        const { courseYearsArr } = this.state;
        for (let i = 0; i < courseYearsArr.length; i++) {
            const courseYear = courseYearsArr[i];
            if (courseYear.year === id) {
                courseYear.available = checked;
            }
        }
        this.setState({ courseYearsArr: courseYearsArr });
        console.log(this.state.courseYearsArr)
    }

    courseYearsList = () => {
        const { courseYearsArr, currentCourseYear } = this.state
        if (courseYearsArr.length !== 0) {
            let courseYearSelector = courseYearsArr.map((courseYear, i) => {
                let btnCurrentYear = () => {
                    if (currentCourseYear === courseYear.year) {
                        return <button className="btn btn-success m-1 ml-2 fa fa-bookmark"></button>
                    } else {
                        return <button className="btn btn-light m-1 ml-2 fa fa-bookmark" onClick={this.setCurrentCourseYear} value={courseYear.year}></button>
                    }
                }
                return (
                    <li className="list-group-item" key={i}>
                        <div className="list-item-text">
                            <span>ปีการศึกษา {courseYear.year}</span>
                        </div>
                        <div className="list-item-action-panel">
                            <Switch
                                id={courseYear.year}
                                onChange={this.handleChangeCourseYearAvailable}
                                checked={courseYear.available}
                            />
                            {btnCurrentYear()}
                            <button className="btn btn-danger m-1 fa fa-trash" onClick={this.removeCourseYear} value={courseYear.year}></button>
                        </div>
                    </li>
                )
            })
            return (
                <div>
                    <ul className="list-group admin">{courseYearSelector}</ul>
                    <p className="mt-1">
                        <i>
                            คำเตือน: เมื่อลบปีการศึกษาทิ้ง ข้อมูลของรายวิชาและข้อมูลของนักเรียนที่ลงทะเบียนไว้ในปีการศึกษาที่ถูกลบจะยังคงอยู่ หากต้องการลบข้อมูลดังกล่าวด้วย กรุณาลบทุกรายวิชาทิ้งก่อนทำการลบปีการศึกษา
                        </i>
                    </p>
                </div>
            )
        } else {
            return <p>No course year has been added.</p>
        }
    }

    addNewCourseYearForm = () => {
        return (
            <form onSubmit={this.addNewCourseYear} className="form-config row mt-3">
                <div className="col-9 form-input-inline form-group">
                    <input type="text" className="form-control" id="courseYearAdd" placeholder="เพิ่มปีการศึกษาใหม่" onChange={this.updateInput} value={this.state.courseYearAdd} required />
                </div>
                <div className="col-3 form-btn-inline">
                    <button type="submit" className="btn btn-purple full-width">เพิ่ม</button>
                </div>
            </form>
        )
    }

    render() {
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else {
            const btnBack = () => {
                const { isSaveFirstInitSystem } = this.state;
                if (isSaveFirstInitSystem) {
                    return <a href="/admin" className="btn btn-secondary ml-2">ย้อนกลับ</a>
                } else {
                    return <button onClick={this.goBack} className="btn btn-secondary ml-2">ย้อนกลับ</button>
                }
            }
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>ตั้งค่าปีการศึกษา</h1>
                        {this.courseYearsList()}
                        {this.addNewCourseYearForm()}
                        <div className="mt-2">
                            <button type="submit" className="btn btn-purple" onClick={this.save}>บันทึก</button>
                            {btnBack()}
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default CourseYearConfig;