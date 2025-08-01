import { useEffect, useState } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../api/api";
import { useNotification } from "../../context/NotificationContext";
import { Edit, Trash2, X } from "lucide-react";
import ConfirmBox from "../../components/ui/ConfirmBox";

const priorityColor = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "green",
};

const studySessionSchema = yup.object().shape({
  subjectId: yup.string().required("Vui lòng chọn môn học"),
  startTime: yup.date().required("Chọn thời gian bắt đầu"),
  endTime: yup
    .date()
    .required("Chọn thời gian kết thúc")
    .test(
      "is-after-start",
      "Thời gian kết thúc phải sau thời gian bắt đầu",
      function (value) {
        const { startTime } = this.parent;
        return new Date(value) > new Date(startTime);
      }
    ),
  isCompleted: yup.boolean(),
});

export default function StudySessionModal({ isOpen, onClose, onSuccess }) {
  const [sessions, setSessions] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const { notify } = useNotification();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(studySessionSchema),
    defaultValues: {
      subjectId: "",
      startTime: "",
      endTime: "",
      isCompleted: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      fetchSubjects();
      fetchSessions();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      notify("Không thể tải danh sách môn học", "error");
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get("/study-sessions");
      setSessions(res.data);
    } catch (err) {
      notify("Không thể tải danh sách phiên học", "error");
    }
  };

  const formatLocalDateTime = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };

  const handleEdit = (session) => {
    setValue("subjectId", session.subjectId);
    setValue("startTime", session.startTime.slice(0, 16)); // datetime-local format
    setValue("endTime", session.endTime.slice(0, 16));
    setEditingSessionId(session.id);
  };

  const requestDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/study-sessions/${pendingDeleteId}`);
      notify("Xóa phiên học thành công", "success");
      fetchSessions();
      onSuccess();
    } catch (err) {
      notify("Không thể xóa phiên học", "error");
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      const duration = Math.round((end - start) / (1000 * 60));

      const payload = {
        subjectId: data.subjectId,
        startTime: formatLocalDateTime(start),
        endTime: formatLocalDateTime(end),
        duration,
        isCompleted: false,
      };

      if (editingSessionId) {
        await api.put(`/study-sessions/${editingSessionId}`, payload);
        notify("Cập nhật phiên học thành công!", "success");
      } else {
        await api.post("/study-sessions", payload);
        notify("Tạo phiên học thành công!", "success");
      }

      reset();
      fetchSessions();
      onSuccess();
      onClose();
      setEditingSessionId(null);
    } catch (err) {
      notify("Có lỗi xảy ra khi tạo/cập nhật phiên học", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4">Tạo phiên học mới</h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">Môn học</label>
            <select
              {...register("subjectId")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  <span
                    className={`text-${priorityColor[subject.priority]}-500`}
                  >
                    {subject.name}
                  </span>
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="text-red-500 text-sm">{errors.subjectId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Thời gian bắt đầu
            </label>
            <input
              type="datetime-local"
              {...register("startTime")}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Thời gian kết thúc
            </label>
            <input
              type="datetime-local"
              {...register("endTime")}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm">{errors.endTime.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
            >
              {editingSessionId ? "Cập nhật" : "Tạo phiên học"}
            </button>
          </div>
        </form>
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Danh sách phiên học
          </h3>
          {sessions.length == 0 ? (
            <div className="text-sm font-medium text-center text-gray-500">
              Chưa có phiên học nào
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-violet-50 border border-violet-200 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {subjects.find((s) => s.id === session.subjectId)?.name ||
                        "Môn học"}
                    </div>
                    <div className="text-xs text-violet-600">
                      {new Date(session.startTime).toLocaleString()} -{" "}
                      {new Date(session.endTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(session)}
                      className="text-violet-500 hover:text-violet-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => requestDelete(session.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmBox
        open={confirmOpen}
        message="Bạn có chắc chắn muốn xóa phiên học này ?"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
