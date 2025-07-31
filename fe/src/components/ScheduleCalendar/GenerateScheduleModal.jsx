import React, { useState } from "react";

const GenerateScheduleModal = ({ isOpen, onClose, onConfirm }) => {
  const [daysAhead, setDaysAhead] = useState(7);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all scale-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Tạo lịch học
        </h2>
        <p className="text-gray-600 mb-4">
          Bạn muốn tạo lịch học trong bao nhiêu ngày tới?
        </p>

        <input
          type="number"
          min="1"
          value={daysAhead}
          onChange={(e) => setDaysAhead(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(daysAhead)}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateScheduleModal;
