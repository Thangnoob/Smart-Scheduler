import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      {/* Hero Section */}
      <div className="text-center py-16 px-6 bg-white">
        <div className="flex justify-center">
          <div className="bg-indigo-100 rounded-full p-4 mb-4">
            <span className="text-indigo-600 text-4xl">🎓</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600">
          StudyNow
        </h1>
        <p className="text-xl font-semibold mt-2">
          Ứng dụng lịch học tập thông minh
        </p>
        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          Tối ưu hóa thời gian học tập với AI
        </p>
        <button
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow hover:bg-indigo-700"
          onClick={() => navigate(`/signup`)}
        >
          Bắt đầu học tập ngay
        </button>
      </div>

      {/* Features Section */}
      <div className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          Tính năng nổi bật
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Lịch học thông minh"
            emoji="📅"
            desc="AI tự động tạo lịch học tối ưu dựa trên dữ liệu môn học, thời gian rảnh và thói quen học tập của bạn."
          />
          {/* <FeatureCard
            title="Phân tích thời gian"
            emoji="📊"
            desc="Theo dõi hiệu suất học tập, đánh giá thói quen và năng suất dựa trên lịch học và thống kê học tập."
          />
          <FeatureCard
            title="Gamification"
            emoji="🏆"
            desc="Kiếm điểm thưởng, mở huy hiệu và tham gia bảng xếp hạng để duy trì động lực học tập lâu dài."
          /> */}
          <FeatureCard
            title="Quản lý môn học"
            emoji="📘"
            desc="Tổ chức môn học theo độ ưu tiên, đặt mục tiêu học hàng tuần và theo dõi tiến độ hoàn thành."
          />
          {/* <FeatureCard
            title="Theo dõi thời gian"
            emoji="⏱️"
            desc="Ghi lại thời gian học thực tế, so sánh với kế hoạch và nhận khuyến nghị để tối ưu hiệu suất học tập."
          /> */}
          <FeatureCard
            title="Giao diện thân thiện"
            emoji="📱"
            desc="Thiết kế tối giản, responsive hoàn hảo trên mọi thiết bị từ điện thoại đến máy tính."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16 text-center">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">
          Sẵn sàng nâng cao hiệu suất học tập?
        </h3>
        <p className="text-gray-600 mb-6">
          Tin tưởng StudyNow để quản lý thời gian học tập hiệu quả.
        </p>
        <button
          className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow hover:bg-indigo-700"
          onClick={() => navigate(`/signup`)}
        >
          Bắt đầu miễn phí ngay
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ title, emoji, desc }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
      <div className="text-3xl mb-2">{emoji}</div>
      <h4 className="text-lg font-bold mb-1">{title}</h4>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
