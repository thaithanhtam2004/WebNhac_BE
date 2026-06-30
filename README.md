# 3TMUSIC - Nền tảng Âm nhạc Trực tuyến 🎵 (Backend & Docker Deployment)

Dự án 3TMUSIC là một nền tảng âm nhạc trực tuyến chính thức, cung cấp tính năng quản lý bài hát, nghệ sĩ, thể loại, phân tích cảm xúc bài hát bằng AI.

Repository này chứa mã nguồn **Backend** cũng như các tệp tin cấu hình **Docker** để triển khai toàn bộ hệ thống (bao gồm cả Frontend, Backend và Database).

## 🛠 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
- **[Git](https://git-scm.com/downloads)** để tải mã nguồn.
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** đang ở trạng thái **Running**.

## 🚀 Hướng dẫn khởi chạy bằng 1 lệnh (Dành cho nhóm)

Để hệ thống hoạt động đúng, cấu trúc thư mục của bạn BẮT BUỘC phải như sau:
```text
Thư_mục_chứa_dự_án/
 ├── WebNhac_FE/    <-- (Bạn phải clone repo Frontend vào đây)
 └── WebNhac_BE/    <-- (Thư mục Backend này)
```

### Bước 1: Clone cả 2 dự án về máy

Mở Terminal và clone lần lượt FE và BE vào cùng một thư mục (ví dụ `Music_CV`):

```bash
mkdir Music_CV
cd Music_CV
git clone https://github.com/thaithanhtam2004/WebNhac_FE.git
git clone https://github.com/thaithanhtam2004/WebNhac_BE.git
```

### Bước 2: Chạy dự án (Run the Project)

Di chuyển vào thư mục **Backend** (vì file cấu hình Docker nằm ở đây) và chạy lệnh khởi động:

```bash
cd WebNhac_BE
docker-compose up -d --build
```

**Quá trình khởi chạy sẽ thực hiện các việc sau:**
1. Khởi tạo **Cơ sở dữ liệu MySQL** (Port `3307`), nạp tự động file `init.sql` để tạo các bảng và dữ liệu mẫu.
2. Build và chạy **Node.js Backend** (Port `3000`).
3. Build và chạy **React Frontend** qua thư mục `../WebNhac_FE` (Port `5173`).

*(Quá trình build lần đầu có thể mất vài phút tùy tốc độ mạng máy tính).*

---

## 🌐 Các đường dẫn truy cập (Access URLs)

Sau khi quá trình `docker-compose up -d --build` hoàn tất (hiển thị `Started` cho tất cả container), hãy mở trình duyệt và truy cập:

- **Frontend (Giao diện người dùng / Admin):**  
  👉 [http://localhost:5173](http://localhost:5173)

- **Backend (API Base URL):**  
  👉 [http://localhost:3000/api](http://localhost:3000/api)

### Tài khoản mặc định để kiểm tra
- Role `1`: Người dùng (User) - Được đề xuất nhạc, quản lý playlist, nghe nhạc.
- Role `2`: Quản trị viên (Admin) - Có thể vào Dashboard quản trị bài hát, phân tích cảm xúc, quản lý user.

---

## 🛑 Cách dừng ứng dụng

Để tắt hệ thống mà không xóa dữ liệu, hãy đứng ở thư mục `WebNhac_BE` và chạy lệnh:
```bash
docker-compose stop
```

Để xóa hoàn toàn các container (dữ liệu trong database vẫn được giữ lại do đã map volume `mysql_data`):
```bash
docker-compose down
```

---

## 🔧 Xử lý sự cố thường gặp (Troubleshooting)

1. **Lỗi `port is already allocated`:**
   - Nếu bạn gặp lỗi cổng `3307`, `3000` hoặc `5173` đã bị chiếm dụng, hãy tắt các phần mềm đang dùng các cổng này (như MySQL cục bộ, React app cục bộ).

2. **Backend báo lỗi không kết nối được Database:**
   - Cơ sở dữ liệu MySQL cần khoảng 10-20 giây để khởi động hoàn toàn trong lần đầu tiên chạy. Đợi vài giây, container backend sẽ tự động kết nối lại (`restart: unless-stopped`).
