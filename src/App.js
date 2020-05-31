import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Homepage from './Homepage';
import Dashboard from './CourseDashboard';
import EnrollSelectCourseYear from './Enroll_SelectCourseYear';
import EnrollWithPlan from './Enroll_EnrollWithPlan';
import SearchStudentData from './SearchStudentData';

import Admin from './admin/Admin';
import SystemManagement from './admin/SystemManagement';
import SystemCourseYearConfig from './admin/SystemCourseYearConfig';
import IndividualCourseYearConfig from './admin/IndividualCourseYearConfig';
import CreateCourse from './admin/CreateCourse';
import EditCourse from './admin/EditCourse';
import ViewCourse from './admin/ViewCourse';
import Register from './admin/Register';
import Settings from './admin/Settings';
import ManageStudent from './admin/ManageStudent';


function App() {
  return (
    <Router>
      <Switch>
        <Route path='/search/'>
          <SearchStudentData />
        </Route>
        <Route path='/course'>
          <Dashboard />
        </Route>
        <Route path='/enroll/step2'>
          <EnrollWithPlan />
        </Route>
        <Route path='/enroll'>
          <EnrollSelectCourseYear />
        </Route>
        <Route path='/admin/createcourse'>
          <CreateCourse />
        </Route>
        <Route path='/admin/viewcourse'>
          <ViewCourse />
        </Route>
        <Route path='/admin/editcourse'>
          <EditCourse />
        </Route>
        <Route path='/admin/course'>
          <SystemManagement />
        </Route>
        <Route path='/admin/managestudent'>
          <ManageStudent />
        </Route>
        <Route path='/admin/configcourseyear'>
          <IndividualCourseYearConfig />
        </Route>
        <Route path='/admin/system/configyear'>
          <SystemCourseYearConfig />
        </Route>
        <Route path='/admin/system/settings'>
          <Settings />
        </Route>
        <Route path='/admin'>
          <Admin />
        </Route>
        <Route path='/register'>
          <Register />
        </Route>
        <Route path='/'>
          <Homepage />
        </Route>
      </Switch>
    </Router>

  );
}

export default App;
