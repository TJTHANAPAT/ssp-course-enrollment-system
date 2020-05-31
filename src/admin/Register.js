import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Footer from '../components/Footer';
import * as system from '../functions/systemFunctions';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';

class Register extends React.Component {
    state = {
        isLoading: true,
        isSignedIn: false
    };

    componentDidMount = async () => {
        try {
            const getSystemConfig = await system.getSystemConfig(false);
            const systemConfig = getSystemConfig.systemConfig;
            const isFirstInitSystem = getSystemConfig.isFirstInitSystem;
            this.setState({ isFirstInitSystem: isFirstInitSystem });
            const isRegisterEnabled = isFirstInitSystem ? true : systemConfig.isRegisterEnabled;
            if (isRegisterEnabled) {
                this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
                    (user) => this.setState({ isSignedIn: !!user })
                );
            }
            this.setState({isRegisterEnabled: isRegisterEnabled});
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

    componentWillUnmount = () => {
        this.unregisterAuthObserver();
    }

    uiConfig = {
        signInFlow: 'popup',
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
            signInSuccess: () => false
        }
    };

    render() {
        const { isLoading, isRegisterEnabled, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'none'} />
        } else if (isRegisterEnabled) {
            const {isFirstInitSystem, isSignedIn} = this.state;
            if (isSignedIn && isFirstInitSystem) {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper text-left">
                            <h1>ยินดีต้อนรับ</h1>
                            <p>ยินดีต้อนรับ {firebase.auth().currentUser.displayName}!</p>
                            <p>ยังไม่มีการตั้งค่าปีการศึกษา กดปุ่มด้านล่างเพื่อทำการตั้งค่าปีการศึกษา</p>
                            <div>
                                <a role="button" className="btn btn-purple m-1" href="/admin/system/configyear">ตั้งค่าปีการศึกษา</a>
                                <button className="btn btn-green m-1" onClick={() => firebase.auth().signOut()}>ลงชื่อออก</button>
                            </div>
                        </div>
                        <Footer />
                    </div>
                )
            } else if (isSignedIn) {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper text-left">
                            <h1>ยินดีต้อนรับ</h1>
                            <p>ยินดีต้อนรับ {firebase.auth().currentUser.displayName}!</p>
                            <div>
                                <a className="btn btn-purple m-1" href="/admin">การจัดการระบบ</a>
                                <button className="btn btn-green m-1" onClick={() => firebase.auth().signOut()}>ลงชื่อออก</button>
                            </div>
                        </div>
                        <Footer />
                    </div>
                )

            } else {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper-no-color text-white">
                            <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
                        </div>
                        <Footer />
                    </div>
                )
            }
        } else {
            return (
                <ErrorPage
                    errorTitle={'Sorry, register is currently disabled.'}
                    errorMessage={'Register is currently disabled. Contact the admin for more information.'}
                    btn={'none'}
                />
            )
        }

    }
}

export default Register;