import { useEffect, useState } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Clock, Edit, Trash2, X } from "lucide-react";
import api from "../../api/api";
import { useNotification } from "../../context/NotificationContext";

const freeTimeSchema = yup.object().shape({
  selectedDay: yup.string().required("Chọn ngày trong tuần"),
  startTime: yup.string().required("Chọn thời gian bắt đầu"),
  endTime: yup
    .string()
    .required("Chọn thời gian kết thúc")
    .test(
      "is-after-start",
      "Thời gian kết thúc phải sau thời gian bắt đầu",
      function (endTime) {
        const { startTime } = this.parent;
        return startTime && endTime && startTime < endTime;
      }
    ),
});

const dayMap = {
  "Thứ 2": 1,
  "Thứ 3": 2,
  "Thứ 4": 3,
  "Thứ 5": 4,
  "Thứ 6": 5,
  "Thứ 7": 6,
  "Chủ nhật": 7,
};

export default function FreeTimeModal({
  isOpen,
  onClose,
  onSuccess,
  freeTimeSlots,
}) {
  const { notify } = useNotification();
  const [editingSlotId, setEditingSlotId] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(freeTimeSchema),
    defaultValues: {
      selectedDay: "",
      startTime: "",
      endTime: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      onSuccess();
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (formData) => {
    try {
      const mappedDay = dayMap[formData.selectedDay];
      const slotData = {
        dayOfWeek: mappedDay,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      if (editingSlotId) {
        // Chế độ chỉnh sửa
        await api.put(`/free-times/${editingSlotId}`, slotData);
        notify("Cập nhật thời gian rảnh thành công!", "success");
      } else {
        // Chế độ thêm mới
        await api.post("/free-times", slotData);
        notify("Thêm thời gian rảnh thành công!", "success");
      }

      onSuccess();
      reset();
      setEditingSlotId(null); // Reset chế độ chỉnh sửa
    } catch (e) {
      notify("Đã xảy ra lỗi", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/free-times/${id}`);
      notify("Xoá thành công", "success");
      fetchData();
    } catch (e) {
      notify("Không thể xoá thời gian", "error");
    }
  };

  const handleEdit = (slot) => {
    const dayName = Object.keys(dayMap).find(
      (key) => dayMap[key] === slot.dayOfWeek
    );
    setValue("selectedDay", dayName);
    setValue("startTime", slot.startTime);
    setValue("endTime", slot.endTime);
    setEditingSlotId(slot.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Thêm thời gian rảnh</h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Ngày trong tuần
            </label>
            <select
              {...register("selectedDay")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Chọn ngày</option>
              {Object.keys(dayMap).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            {errors.selectedDay && (
              <p className="text-red-500 text-sm">
                {errors.selectedDay.message}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Bắt đầu</label>
              <input
                type="time"
                {...register("startTime")}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Kết thúc</label>
              <input
                type="time"
                {...register("endTime")}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm">{errors.endTime.message}</p>
              )}
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingSlotId ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Danh sách thời gian rảnh
          </h3>
          <div className="space-y-2">
            {freeTimeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {Object.keys(dayMap).find(
                      (k) => dayMap[k] === slot.dayOfWeek
                    )}
                  </div>
                  <div className="text-xs text-blue-600">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleEdit(slot)}
                    className="text-blue-500 hover:text-blue-700 me-2"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-red-500 hover:text-red-700 "
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
