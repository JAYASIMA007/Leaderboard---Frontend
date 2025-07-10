import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin';
import StudentLogin from './pages/Student/StudentLogin';
import StudentSignup from './pages/Student/StudentSignup';
import StudentPasswordSetup from './pages/Student/StudentPasswordSetup';
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentLeaderboard from './pages/Student/StudentLeaderboard';
import StudentTasks from './pages/Student/StudentTasks';
import StudentCriteria from './pages/Student/StudentCriteria';
import Dashboard from './pages/SuperAdmin/Dashboard';
import StudentForgotPassword from './pages/Student/StudentForgotPassword';
import StudentResetPassword from './pages/Student/StudentResetPassword';
import AdminLogin from './pages/Admin/AdminLogin';
import SuperAdminResetPassword from './pages/SuperAdmin/SuperAdminResetPassword';
import AdminResetPassword from './pages/Admin/AdminResetPassword';
import SuperAdminForgotPassword from './pages/SuperAdmin/SuperAdminForgotPassword';
import AdminForgotPassword from './pages/Admin/AdminForgotPassword';
import CreateEvent from './pages/SuperAdmin/CreateEvent';
import StudentUpload from './pages/SuperAdmin/StudentUpload';
import CreateAdmin from './pages/SuperAdmin/CreateAdmin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import EventListing from "../src/pages/SuperAdmin/EventListing";
import StudentProfilePage from './pages/Student/StudentProfilePage';
import TaskForEvent from './pages/Admin/TaskForEvent';
import TaskReport from './pages/Admin/TaskReport';
import AssignUsers from './pages/SuperAdmin/AssignUsers';
import StudentList from '../src/pages/Admin/StudentList';
import LeaderBoard from "../src/pages/Admin/LeaderBoard";
import SuperAdminLeaderBoard from './pages/SuperAdmin/SuperAdminLeaderboard';
import UserDetailView from './pages/Admin/UserDetailView';
import SuperAdminUserDetailView from './pages/SuperAdmin/SuperAdminUserdetailedView';

function App() {
  const handleLogin = (data: any) => {
    console.log('Login successful, full response:', JSON.stringify(data, null, 2));
    let jwt: string | undefined;
    
    // Try different possible JWT locations
    if (data?.attendance?.jwt?.jwt) {
      jwt = data.attendance.jwt.jwt;
    } else if (data?.jwt) {
      jwt = data.jwt;
    } else if (data?.token) {
      jwt = data.token;
    }

    if (jwt) {
      document.cookie = `jwt=${jwt}; path=/; SameSite=None; Secure`;
      console.log('JWT cookie set:', jwt);
    } else {
      console.error('No JWT found in login response');
    }
  };

  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* SuperAdmin Routes */}
        <Route path="/superadminlogin" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<Dashboard />} />
        <Route path="/superadmin/forgot-password" element={<SuperAdminForgotPassword />} />
        <Route path="/superadmin/reset-password" element={<SuperAdminResetPassword />} />
        <Route path="/superadmin/create-event" element={<CreateEvent />} />
        <Route path="/SuperAdmin/StudentUpload" element={<StudentUpload />} />
        <Route path="/superadmin/createadmin" element={<CreateAdmin />} />
        <Route path="/superadmin/EventListing" element={<EventListing />} />
        <Route path="/superadmin/leaderboard" element={<SuperAdminLeaderBoard />} />
        <Route path="/superadmin/leaderboard/:event_id/:view" element={<SuperAdminLeaderBoard />} />
        <Route path="/superadmin/assign-users/:eventId" element={<AssignUsers />} />
        <Route path="/superadmin/edit-event/:eventId" element={<CreateEvent />} />
        <Route path="/superadmin/leaderboard/:event_id/:view/:student_id" element={<SuperAdminUserDetailView />} />

        {/* Student Routes */}
        <Route path="/studentlogin" element={<StudentLogin onLogin={handleLogin} />} />
        <Route path="/studentsignup" element={<StudentSignup />} />
        <Route path="/student/setup-password" element={<StudentPasswordSetup />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
        <Route path="/student/tasks" element={<StudentTasks />} />
        <Route path="/student/criteria" element={<StudentCriteria />} />
        <Route path="/studentforgotpassword" element={<StudentForgotPassword />} />
        <Route path="/studentresetpassword" element={<StudentResetPassword />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />


        {/* Admin Routes */}
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/forgot-password-reset-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/tasks/:event_id/" element={<TaskForEvent />} />
        <Route path="/admin/report/task/:event_id/:task_id" element={<TaskReport />} />
        <Route path="/tasks/students/:event_id" element={<StudentList />} />
        <Route path="/tasks/leaderboard/:event_id" element={<LeaderBoard />} />
        <Route path="/tasks/leaderboard/:event_id/:view/:student_id" element={<UserDetailView />} />
      </Routes>
    </Router>
  );
}


export default App;