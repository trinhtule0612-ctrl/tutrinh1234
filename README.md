# CCCD OCR System

Hệ thống trích xuất thông tin Căn cước công dân (CCCD) Việt Nam.

## Kiến trúc
- **Frontend**: Next.js 15 (App Router), TailwindCSS, shadcn/ui.
- **Backend (OCR Service)**: Python, FastAPI, PaddleOCR, OpenCV.

## Hướng dẫn chạy Local

### 1. Chạy Backend (OCR Service)

Yêu cầu: Python 3.9+

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
API sẽ chạy tại `http://localhost:8000`.

### 2. Chạy Frontend

Yêu cầu: Node.js 18+

```bash
cd frontend
npm install
# Tạo file .env.local và thêm NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
Frontend sẽ chạy tại `http://localhost:3000`.

## Hướng dẫn Deploy

### Deploy Frontend (Vercel)

1. Đẩy mã nguồn lên GitHub.
2. Đăng nhập vào [Vercel](https://vercel.com/) và tạo project mới từ repository.
3. Chọn Root Directory là `frontend`.
4. Thêm Environment Variable:
   - `NEXT_PUBLIC_API_URL`: URL của Backend OCR sau khi deploy.
5. Deploy.

### Deploy Backend (Render / Railway / VPS)

Do PaddleOCR và OpenCV có dung lượng khá lớn và cần tài nguyên RAM, khuyến nghị deploy bằng Docker.

#### Render
1. Tạo một "Web Service" mới trên Render, kết nối với repository của bạn.
2. Thiết lập:
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
3. Render sẽ tự động build từ `Dockerfile` và deploy.
   - Chú ý: PaddleOCR tốn nhiều RAM, bạn có thể cần gói trả phí của Render hoặc giới hạn worker xuống 1 để không bị Out-Of-Memory.

#### Docker Compose / VPS
Bạn có thể tự chạy trên VPS bằng lệnh:
```bash
cd backend
docker build -t cccd-ocr-api .
docker run -p 8000:8000 cccd-ocr-api
```

## Chú ý
- Hệ thống này **không lưu trữ** ảnh và thông tin người dùng sau khi trích xuất. Tất cả xử lý diễn ra trên RAM và trả kết quả về frontend.
- Cần tối ưu thêm cấu hình server production (như dùng Gunicorn với 1-2 worker) nếu lưu lượng lớn.
