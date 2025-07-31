import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import api from "../../api/api";
import { useNotification } from "../../context/NotificationContext";
import sound from "../../sounds/notify.mp3";

export default function PomodoroTimer({
  sessionId,
  subjectName,
  onClose,
  onCompleted,
}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentPomodoro, setCurrentPomodoro] = useState(1);

  const [pomodoroDuration, setPomodoroDuration] = useState(25); // phút
  const [totalPomodoros, setTotalPomodoros] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  const shortBreak = 5;
  const audioRef = useRef(null);
  const { notify } = useNotification();

  const [isSimpleMode, setIsSimpleMode] = useState(false);

  const getStatusLabel = () => {
    if (isSimpleMode) return "Học ngắn";
    if (!isRunning && timeLeft === 0 && !isBreak) return "Bắt đầu học";
    if (isBreak) return "Nghỉ ngắn";
    return "Đang học";
  };

  const startSession = async () => {
    try {
      const res = await api.post(`/study-sessions/${sessionId}/start`);
      const {
        pomodoroDuration: pDuration,
        totalPomodoros: tPomodoros,
        remainingMinutes: rMinutes,
      } = res.data;

      setPomodoroDuration(pDuration);
      setTotalPomodoros(tPomodoros);
      setRemainingMinutes(rMinutes);

      if (tPomodoros === 0) {
        setIsSimpleMode(true);
        setTimeLeft(rMinutes * 60);
      } else {
        setTimeLeft(pDuration * 60);
      }

      setIsRunning(true);
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      playSound();
      handleNextPhase();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const playSound = () => {
    new Audio(sound).play();
  };

  const handleNextPhase = () => {
    if (isSimpleMode) {
      completeSession();
      return;
    }

    if (!isBreak) {
      if (currentPomodoro < totalPomodoros) {
        setIsBreak(true);
        setTimeLeft(shortBreak * 60);
      } else {
        completeSession();
      }
    } else {
      setIsBreak(false);
      setCurrentPomodoro((prev) => prev + 1);
      setTimeLeft(pomodoroDuration * 60);
    }
  };

  const completeSession = async () => {
    try {
      const actualMinutes = isSimpleMode
        ? remainingMinutes
        : pomodoroDuration * (currentPomodoro - 1) +
          (isBreak ? 0 : pomodoroDuration);

      await api.patch(`/study-sessions/${sessionId}/complete`, {
        actualMinutes,
        completedPomodoros: isSimpleMode ? 0 : currentPomodoro,
      });

      notify("Phiên học đã hoàn tất!", "success");
      if (onCompleted) onCompleted();
      onClose();
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const totalSeconds = isSimpleMode
    ? remainingMinutes * 60
    : isBreak
    ? shortBreak * 60
    : pomodoroDuration * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">{subjectName}</h2>

        {totalPomodoros > 0 && !isSimpleMode && (
          <>
            <p className="text-center text-gray-600 mb-2">
              Tổng Pomodoro: {totalPomodoros}
            </p>
            <p className="text-center text-gray-500 mb-2">
              Pomodoro hiện tại: {currentPomodoro}/{totalPomodoros}
            </p>
          </>
        )}

        {remainingMinutes > 0 && (
          <p className="text-center text-yellow-600 text-sm mb-4">
            {isSimpleMode
              ? `Bạn chỉ có ${remainingMinutes} phút. Hãy tận dụng tối đa!`
              : `Sau khi hoàn thành Pomodoro, bạn sẽ còn ${remainingMinutes} phút.`}
          </p>
        )}

        <div className="text-center mb-4">
          <div className="text-6xl font-bold text-gray-800 mb-2">
            {formatTime(timeLeft)}
          </div>
          <div
            className={`text-lg font-semibold ${
              isBreak ? "text-green-500" : "text-red-500"
            }`}
          >
            {getStatusLabel()}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isBreak ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-center gap-4">
          {!isRunning && timeLeft === 0 ? (
            <button
              onClick={startSession}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Bắt đầu học
            </button>
          ) : (
            <>
              {isRunning ? (
                <button
                  onClick={() => setIsRunning(false)}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                >
                  Tạm dừng
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Tiếp tục
                </button>
              )}
              <button
                onClick={completeSession}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Kết thúc
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
