import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  Plus,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import FreeTimeModal from "./FreeTimeModal";
import api from "../../api/api";

import WeeklyCalendar from "./ScheduleWithBigCalendar"; // đường dẫn phù hợp với project bạn

const dayLabels = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

function getCurrentWeekDates() {
  const today = new Date(); // hôm nay
  const currentDay = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

  const startOfWeek = new Date(today); // clone
  startOfWeek.setDate(today.getDate() - currentDay); // lùi về Chủ nhật

  const week = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);

    week.push({
      day: dayLabels[i],
      date: day.getDate(),
      hasClass: false,
    });
  }

  return week;
}

const daysOfWeek = getCurrentWeekDates();

const ScheduleCalendar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("06:00");
  const [freeTimeSlots, setFreeTimeSlots] = useState([]);
  const [studySessions, setStudySessions] = useState([]);

  const generateStudySessions = async () => {
    try {
      const response = await api.post("/study-sessions/generate");
      setStudySessions(response.data);
    } catch (error) {
      console.error("Lỗi khi tạo lịch học:", error);
    }
  };

  const [freeTimes, setFreeTimes] = useState([]);

  const fetchFreeTimes = async () => {
    try {
      const response = await api.get("/free-times");
      setFreeTimes(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thời gian rảnh:", error);
    }
  };

  const fetchStudySession = async () => {
    try {
      const response = await api.get("/study-sessions/this-week");
      setStudySessions(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy phiên học:", error);
    }
  };

  useEffect(() => {
    fetchFreeTimes();
    fetchStudySession();
  }, []);

  const getDayName = (dayOfWeek) => {
    const mapping = {
      1: "Thứ 2",
      2: "Thứ 3",
      3: "Thứ 4",
      4: "Thứ 5",
      5: "Thứ 6",
      6: "Thứ 7",
      7: "Chủ nhật",
    };
    return mapping[dayOfWeek];
  };

  const renderFreeTimeForDay = (dayName) => {
    const slotsForDay = freeTimes.filter(
      (slot) => getDayName(slot.dayOfWeek) === dayName
    );

    if (slotsForDay.length === 0) {
      return (
        <div className="flex items-center justify-center text-gray-400 text-sm mt-2">
          <Calendar className="w-4 h-4 mr-1" />
          Chưa có lịch
        </div>
      );
    }

    return slotsForDay.map((slot) => (
      <div
        key={slot.id}
        className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2"
      >
        <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
          <Clock className="w-4 h-4" />
          {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
        </div>
        <div className="text-xs text-blue-600">Rảnh</div>
      </div>
    ));
  };
  const renderStudySessionsForDay = (dayName) => {
    const sessionsForDay = studySessions.filter((session) => {
      const day = new Date(session.startTime).getDay(); // 0 - Chủ nhật
      return getDayName(day === 0 ? 7 : day) === dayName; // map về 'Thứ X'
    });

    return sessionsForDay.map((session) => (
      <div
        key={session.id}
        className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2"
      >
        <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
          <BookOpen className="w-4 h-4" />
          {session.startTime.slice(11, 16)} - {session.endTime.slice(11, 16)}
        </div>
        <div className="text-xs text-green-600">Học</div>
      </div>
    ));
  };

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleSuccess() {
    fetchFreeTimes();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch học tập</h1>
            <p className="text-gray-600">
              Quản lý thời gian và theo dõi tiến độ học tập
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <Clock className="w-5 h-5" />
              Quản lý thời gian rảnh
            </button>
            <button
              onClick={generateStudySessions}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Tạo lịch AI
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <WeeklyCalendar
          freeTimes={freeTimes}
          studySessions={studySessions}
          onGenerateStudySessions={generateStudySessions}
        />

        {/* Stats */}
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
                <div className="text-2xl font-bold text-gray-900">0</div>
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
      </div>

      <FreeTimeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        freeTimeSlots={freeTimes}
      ></FreeTimeModal>
    </div>
  );
};

export default ScheduleCalendar;
