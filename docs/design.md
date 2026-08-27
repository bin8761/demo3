# DESIGN SYSTEM - LAW FIRM ERP

Hệ thống quản trị và điều hành công ty luật áp dụng phong cách thiết kế hiện đại, tinh gọn và tối ưu hóa khả năng đọc dữ liệu cho mô hình ERP (Enterprise Resource Planning). 
Để tạo sự chuyên nghiệp và sang trọng, hệ thống kết hợp giữa **Glassmorphism tinh tế** và **giao diện phẳng truyền thống** để không làm giảm hiệu năng và trải nghiệm người dùng.

---

## 1. Bảng màu (HSL Color Palette)

### 1.1. Light Mode (Chế độ sáng)
*   **Primary (Chủ đạo):** `hsl(220, 90%, 56%)` (Xanh hoàng gia - tạo sự tin tưởng, pháp lý)
*   **Secondary (Phụ):** `hsl(215, 60%, 52%)` (Xanh Slate sáng)
*   **Background (Nền chính):** `hsl(210, 40%, 98%)` (Xám xanh rất nhạt, dịu mắt)
*   **Surface (Nền thẻ/Card):** `hsla(0, 0%, 100%, 0.8)` (Trắng mờ kết hợp Glassmorphism)
*   **Border (Đường viền):** `hsla(210, 40%, 90%, 0.5)`
*   **Text Primary (Chữ chính):** `hsl(222, 47%, 12%)`
*   **Text Secondary (Chữ phụ):** `hsl(215, 16%, 47%)`

### 1.2. Dark Mode (Chế độ tối)
*   **Primary (Chủ đạo):** `hsl(217, 91%, 60%)` (Xanh hoàng gia neon nhẹ)
*   **Secondary (Phụ):** `hsl(215, 30%, 72%)` (Xám xanh dịu)
*   **Background (Nền chính):** `hsl(222, 47%, 10%)` (Xanh đen thẫm)
*   **Surface (Nền thẻ/Card):** `hsla(223, 47%, 15%, 0.7)` (Xanh đen mờ kết hợp Glassmorphism)
*   **Border (Đường viền):** `hsla(217, 30%, 25%, 0.5)`
*   **Text Primary (Chữ chính):** `hsl(210, 40%, 98%)`
*   **Text Secondary (Chữ phụ):** `hsl(215, 20%, 75%)`

### 1.3. Trạng thái (Status Colors)
*   **Success (Hoàn thành):** `hsl(142, 70%, 45%)` (Xanh lá)
*   **Warning (Chờ/Cảnh báo):** `hsl(38, 92%, 50%)` (Vàng cam)
*   **Error (Quá hạn/Hủy):** `hsl(350, 89%, 60%)` (Đỏ)
*   **Info (Mới tiếp nhận):** `hsl(199, 89%, 48%)` (Xanh dương sáng)

---

## 2. Typography (Mã phông chữ)

*   **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
*   **Sizes:**
    *   `h1`: `1.875rem` (30px) - Line height: `2.25rem`
    *   `h2`: `1.5rem` (24px) - Line height: `2rem`
    *   `h3`: `1.25rem` (20px) - Line height: `1.75rem`
    *   `Body (Mặc định)`: `0.875rem` (14px) - Line height: `1.25rem`
    *   `Small`: `0.75rem` (12px) - Line height: `1rem`
*   **Weights:**
    *   `Bold`: `700`
    *   `Medium`: `500`
    *   `Regular`: `400`

---

## 3. Spacing & Layout (Khoảng cách & Bố cục)

Áp dụng hệ thống Spacing nhân số 4:
*   `xs`: `4px` (0.25rem)
*   `sm`: `8px` (0.5rem)
*   `md`: `16px` (1rem)
*   `lg`: `24px` (1.5rem)
*   `xl`: `32px` (2rem)

---

## 4. Components Style

### 4.1. Glassmorphic Surface (Thẻ Glassmorphism)
Sử dụng cho Card, Sidebar, Modal:
*   **Light Mode:**
    *   `background: hsla(0, 0%, 100%, 0.75)`
    *   `backdrop-filter: blur(12px)`
    *   `border: 1px solid hsla(220, 20%, 90%, 0.4)`
    *   `box-shadow: 0 8px 32px 0 hsla(222, 47%, 12%, 0.05)`
*   **Dark Mode:**
    *   `background: hsla(223, 47%, 14%, 0.7)`
    *   `backdrop-filter: blur(12px)`
    *   `border: 1px solid hsla(220, 20%, 30%, 0.4)`
    *   `box-shadow: 0 8px 32px 0 hsla(0, 0%, 0%, 0.3)`

### 4.2. Buttons (Nút bấm)
*   **Primary Button:** Màu chủ đạo, border-radius `8px`, chữ trắng, hover giảm độ sáng nhẹ (`brightness(0.95)`).
*   **Secondary Button:** Viền mỏng, nền trong suốt/mờ, chữ màu Primary.
*   **Ghost/Glass Button:** Nền `hsla(220, 10%, 50%, 0.1)`, không viền, đổi màu khi hover.

### 4.3. Inputs & Forms (Mẫu nhập liệu)
*   Border-radius: `6px`.
*   Border: `1px solid var(--color-border)`.
*   Nền mờ nhẹ `hsla(0, 0%, 100%, 0.05)` ở Dark mode.
*   Focus state: Đổi màu viền thành `Primary` và đổ bóng nhạt màu Primary (`box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2)`).

### 4.4. Tables (Bảng dữ liệu)
Do tính chất ERP, bảng dữ liệu phải rõ ràng:
*   Không dùng Glassmorphism trên từng dòng bảng để tránh rối mắt.
*   Dòng tiêu đề (Header): Nền hơi tối/sáng nhẹ hơn nền chung (`hsl(210, 40%, 94%)` hoặc `hsl(222, 47%, 12%)`).
*   Các dòng dữ liệu xen kẽ (Zebra striping) nhẹ: Khuyên dùng.

### 4.5. Status Badges (Nhãn trạng thái)
Dạng viên thuốc (Pill), padding `4px 8px`, border-radius `9999px`.
*   Sử dụng màu trạng thái tương ứng nhưng có độ mờ nền cao (opacity `0.15`) để hiển thị chữ rõ ràng.
