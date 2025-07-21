import { useEffect } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../api/api";
import { useNotification } from "../../context/NotificationContext";

const today = new Date();
today.setHours(0, 0, 0, 0);

const subjectSchema = yup.object().shape({
  name: yup
    .string()
    .matches(/^[\p{L}\p{N} ]+$/u, "Tên không được chứa ký tự đặc biệt")
    .required("Tên là bắt buộc"),

  description: yup.string().optional(),

  priority: yup
    .string()
    .oneOf(["LOW", "MEDIUM", "HIGH"])
    .required("Chọn mức độ ưu tiên"),

  weeklyHours: yup
    .number()
    .typeError("Phải là một số")
    .integer("Phải là số nguyên")
    .min(1, "Số giờ học phải lớn hơn 0")
    .max(168, "Bạn có chắc là sẽ không làm gì ngoài học không ?")
    .required("Bắt buộc nhập số giờ"),

  finishDay: yup
    .string()
    .transform((value, originalValue) => {
      return originalValue === "" ? null : originalValue;
    })
    .nullable()
    .notRequired()
    .test(
      "is-valid-date",
      "Ngày không hợp lệ",
      (value) => value === null || !isNaN(new Date(value).getTime())
    )
    .test(
      "is-after-today",
      "Ngày kết thúc phải lớn hơn hoặc bằng hôm nay",
      (value) => {
        if (!value) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(value);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today;
      }
    ),
});

export default function SubjectModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) {
  const { notify } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(subjectSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "MEDIUM",
      weeklyHours: 8,
      finishDay: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      // Gán dữ liệu vào form nếu có initialData (edit)
      setValue("name", initialData.name || "");
      setValue("description", initialData.description || "");
      setValue("priority", initialData.priority || "MEDIUM");
      setValue("weeklyHours", initialData.weeklyHours || 8);
      setValue("finishDay", initialData.finishDay || "");
    } else {
      // Reset về mặc định nếu là tạo mới
      reset();
    }
  }, [initialData, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      if (initialData?.id) {
        // Chỉnh sửa
        const res = await api.put(`/subjects/${initialData.id}`, data);
        if (res.status === 200) {
          notify("Cập nhật môn học thành công!", "success");
          onSuccess();
          onClose();
        }
      } else {
        // Tạo mới
        const res = await api.post("/subjects", data);
        if (res.status === 200) {
          notify("Tạo môn học thành công!", "success");
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      notify("Có lỗi xảy ra (trùng tên hoặc lỗi server)", "error");
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

        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên môn học
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Ví dụ: Toán học, Lịch sử..."
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mô tả (tuỳ chọn)
            </label>
            <textarea
              {...register("description")}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ghi chú về môn học này..."
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">
                Độ ưu tiên
              </label>
              <select
                {...register("priority")}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
              {errors.priority && (
                <p className="text-red-500 text-sm">
                  {errors.priority.message}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">
                Số giờ/tuần
              </label>
              <input
                type="number"
                {...register("weeklyHours")}
                className="w-full px-3 py-2 border rounded-md"
                min={1}
              />
              {errors.weeklyHours && (
                <p className="text-red-500 text-sm">
                  {errors.weeklyHours.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Ngày kết thúc
            </label>
            <input
              type="date"
              {...register("finishDay")}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.finishDay && (
              <p className="text-red-500 text-sm">{errors.finishDay.message}</p>
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
              {initialData ? "Lưu thay đổi" : "Thêm môn học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
