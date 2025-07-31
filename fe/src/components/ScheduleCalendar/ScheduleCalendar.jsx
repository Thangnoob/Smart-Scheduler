import { useEffect, useState } from "react";
import { Clock, Plus, NotebookPen } from "lucide-react";
import FreeTimeModal from "../freetime/FreeTimeModal";
import api from "../../api/api";
import { useNotification } from "../../context/NotificationContext";
import WeeklyCalendar from "./ScheduleWithBigCalendar";
import GenerateScheduleModal from "./GenerateScheduleModal";
import StudySessionModal from "../studysession/StudySessionModal";
import { Tooltip } from "react-tooltip";

const ScheduleCalendar = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [studySessions, setStudySessions] = useState([]);
  const [freeTimes, setFreeTimes] = useState([]);
  const { notify } = useNotification();
  const [completedStudySession, setCompletedStudySession] = useState(null);

  const handleGenerateSchedule = async (daysAhead) => {
    try {
      const response = await api.post(
        `/study-sessions/generate?daysAhead=${daysAhead}`
      );
      notify("Tạo lịch học thành công!", "success");
      fetchStudySessions(); // refresh lịch
    } catch (error) {
      if (error.response?.status === 400) {
        notify(error.response.data, "error");
      } else {
        notify("Có lỗi xảy ra khi tạo lịch học", "error");
      }
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

  const fectchCompletedStudySession = async () => {
    try {
      const response = await api.get("/study-sessions/completed/user");
      setCompletedStudySession(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy phiên học:", error);
    }
  };

  const fetchStudySessions = async (offset = 0) => {
    try {
      const response = await api.get(`/study-sessions/week?offset=${offset}`);
      setStudySessions(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy phiên học:", error);
    }
  };

  useEffect(() => {
    fetchFreeTimes();
    fetchStudySessions();
    fectchCompletedStudySession();
  }, []);

  function handleCloseModal() {
    setActiveModal(false);
  }

  function handleFreeTimeModalSuccess() {
    fetchFreeTimes();
  }

  function handleStudySessionModalSuccess() {
    fetchStudySessions();
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
              data-tooltip-id="tooltip-studysession"
              data-tooltip-content="Thêm, xóa, sửa các phiên học tập"
              onClick={() => setActiveModal("studySession")}
              className="flex items-center gap-2 px-4 py-2 bg-green-400 text-gray-700 border border-gray-300 rounded-lg hover:bg-green-500"
            >
              <NotebookPen />
              Quản lý phiên học
              <Tooltip id="tooltip-studysession" />
            </button>

            <button
              data-tooltip-id="tooltip-freetime"
              data-tooltip-content="Thêm, xóa, sửa các khoảng thời gian rảnh"
              onClick={() => setActiveModal("freetime")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <Clock className="w-5 h-5" />
              Quản lý thời gian rảnh
              <Tooltip id="tooltip-freetime" />
            </button>

            <button
              data-tooltip-id="tooltip-generateAI"
              data-tooltip-content="Tạo lịch học dựa vào môn học và thời gian rảnh tự động bằng AI"
              onClick={() => setActiveModal("generate")}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Tạo lịch AI
              <Tooltip id="tooltip-generateAI" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <WeeklyCalendar
          freeTimes={freeTimes}
          studySessions={studySessions}
          onChangeWeek={fetchStudySessions}
          onReloadSessions={fetchStudySessions}
        />
      </div>

      {activeModal === "generate" && (
        <GenerateScheduleModal
          isOpen={activeModal}
          onClose={handleCloseModal}
          onConfirm={handleGenerateSchedule}
        />
      )}
      {activeModal === "freetime" && (
        <FreeTimeModal
          isOpen={activeModal}
          onClose={handleCloseModal}
          onSuccess={handleFreeTimeModalSuccess}
          freeTimeSlots={freeTimes}
        ></FreeTimeModal>
      )}
      {activeModal === "studySession" && (
        <StudySessionModal
          isOpen={activeModal}
          onClose={() => setActiveModal(null)}
          onSuccess={fetchStudySessions}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar;
