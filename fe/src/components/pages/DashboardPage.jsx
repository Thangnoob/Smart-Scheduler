import { useEffect, useState } from "react";
import { Clock, Calendar, BookOpen, Star, CheckCircle } from "lucide-react";
import api from "../../api/api";
import { useUser } from "../../context/UserContext";
import { Link } from "react-router-dom";

// const priorityColor = {
//   HIGH: "text-red-600",
//   MEDIUM: "text-yellow-600",
//   LOW: "text-green-600",
// };

const priorityColor = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "green",
};

const DashboardPage = () => {
  const { user } = useUser();
  const [studySessions, setStudySessions] = useState([]);
  const [freeTimes, setFreeTimes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [completedSession, setCompletedSession] = useState([]);

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

  const fetchStudySessionsCompleted = async () => {
    try {
      const response = await api.get(`/study-sessions/completed/user`);
      setCompletedSession(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy phiên học:", error);
    }
  };

  useEffect(() => {
    fetchStudySessionsToday();
    fetchFreeTimes();
    fetchSubjects();
    fetchStudySessionsCompleted();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Chào buổi tối, {user ? user.name : "Bạn"}!
        </h1>
        <p className="text-sm text-gray-500">
          Hôm nay là một ngày tuyệt vời để bắt đầu học tập
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              bgColor="bg-blue-100"
              value={freeTimes.length}
              title="Thời gian rảnh"
              subtitle="trong giờ/tuần"
            />
            <StatCard
              icon={<BookOpen className="w-6 h-6 text-yellow-600" />}
              bgColor="bg-yellow-100"
              value={studySessions.length}
              title="Phiên học"
              subtitle="tuần này"
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              bgColor="bg-green-100"
              value={completedSession.length}
              title="Hoàn thành"
              subtitle="phiên học"
            />
          </div>

          {/* Today's Study Schedule */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Lịch học hôm nay
            </h2>
            {studySessions.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {studySessions.map((session) => {
                  const subjectName =
                    subjects.find((s) => s.id === session.subjectId)?.name ||
                    "Môn học";
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
                        <Link
                          to="/user/schedule"
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Chi tiết
                        </Link>
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Tạo lịch học
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subjects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Môn học</h2>
              <Link
                to="/user/subjects"
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Xem tất cả
              </Link>
            </div>
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Chưa có môn học nào</p>
                <Link
                  to="/user/subjects"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Thêm môn học
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3 rounded-lg border border-gray-200 bg-${
                      priorityColor[s.priority]
                    }-50 shadow-sm text-sm text-${
                      priorityColor[s.priority]
                    }-800 flex justify-between `}
                  >
                    <span>{s.name}</span>
                    <span className="text-sm text-gray-500">
                      {s.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ icon, bgColor, value, title, subtitle }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex gap-4 items-center">
    <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  </div>
);

export default DashboardPage;
