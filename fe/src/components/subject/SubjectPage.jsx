import React, { useState, useEffect } from "react";
import SubjectModal from "../subject/SubjectModal";
import { saveTokens, clearTokens } from "../../utils/auth";
import Cookies from "js-cookie";
import api from "../../api/api.js";
import ConfirmBox from "../ui/ConfirmBox.jsx";
import { Timer, CalendarClock } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export default function SubjectPage() {
  const { notify } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [editingSubject, setEditingSubject] = useState(null);

  const handleDeleteConfirmed = async () => {
    try {
      await api.delete(`/subjects/${deleteId}`);
      notify("Xóa môn học thành công", "success");
      fetchSubjects();
    } catch (err) {
      notify("Xóa môn học thất bại", "error");
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách môn học:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    fetchSubjects(); // reload danh sách sau khi thêm/sửa
  };

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      {/* Toàn bộ phần nền sẽ bị blur nếu modal mở */}
      <div
        className={`transition-all duration-200 ${
          isModalOpen ? "blur-sm pointer-events-none" : ""
        }`}
      >
        {/* NỘI DUNG CHÍNH */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quản lý môn học</h1>
            <p className="text-gray-600">
              Tổ chức và theo dõi tiến độ các môn học của bạn
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
          >
            + Thêm môn học
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Cards */}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="font-semibold text-lg">Danh sách môn học</p>
            <p className="text-gray-500">{subjects.length} môn học</p>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-400 text-6xl mb-2">📖</div>
              <h2 className="text-lg font-semibold mb-1">
                Chưa có môn học nào
              </h2>
              <p className="text-gray-500 mb-4">
                Thêm môn học đầu tiên để bắt đầu quản lý lịch học của bạn
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
              >
                + Thêm môn học đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition duration-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-semibold text-violet-700 truncate">
                      {subject.name}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        subject.priority === "HIGH"
                          ? "bg-red-100 text-red-600"
                          : subject.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {subject.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 truncate">
                    {subject.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1 text-gray-500">
                      {subject.finishDay && (
                        <>
                          <CalendarClock className="w-4 h-4" />
                          {new Date(subject.finishDay).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                    <button
                      className="text-blue-500 hover:text-blue-700 text-xs "
                      onClick={() => handleEditClick(subject)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(subject.id);
                        setConfirmOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs "
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal hiện lên trên */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        initialData={editingSubject}
      />

      <ConfirmBox
        open={confirmOpen}
        message={"Bạn có chắc chắn muốn xóa môn học này?"}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
