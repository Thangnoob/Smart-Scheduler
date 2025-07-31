import { useState, useMemo, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Sun,
  Moon,
  Sunrise,
  BadgeCheck,
} from "lucide-react";
import PomodoroTimer from "./PomodoroTimer";
import { useNotification } from "../../context/NotificationContext";

const getCurrentWeekDates = (currentWeekOffset = 0) => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) =>
    addDays(start, i + currentWeekOffset * 7)
  );
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "HIGH":
      return "bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300";
    case "MEDIUM":
      return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-300";
    case "LOW":
      return "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300";
    default:
      return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300";
  }
};

const groupFreeTimesByDay = (freeTimes) => {
  const dayMap = {
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    0: "Chủ nhật",
  };

  const grouped = {};
  Object.values(dayMap).forEach((day) => {
    grouped[day] = [];
  });

  freeTimes.forEach((freeTime) => {
    const dayName = dayMap[freeTime.dayOfWeek % 7];
    grouped[dayName].push(freeTime);
  });

  return grouped;
};

const groupSessionsByTimeSlot = (sessions) => {
  const grouped = {};

  // Initialize grouped structure for each day
  const dayNames = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  dayNames.forEach((dayName) => {
    grouped[dayName] = { morning: [], afternoon: [], evening: [] };
  });

  // Group study sessions
  sessions.forEach((session) => {
    const start = new Date(session.startTime);
    const dayOfWeek = start.getDay();
    const dayName = dayNames[dayOfWeek];

    const hour = start.getHours();
    let timeSlot = "";
    if (hour < 12) timeSlot = "morning";
    else if (hour < 18) timeSlot = "afternoon";
    else timeSlot = "evening";

    grouped[dayName][timeSlot].push({ ...session, type: "study" });
  });

  // Sort sessions within each time slot
  dayNames.forEach((dayName) => {
    ["morning", "afternoon", "evening"].forEach((slot) => {
      grouped[dayName][slot].sort((a, b) => {
        const ta =
          a.type === "study" ? a.startTime : `1970-01-01T${a.startTime}`;
        const tb =
          b.type === "study" ? b.startTime : `1970-01-01T${b.startTime}`;
        return ta.localeCompare(tb);
      });
    });
  });
  return grouped;
};

