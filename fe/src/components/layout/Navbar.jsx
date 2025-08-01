import React, { useState } from "react";
import { BarChart2, BookOpen, Calendar, Star, Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function Navbar() {
  const { user, loading, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow px-4 py-3 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-5">
        <Link className="rounded-lg text-white p-2" to="/user/dashboard">
          <img src="/images/logo.png" alt="login-image" className="w-15 h-10" />
        </Link>

        <div className="hidden md:flex space-x-6 text-sm items-center">
          <NavLink
            to="/user/dashboard"
            className={({ isActive }) =>
              `flex items-center ${
                isActive
                  ? "text-violet-600 font-medium"
                  : "hover:text-violet-600"
              }`
            }
          >
            <BarChart2 className="w-4 h-4 mr-1" />
            Tổng quan
          </NavLink>
          <NavLink
            to="/user/subjects"
            className={({ isActive }) =>
              `flex items-center ${
                isActive
                  ? "text-violet-600 font-medium"
                  : "hover:text-violet-600"
              }`
            }
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Môn học
          </NavLink>

          <NavLink
            to="/user/schedule"
            className={({ isActive }) =>
              `flex items-center ${
                isActive
                  ? "text-violet-600 font-medium"
                  : "hover:text-violet-600"
              }`
            }
          >
            <Calendar className="w-4 h-4 mr-1" />
            Lịch học
          </NavLink>

          <NavLink
            to="/user/analytics"
            className={({ isActive }) =>
              `flex items-center ${
                isActive
                  ? "text-violet-600 font-medium"
                  : "hover:text-violet-600"
              }`
            }
          >
            <BarChart2 className="w-4 h-4 mr-1" />
            Phân tích
          </NavLink>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-7">
        {/* <div className="flex items-center text-yellow-500">
          <Star className="w-5 h-5" />
          <span className="ml-1 text-sm text-black ">0</span>
        </div> */}

        {!user ? (
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Đăng nhập
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm text-white font-semibold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-md z-50">
                <Link
                  to={user.role === "ADMIN" ? "/admin/info" : "/user/info"}
                  className="block px-4 py-2 text-sm hover:bg-gray-100 "
                >
                  Hồ sơ
                </Link>

                <button
                  onClick={logout}
                  className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 "
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
        {menuOpen && (
          <div className="fixed top-[64px] left-0 w-full bg-white shadow-md md:hidden z-40">
            <div className="flex flex-col p-4 space-y-2">
              <NavLink
                to="/user/dashboard"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive
                      ? "text-violet-600 font-medium"
                      : "hover:text-violet-600"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                <BarChart2 className="w-4 h-4 mr-1" />
                Tổng quan
              </NavLink>
              <NavLink
                to="/user/subjects"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive
                      ? "text-violet-600 font-medium"
                      : "hover:text-violet-600"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Môn học
              </NavLink>
              <NavLink
                to="/user/schedule"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive
                      ? "text-violet-600 font-medium"
                      : "hover:text-violet-600"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Lịch học
              </NavLink>
              <NavLink
                to="/user/analytics"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive
                      ? "text-violet-600 font-medium"
                      : "hover:text-violet-600"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                <BarChart2 className="w-4 h-4 mr-1" />
                Phân tích
              </NavLink>
            </div>
          </div>
        )}

        <button
          className="md:hidden ml-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
