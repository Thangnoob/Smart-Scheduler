import { useEffect, useState } from "react";
import { Clock, Calendar, BookOpen, Star, CheckCircle } from "lucide-react";

import api from "../../api/api";
import { useUser } from "../../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { user, loading, logout } = useUser();
  const [studySessions, setStudySessions] = useState([]);
  const [freeTimes, setFreeTimes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách môn học:", err);
    }
  };

  const fetchFreeTimes = async () => {
    try {
      const response = await api.get("/free-times");
      setFreeTimes(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thời gian rảnh:", error);
    }
  };

  const fetchStudySessionsToday = async () => {
    try {
      const response = await api.get(`/study-sessions/today`);
      setStudySessions(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy phiên học:", error);
    }
  };

  useEffect(() => {
    fetchStudySessionsToday();
    fetchFreeTimes();
    fetchSubjects();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Chào buổi tối, {user ? user.name : "Bạn"}!
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
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {freeTimes.length}
                    </div>
                    <div className="text-sm text-gray-600">Thời gian rảnh</div>
                    <div className="text-xs text-gray-500">trong giờ/tuần</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <BookOpen className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {studySessions.length}
                    </div>
                    <div className="text-sm text-gray-600">Phiên học</div>
                    <div className="text-xs text-gray-500">tuần này</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Hoàn thành</div>
                    <div className="text-xs text-gray-500">phiên học</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Learning Schedule */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Lịch học hôm nay
                </h2>
                {studySessions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {studySessions.map((session) => {
                      const subjectName =
                        subjects.find((s) => s.id === session.subjectId)
                          ?.name || "Môn học";
                      return (
                        <div
                          key={session.id}
                          className="p-4 rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800">
                                {subjectName}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {new Date(session.startTime).toLocaleString()} -{" "}
                                {new Date(session.endTime).toLocaleString()}
                              </p>
                            </div>
                            {/* <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(session)}
                                className="text-violet-500 hover:text-violet-700"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(session.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div> */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Chưa có lịch học cho hôm nay
                    </p>
                    <Link
                      to="/user/schedule"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Tạo lịch học
                    </Link>
                  </div>
                )}
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

            {/* Recent Activities
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
            </div> */}
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