const WeeklyCalendar = ({
  freeTimes,
  studySessions,
  onChangeWeek,
  onReloadSessions,
}) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const groupedSessions = groupSessionsByTimeSlot(studySessions);
  const groupedFreeTimesByDay = groupFreeTimesByDay(freeTimes);

  const { notify } = useNotification();

  const timeSlots = [
    { label: "Sáng", key: "morning", icon: Sunrise, color: "text-yellow-600" },
    { label: "Chiều", key: "afternoon", icon: Sun, color: "text-orange-600" },
    { label: "Tối", key: "evening", icon: Moon, color: "text-indigo-600" },
  ];

  const dayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  const daysOfWeek = useMemo(
    () => getCurrentWeekDates(currentWeek),
    [currentWeek]
  );

  const handleSessionClick = (session) => {
    const now = new Date();
    const endTime = new Date(session.endTime);

    if (session.completed) {
      notify("Phiên học đã hoàn thành", "info");
      return;
    }

    if (endTime < now) {
      notify("Phiên học này đã hết hạn. Vui lòng chọn phiên khác!", "error");
      return;
    }

    if (session.type === "study") {
      setSelectedSession({
        id: session.id,
        subjectName: session.subjectName,
        duration: session.duration,
        startTime: session.startTime,
        endTime: session.endTime,
      });
      setShowModal(true);
    }
  };

  const isToday = (dayName) => {
    const today = new Date();
    var index = today.getDay();
    if (index != 7) {
      index = index - 1;
    } else {
      index = 0;
    }
    const todayDayName = dayNames[index];
    return dayName === todayDayName;
  };

  const getWeekRange = () => {
    const startDate = daysOfWeek[0];
    const endDate = daysOfWeek[6];
    return `${format(startDate, "dd/MM")} - ${format(endDate, "dd/MM/yyyy")}`;
  };

  const handlePrevWeek = () => {
    const newOffset = currentWeek - 1;
    setCurrentWeek(newOffset);
    onChangeWeek(newOffset);
  };

  const handleNextWeek = () => {
    const newOffset = currentWeek + 1;
    setCurrentWeek(newOffset);
    onChangeWeek(newOffset);
  };

  const handleThisWeek = () => {
    const newOffset = 0;
    setCurrentWeek(newOffset);
    onChangeWeek(newOffset);
  };

  return (
    <div className="my-2 max-w-7xl mx-auto">
      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white rounded-xl p-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-medium text-gray-600">
              {getWeekRange()}
            </div>
            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevWeek}
                className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Tuần trước</span>
              </button>

              <button
                onClick={handleThisWeek}
                className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors duration-200 font-medium"
              >
                Tuần hiện tại
              </button>

              <button
                onClick={handleNextWeek}
                className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium text-gray-700"
              >
                <span>Tuần sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Header Row */}
        <div className="grid grid-cols-8 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="p-4 text-center font-semibold text-white border-r border-indigo-400">
            <Clock className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm">Thời gian</div>
          </div>
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`p-4 text-center border-r border-indigo-400 last:border-r-0 ${
                isToday(day) ? "bg-yellow-400 text-gray-900" : "text-white"
              }`}
            >
              <div className="font-semibold text-sm">{day}</div>
              <div className="text-xs mt-1 opacity-90">
                {format(daysOfWeek[index], "dd/MM")}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 border-t border-gray-300">
          <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 border-r border-gray-300">
            Thời gian rảnh
          </div>
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="p-3 min-h-[60px] border-r border-gray-200 last:border-r-0"
            >
              <div className="space-y-2">
                {(groupedFreeTimesByDay[day] || []).map((time, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-1 mb-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-md px-2 py-1 text-xs font-medium shadow"
                  >
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">
                      {time.startTime.slice(0, 5)} - {time.endTime.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slot Rows */}
        {timeSlots.map((slot, slotIndex) => (
          <div
            key={slot.key}
            className={`grid grid-cols-8 border-b border-gray-200 ${
              slotIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 border-r border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <slot.icon className={`w-5 h-5 mx-auto mb-1 ${slot.color}`} />
                <div className="font-semibold text-gray-700 text-sm">
                  {slot.label}
                </div>
              </div>
            </div>

            {dayNames.map((day, dayIndex) => (
              <div
                key={day}
                className={`p-3 border-r border-gray-200 last:border-r-0 min-h-[100px] ${
                  isToday(day) ? "bg-blue-50" : ""
                }`}
              >
                <div className="space-y-2">
                  {(groupedSessions[day]?.[slot.key] || []).map(
                    (session, sessionIndex) => (
                      <div
                        key={`${session.id}-${sessionIndex}`}
                        onClick={() => handleSessionClick(session)}
                        className={`
                        cursor-pointer rounded-lg p-2 text-xs font-medium shadow-sm
                        transform transition-all duration-200 hover:scale-105 hover:shadow-md
                        ${
                          session.type === "study"
                            ? getPriorityColor(session.priority)
                            : "bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-300"
                        }
                      `}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          {session.completed ? (
                            <BadgeCheck className="w-3 h-3 text-green-500" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span className="font-semibold">
                            {session.type === "study"
                              ? `${session.startTime.slice(
                                  11,
                                  16
                                )} - ${session.endTime.slice(11, 16)}`
                              : `${session.startTime.slice(
                                  0,
                                  5
                                )} - ${session.endTime.slice(0, 5)}`}
                          </span>
                        </div>
                        <div>
                          {session.completed
                            ? `${session.subjectName} - Đã học `
                            : session.subjectName}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        {/* Legend */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Chú thích
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-sm shadow-sm" />
              <span className="text-sm font-medium text-gray-700">
                Ưu tiên cao
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-sm shadow-sm" />
              <span className="text-sm font-medium text-gray-700">
                Ưu tiên vừa
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-sm shadow-sm" />
              <span className="text-sm font-medium text-gray-700">
                Ưu tiên thấp
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-sm shadow-sm" />
              <span className="text-sm font-medium text-gray-700">
                Thời gian rảnh
              </span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <PomodoroTimer
          sessionId={selectedSession.id}
          subjectName={selectedSession.subjectName}
          duration={selectedSession.duration}
          totalPomodoros={selectedSession.totalPomodoros}
          onCompleted={onReloadSessions}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default WeeklyCalendar;
