# 📚 Smart Scheduler

**Smart Scheduler** là một ứng dụng lập lịch học thông minh giúp sinh viên tối ưu thời gian học dựa trên môn học, thời gian rảnh và trí tuệ nhân tạo. Dự án được xây dựng với **React (frontend)** và **Spring Boot (backend)**, kết hợp với AI (Gemini/Google Vertex AI) để tự động tạo lịch học hợp lý.

## 🚀 Tính năng chính

- ✅ Quản lý môn học, thời gian rảnh
- ✅ Sinh lịch học tự động sử dụng AI
- ✅ Đồng hồ Pomodoro tập trung
- ✅ Chỉnh sửa lịch học trực quan
- ✅ Giao diện đơn giản, responsive

## 🖥️ Tech Stack

| Phần     | Công nghệ                                      |
| -------- | ---------------------------------------------- |
| Frontend | React + Vite + TailwindCSS                     |
| Backend  | Spring Boot + JPA + MariaDB                    |
| AI       | Gemini AI (Google Vertex AI)                   |
| Khác     | Axios, React Hook Form, Yup, Styled Components |

## 📦 Cấu trúc thư mục

Smart-Scheduler/

├── backend/ # Spring Boot REST API

├── frontend/ # React + Vite client

├── README.md

## Các API chính

- /study-sessions/generate – sinh lịch học thông minh bằng AI
- /free-times/\*\* – api thao tác với thời gian rảnh
- /subjects/\*\* – api thao tác với môn học
- /study-sessions/\*\* – api thao tác với các phiên học

## 🔧 Hướng dẫn sử dụng

- Ứng dụng gồm 3 trang chính: Tổng quan, Môn học (Có thể thực hiện thêm xóa sửa môn học), Lịch học (Quản lý thời gian rảnh, Quản lý phiên học, Tạo lịch AI)
- Để sử dụng tính năng tạo lịch học thông minh bằng AI:
  - B1: Truy cập trang Lịch học
  - B2: Nhấp vào nút "Tạo lịch AI"
  - B3: Chọn khoản thời gian tạo lịch (vào bao nhiêu ngày tới), lịch sẽ tự động sinh và hiển thị trên lịch học
- Chú ý: Hiện tại việc tạo lịch AI yêu cầu đảm bảo là có tối thiểu 1 môn học và 1 khoảng thời gian rảnh và sẽ được tính từ ngày hôm sau đến X ngày tới (X sẽ được người dùng chọn).

## 🌐 Demo
