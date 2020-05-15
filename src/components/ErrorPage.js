import React from 'react';
import Footer from './Footer';

class ErrorPage extends React.Component {
    goBack = () => {
        window.history.back();
    }
    render() {
        const btn = () => {
            if (this.props.btn === 'home') {
                return <a href="/" className="btn btn-wrapper-bottom btn-green">กลับหน้าแรก</a>
            } else if (this.props.btn === 'none') {
                return true
            } else {
                return <button className="btn btn-wrapper-bottom btn-green" onClick={this.goBack}>ย้อนกลับ</button>
            }
        }

        const errorTitle = () => {
            if (this.props.errorTitle === undefined) {
                return <h2>ขออภัย มีบางอย่างผิดพลาด</h2>
            } else {
                return <h2>{this.props.errorTitle}</h2>
            }
        }

        return (
            <div className="body body-center bg-gradient">
                <div className="wrapper">
                    <div className="row align-items-center">
                        <div className="col-sm-3 text-center mb-3">
                            <i className="fa fa-exclamation-triangle fa-5x" aria-hidden="false"></i>
                        </div>
                        <div className="col-sm-9 text-left">
                            {errorTitle()}
                            <p>{this.props.errorMessage}</p>
                        </div>
                    </div>
                    {btn()}
                </div>
                <Footer />
            </div>
        )
    }
}

export default ErrorPage