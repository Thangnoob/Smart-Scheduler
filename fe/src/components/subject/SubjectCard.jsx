import React from "react";

export default function SubjectCard({ subject }) {
  const {
    name,
    description,
    color = "blue",
    priority = "Trung bình",
    hoursPerWeek = 0,
  } = subject;

  const priorityColor = {
    Cao: "text-red-600",
    "Trung bình": "text-yellow-600",
    Thấp: "text-green-600",
  };

  return (
    <div
      className={`rounded-lg shadow p-4 border-t-4 border-${color}-500 bg-white`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${priorityColor[priority]} bg-gray-100`}
        >
          {priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {description || "Không có mô tả."}
      </p>
      <div className="text-sm text-gray-500">⏱ {hoursPerWeek} giờ/tuần</div>
    </div>
  );
}
