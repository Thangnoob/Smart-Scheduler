import { useState, useEffect } from "react";
import SignUp from "./components/SignUp.jsx";
import SignIn from "./components/SignIn.jsx";
import AdminInfo from "./components/AdminInfo.jsx";
import UserInfo from "./components/UserInfo.jsx";

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const renderComponent = () => {
    switch (path) {
      case "/signup":
        return <SignUp />;
      case "/login":
        return <SignIn />;
      case "/admin/info":
        return <AdminInfo />;
      case "/user/info":
        return <UserInfo />;
      default:
        return <SignIn />;
    }
  };

  return <div>{renderComponent()}</div>;
}

// ✅ Thêm dòng này để xuất mặc định
export default App;
