import React from 'react';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import SystemManagement from './SystemManagement';
import Register from './Register';
import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';


class Admin extends React.Component {

    state = {
        isLoading: true
    }

    componentDidMount = async () => {
        try {
            const getSystemConfig = await system.getSystemConfig(false);
            const isFirstInitSystem = getSystemConfig.isFirstInitSystem;
            this.setState({ isFirstInitSystem: isFirstInitSystem });
            if (!isFirstInitSystem) {
                const user = await auth.checkAuthState(false);
                this.setState({
                    currentUser: user,
                    isSignedIn: !!user,
                })
            }
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

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    login = async (event) => {
        try {
            event.preventDefault()
            const { email, password } = this.state;
            this.setState({isLoading: true});
            const user = await auth.signInWithEmailAndPassword(email, password);
            this.setState({
                currentUser: user,
                isSignedIn: !!user
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

    loginForm = () => {
        const updateInput = this.updateInput;
        return (
            <form onSubmit={this.login} className="mt-4">
                <div className="input-group mb-2">
                    <div className="input-group-prepend">
                        <div className="input-group-text">
                            <i className="fa fa-user"></i>
                        </div>
                    </div>
                    <input type="email" className="form-control" id="email" placeholder="อีเมล" onChange={updateInput} required />
                </div>
                <div className="input-group mb-2">
                    <div className="input-group-prepend">
                        <div className="input-group-text">
                            <i className="fa fa-lock"></i>
                        </div>
                    </div>
                    <input type="password" className="form-control" id="password" placeholder="รหัสผ่าน" onChange={updateInput} required />
                </div>
                <button type="submit" className="btn btn-wrapper-bottom btn-purple ">เข้าสู่ระบบ</button>
            </form>
        )
    }

    render() {
        const { isLoading, isFirstInitSystem, isSignedIn, isError, errorMessage } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'none'} />
        } else if (isFirstInitSystem) {
            return <Register />
        } else if (isSignedIn) {
            return <SystemManagement />
        } else {
            return (
                <div className="body body-center bg-gradient">
                    <div className="wrapper login-form text-left">
                        <h1>เข้าสู่ระบบ</h1>
                        {this.loginForm()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }

}

export default Admin;