import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Play,
  User,
  Settings,
  Bell,
  Plus,
  Star,
} from "lucide-react";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");

  const stats = [
    {
      label: "Hôm nay",
      value: "0.0h",
      icon: Clock,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Tuần này",
      value: "0.0h",
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Chuỗi học tập",
      value: "0 ngày",
      icon: Calendar,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Hoàn thành",
      value: "N/A%",
      icon: Target,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const quickActions = [
    {
      title: "Quy tắc thành",
      subtitle: "Tập trung vào việc học để cải thiện hiệu quả",
      icon: Target,
      color: "bg-blue-500",
    },
    {
      title: "Thành tích",
      subtitle: "Một thành tích đặc biệt",
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      title: "Thành tích học tập",
      subtitle: "Cùng với kết quả học tập",
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      title: "Thành tích học tập",
      subtitle: "Học gồm 1650 điểm",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const activities = [
    {
      title: "Lập trình",
      subtitle: "Cấp mới sáng tạo",
      points: "5 điểm",
      color: "bg-blue-500",
    },
    {
      title: "Tiếng Anh",
      subtitle: "Từ ngữ và từ vựng thông dụng",
      points: "3 điểm",
      color: "bg-green-500",
    },
    {
      title: "Toán học",
      subtitle: "Giải quyết vấn đề toán học",
      points: "4 điểm",
      color: "bg-purple-500",
    },
    {
      title: "Khoa học",
      subtitle: "Nguyên lý khoa học cơ bản",
      points: "6 điểm",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      {/* Header */}
      <div className="py-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Chào buổi tối, Thành!
          </h1>
          <p className="text-sm text-gray-500">
            Hôm nay là một ngày tuyệt vời để bắt đầu học tập
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div
                    className={`inline-flex items-center justify-center p-2 rounded-lg ${stat.color} mb-2`}
                  >
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Learning Schedule */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Lịch học hôm nay
                </h2>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Chưa có lịch học cho hôm nay
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Tạo lịch học
                  </button>
                </div>
              </div>
            </div>

            {/* Study Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tiến độ môn học
                  </h2>
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    Xem tất cả môn học
                  </button>
                </div>
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Chưa có môn học nào</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Thêm môn học
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Phân tích học tập
                  </h2>
                  <select className="text-sm border rounded-lg px-3 py-1">
                    <option>Tuần này</option>
                    <option>Tháng này</option>
                    <option>Năm này</option>
                  </select>
                </div>
                <div className="text-center py-8">
                  <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Thành tích
                  </h2>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Chưa có thành tích nào</p>
                  <p className="text-sm text-gray-400">
                    Hãy bắt đầu học tập để nhận thành tích
                  </p>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>Thành tích học tập</span>
                    <span>0/1000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>Học gồm 1650 điểm</span>
                    <span>0/1000</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Duy trì động lực với mục tiêu
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Tiếp tục khôi</p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Bắt đầu học tập học
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    x tiếp tục phát triển
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Thao tác nhanh
                </h2>
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${activity.color} mr-3`}>
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.subtitle}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {activity.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trophy icon component
const Trophy = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
);

export default DashboardPage;
