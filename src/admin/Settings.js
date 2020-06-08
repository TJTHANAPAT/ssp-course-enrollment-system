import React from 'react';
import Switch from 'react-switch';
import firebase from 'firebase/app';
import 'firebase/firestore';

import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from '../functions/adminFunctions/authenticationFuctions';
import * as system from '../functions/systemFunctions';

class Settings extends React.Component {

    state = {
        isLoading: true
    }

    componentDidMount = async () => {
        try {
            await auth.checkAuthState();
            const getSystemConfig = await system.getSystemConfig();
            const systemConfig = getSystemConfig.systemConfig;
            this.setState({
                isRegisterEnabled: systemConfig.isRegisterEnabled,
                isSearchEnabled: systemConfig.isSearchEnabled,
            })
        }
        catch (err) {
            console.error(err);
            this.setState({
                isError: true,
                errorMessage: err
            })
        }
        finally {
            this.setState({ isLoading: false });
        }
    }

    goBack = (event) => {
        event.preventDefault();
        window.history.back();
    }

    handleChangeEnableBtn = (checked, event, id) => {
        event.preventDefault();
        console.log(id, checked);
        this.setState({ [id]: checked });
    }

    save = (event) => {
        event.preventDefault();
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config')
        const { isRegisterEnabled, isSearchEnabled } = this.state;
        let config = {
            isRegisterEnabled: isRegisterEnabled,
            isSearchEnabled: isSearchEnabled
        }
        configRef.update(config)
            .then(() => {
                console.log('Save successfully!')
                alert('บันทึกสำเร็จ')
            })
            .catch(err => {
                console.error('Error: ', err)
                alert('บันทึกไม่สำเร็จ')
            })
    }

    render() {
        const { isLoading, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else {
            return (
                <div className="body bg-gradient">
                    <div className="wrapper text-left">
                        <h1>ตั้งค่าระบบ</h1>
                        <ul className="list-group admin mt-3 mb-3">
                            <li className="list-group-item">
                                <div className="list-item-text">
                                    <span>ลงทะเบียนผู้ดูแลระบบ</span>
                                </div>
                                <div className="list-item-action-panel">
                                    <Switch
                                        id={'isRegisterEnabled'}
                                        onChange={this.handleChangeEnableBtn}
                                        checked={this.state.isRegisterEnabled}
                                    />
                                </div>
                            </li>
                            <li className="list-group-item">
                                <div className="list-item-text">
                                    <span>ค้นหาข้อมูลนักเรียน</span>
                                </div>
                                <div className="list-item-action-panel">
                                    <Switch
                                        id={'isSearchEnabled'}
                                        onChange={this.handleChangeEnableBtn}
                                        checked={this.state.isSearchEnabled}
                                    />
                                </div>
                            </li>
                        </ul>
                        <div className="mt-2">
                            <button type="submit" className="btn btn-purple" onClick={this.save}>บันทึก</button>
                            <button onClick={this.goBack} className="btn btn-secondary ml-2">ย้อนกลับ</button>
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }
    }

}

export default Settings;