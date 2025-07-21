import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import SignUp from "./components/SignUp.jsx";
import SignIn from "./components/SignIn.jsx";
import AdminInfo from "./components/AdminInfo.jsx";
import UserInfo from "./components/UserInfo.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import { useEffect } from "react";
import { UserProvider } from "./context/UserContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/route/ProtectedRoute.jsx";
import GuestRoute from "./components/route/GuestRoute.jsx";
import DashboardPage from "./components/pages/DashboardPage.jsx";
import SubjectPage from "./components/subject/SubjectPage.jsx";
import ScheduleCalendar from "./components/freetime/ScheduleCalendar.jsx";

// ✅ Layout phải nằm bên trong <Router>
function Layout({ children }) {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    document.title = "StudyNow";
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 ">
      {!hideNavbar && <Navbar />}
      {children}
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <UserProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <SignIn />
                  </GuestRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <GuestRoute>
                    <SignUp />
                  </GuestRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}></ProtectedRoute>
                }
              ></Route>
              <Route path="/user/info" element={<UserInfo />} />
              <Route path="/user/dashboard" element={<DashboardPage />}></Route>
              <Route path="*" element={<SignIn />} />
              <Route path="/user/subjects" element={<SubjectPage />}></Route>
              <Route
                path="/user/schedule"
                element={<ScheduleCalendar></ScheduleCalendar>}
              />
              <Route path="/user/analytics" element={<div>Coming soon</div>} />
            </Routes>
          </Layout>
        </UserProvider>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
