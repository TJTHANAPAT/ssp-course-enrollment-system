import React from 'react';
import * as system from '../functions/systemFunctions';
import * as enroll from './enrollCourseFunction'
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';
import StudentInfoEnrollForm from './Enroll_StudentInfoForm';
import EnrollPlanSelector from './Enroll_SelectEnrollPlan';
import CoursesSelector from './Enroll_SelectCourses';
import EnrollmentCompletePage from './Enroll_CompletePage';

class Enrollment extends React.Component {
    state = {
        isLoading: true,
        isEnrollmentSuccess: false
    }

    componentDidMount = async () => {
        try {
            const courseYear = await system.getURLParam('courseYear');
            const getSystemConfig = await system.getSystemConfig();
            const systemConfig = getSystemConfig.systemConfig;
            const courseYearsArr = systemConfig.courseYears;
            await enroll.checkCourseYearAvailable(courseYear, systemConfig);
            const getCourseYearConfig = await system.getCourseYearConfig(courseYear, courseYearsArr);
            const courseYearConfig = getCourseYearConfig.config;
            const coursesData = await enroll.getCoursesData(courseYear);
            this.setState({
                isLoading: false,
                courseYear: courseYear,
                courseYearConfig: courseYearConfig,
                gradesArr: courseYearConfig.grades,
                coursesData: coursesData
            });
        }
        catch (err) {
            console.error(err)
            this.setState({
                isLoading: false,
                isError: true,
                errorMessage: err
            });
        }
    }

    goBackStudentInfoForm = () => {
        this.setState({ isAllowSelectEnrollPlan: false });
    }
    goSelectEnrollPlan = (studentInfo) => {
        this.setState({
            studentInfo: studentInfo,
            isAllowSelectEnrollPlan: true
        })
        console.log('student info ', studentInfo)
    }
    goBackSelectEnrollPlan = () => {
        this.setState({ isAllowSelectCourses: false });
    }
    goSelectCourses = (studentEnrollPlan) => {
        this.setState({
            studentEnrollPlan: studentEnrollPlan,
            isAllowSelectCourses: true
        })
        console.log('studentEnrollPlan ', studentEnrollPlan)
    }
    completeEnrollment = (studentData) => {
        this.setState({
            studentData: studentData,
            isEnrollmentComplete: true
        })
    }

    render() {
        const {
            isLoading,
            isError,
            errorMessage,
            courseYear,
            isAllowSelectEnrollPlan,
            isAllowSelectCourses,
            isEnrollmentComplete
        } = this.state;
        if (isLoading) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'home'} />
        } else if (isEnrollmentComplete) {
            return (
                <EnrollmentCompletePage
                    courseYear={courseYear}
                    coursesData={this.state.coursesData}
                    studentData={this.state.studentData}
                />
            )
        } else if (isAllowSelectCourses) {
            return (
                <CoursesSelector
                    courseYear={courseYear}
                    coursesData={this.state.coursesData}
                    enrollPlans={this.state.courseYearConfig.enrollPlans}
                    studentInfo={this.state.studentInfo}
                    studentEnrollPlan={this.state.studentEnrollPlan}
                    goNextStepFunction={this.completeEnrollment}
                    goPreviousStepFunction={this.goBackSelectEnrollPlan}
                />
            )
        } else if (isAllowSelectEnrollPlan) {
            return (
                <EnrollPlanSelector
                    courseYear={courseYear}
                    enrollPlans={this.state.courseYearConfig.enrollPlans}
                    goNextStepFunction={this.goSelectCourses}
                    goPreviousStepFunction={this.goBackStudentInfoForm}
                />
            )
        } else {
            return (
                <StudentInfoEnrollForm
                    courseYear={courseYear}
                    gradesArr={this.state.gradesArr}
                    studentInfo={this.state.studentInfo}
                    goNextStepFunction={this.goSelectEnrollPlan}
                />
            )
        }
    }
}

export default Enrollment;