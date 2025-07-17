import React, { useState } from "react";
import { BarChart2, BookOpen, Calendar, Star, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function Navbar() {
  const { user, loading, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 dark:text-white shadow px-4 py-3 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="bg-violet-600 text-white p-2 rounded-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"
              />
            </svg>
          </div>
          <span className="font-bold text-lg">StudyNow</span>
        </div>

        <div className="hidden md:flex space-x-6 text-sm items-center">
          <a href="#" className="flex items-center text-violet-600 font-medium">
            <BarChart2 className="w-4 h-4 mr-1" />
            Tổng quan
          </a>
          <a href="#" className="flex items-center hover:text-violet-600">
            <BookOpen className="w-4 h-4 mr-1" />
            Môn học
          </a>
          <a href="#" className="flex items-center hover:text-violet-600">
            <Calendar className="w-4 h-4 mr-1" />
            Lịch học
          </a>
          <a href="#" className="flex items-center hover:text-violet-600">
            <BarChart2 className="w-4 h-4 mr-1" />
            Phân tích
          </a>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-yellow-500">
          <Star className="w-5 h-5" />
          <span className="ml-1 text-sm text-black dark:text-white">0</span>
        </div>

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
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-md z-50">
                <Link
                  to={user.role === "ADMIN" ? "/admin/info" : "/user/info"}
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Hồ sơ
                </Link>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cài đặt
                </a>
                <button
                  onClick={logout}
                  className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}

        <button
          className="md:hidden ml-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-md md:hidden z-40">
          <div className="flex flex-col p-4 space-y-2">
            <a href="#" className="flex items-center hover:text-violet-600">
              <BarChart2 className="w-4 h-4 mr-1" />
              Tổng quan
            </a>
            <a href="#" className="flex items-center hover:text-violet-600">
              <BookOpen className="w-4 h-4 mr-1" />
              Môn học
            </a>
            <a href="#" className="flex items-center hover:text-violet-600">
              <Calendar className="w-4 h-4 mr-1" />
              Lịch học
            </a>
            <a href="#" className="flex items-center hover:text-violet-600">
              <BarChart2 className="w-4 h-4 mr-1" />
              Phân tích
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
