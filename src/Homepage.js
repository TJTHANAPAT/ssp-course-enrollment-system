import React from 'react';
import Footer from './components/Footer';

class Homepage extends React.Component {
    render(){
        return (
            <div className="body body-center bg-gradient text-white">
                <div className="wrapper-no-bg-color">
                    <h1>ระบบลงทะเบียนรายวิชาเพิ่มเติม</h1>
                    <h4>โรงเรียนสตรีสมุทรปราการ</h4>
                    <div className="mt-3">
                        <a className="btn btn-landing m-2" href="/enroll">ลงทะเบียน</a>
                        <a className="btn btn-landing m-2" href="/search">ค้นหา</a>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Homepage;