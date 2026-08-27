# FEATURE MODULES
# HỆ THỐNG QUẢN TRỊ CÔNG TY LUẬT

**Phiên bản:** 1.0  
**Loại:** Demo / Prototype gần thực tế  
**Quy mô tham chiếu:** 10–12 nhân sự  
**Mục tiêu:** Quản trị, điều hành và liên lạc nội bộ cho công ty luật

---

## 1. Bối cảnh & định hướng

Công ty có 3 phòng ban chính:

1. **Phòng Hành chính**
   - Tiếp nhận khách hàng ban đầu.
   - Ghi nhận yêu cầu.
   - Quản lý văn thư.
   - Quản lý kế toán, thu chi.
   - Điều phối và hỗ trợ hoạt động nội bộ.

2. **Phòng Dịch vụ**
   - Tiếp nhận và xử lý hồ sơ dịch vụ pháp lý/hành chính.
   - Ví dụ: sổ đỏ, đất đai, giấy khai sinh, hộ tịch, giấy phép và các thủ tục hành chính khác.

3. **Phòng Tố tụng**
   - Tiếp nhận và xử lý vụ án.
   - Quản lý hồ sơ tố tụng.
   - Theo dõi tiến độ vụ án.
   - Theo dõi lịch làm việc, lịch tòa và các thời hạn quan trọng.

### Định hướng sản phẩm

Hệ thống không xây dựng theo hướng ERP sản xuất hoặc phần mềm bán hàng.

Tỷ trọng sử dụng dự kiến:

- **80%:** Quản lý, điều hành, theo dõi công việc và liên lạc.
- **20%:** Hồ sơ, tài liệu, hình ảnh, tin nhắn và thông tin nghiệp vụ.

Mục tiêu của demo là tạo cảm giác đây là một hệ thống có thể sử dụng thực tế ngay, đồng thời đủ đơn giản để phù hợp với công ty luật quy mô nhỏ.

---

# 2. Kiến trúc nghiệp vụ tổng thể

```text
CÔNG TY
│
├── TỔ CHỨC & PHÒNG BAN
│   ├── Hành chính
│   ├── Dịch vụ
│   └── Tố tụng
│
├── KHÁCH HÀNG
│   │
│   ├── Hồ sơ dịch vụ
│   │     └── Phòng Dịch vụ
│   │
│   └── Vụ án
│         └── Phòng Tố tụng
│
├── CÔNG VIỆC
│   └── Nhân viên / Phòng ban
│
├── TRAO ĐỔI
│   ├── Cá nhân
│   ├── Phòng ban
│   ├── Toàn công ty
│   └── Theo hồ sơ / vụ án
│
├── TÀI CHÍNH
│   ├── Doanh thu
│   ├── Chi phí
│   └── Công nợ
│
└── BÁO CÁO
    └── Dashboard quản trị
```

---

# 3. Danh sách Module

| ID | Module | Mức độ | Mục tiêu |
|---|---|---|---|
| M01 | Dashboard quản trị | Core | Tổng quan hoạt động công ty |
| M02 | Khách hàng | Core | Quản lý khách hàng và lịch sử |
| M03 | Tổ chức & Phòng ban | Core | Quản lý cơ cấu 3 phòng ban |
| M04 | Nhân sự | Core | Quản lý nhân viên và phân công |
| M05 | Hồ sơ dịch vụ | Core | Quản lý hồ sơ Phòng Dịch vụ |
| M06 | Vụ án / Tố tụng | Core | Quản lý vụ án Phòng Tố tụng |
| M07 | Công việc | Core | Giao việc và theo dõi tiến độ |
| M08 | Lịch làm việc | Core | Quản lý lịch hẹn, deadline, lịch tòa |
| M09 | Trao đổi nội bộ | Core | Liên lạc nội bộ |
| M10 | Tài liệu & Hình ảnh | Core | Lưu trữ hồ sơ và file |
| M11 | Doanh thu | Core | Quản lý các khoản thu |
| M12 | Chi phí | Core | Quản lý các khoản chi |
| M13 | Công nợ | Core | Theo dõi phải thu |
| M14 | Hợp đồng / Thỏa thuận | Supporting | Quản lý hợp đồng dịch vụ |
| M15 | Chấm công / Nghỉ phép | Supporting | Quản lý nhân sự cơ bản |
| M16 | Thông báo | Core | Nhắc việc và cập nhật |
| M17 | Báo cáo quản trị | Core | Báo cáo hoạt động và tài chính |
| M18 | Cấu hình hệ thống | Supporting | Quản lý danh mục |
| M19 | Phân quyền & Nhật ký | Core | Kiểm soát quyền và hoạt động |

---

# 4. M01 – Dashboard quản trị

## Mục tiêu

Giúp giám đốc/trưởng quản lý nhìn nhanh toàn bộ tình hình công ty mà không cần mở từng module.

## Chỉ số tổng quan

- Tổng số khách hàng.
- Hồ sơ đang xử lý.
- Vụ án đang xử lý.
- Công việc đang thực hiện.
- Công việc quá hạn.
- Doanh thu tháng.
- Chi phí tháng.
- Công nợ phải thu.
- Lịch hôm nay.

## Dashboard theo phòng ban

### Phòng Hành chính

- Khách hàng mới.
- Hồ sơ mới tiếp nhận.
- Thu trong ngày/tháng.
- Chi trong ngày/tháng.
- Công việc cần xử lý.

### Phòng Dịch vụ

- Hồ sơ đang xử lý.
- Hồ sơ chờ bổ sung.
- Hồ sơ sắp đến hạn.
- Hồ sơ hoàn thành.
- Công việc theo nhân viên.

### Phòng Tố tụng

- Vụ án đang xử lý.
- Vụ án sắp có lịch.
- Deadline tố tụng.
- Phiên tòa sắp tới.
- Công việc theo luật sư/nhân viên.

## Dashboard tài chính

- Doanh thu hôm nay.
- Doanh thu tháng.
- Chi phí tháng.
- Công nợ.
- Đã thu.
- Chưa thu.
- Lợi nhuận tạm tính.

---

# 5. M02 – Quản lý khách hàng

## Thông tin

- Mã khách hàng.
- Họ tên.
- Số điện thoại.
- Email.
- CCCD.
- Địa chỉ.
- Loại khách hàng.
- Ghi chú.

## Tính năng

- Thêm/sửa khách hàng.
- Tìm kiếm.
- Lọc.
- Xem lịch sử.
- Xem toàn bộ hồ sơ/vụ án của khách.

## Customer Detail

```text
Khách hàng
├── Thông tin cá nhân
├── Hồ sơ dịch vụ
├── Vụ án
├── Hợp đồng
├── Doanh thu
├── Công nợ
├── Lịch làm việc
├── Tài liệu
└── Lịch sử trao đổi
```

---

# 6. M03 – Tổ chức & Phòng ban

Đây là module quan trọng vì công ty vận hành theo 3 phòng ban rõ ràng.

## Cơ cấu

```text
CÔNG TY LUẬT
│
├── Phòng Hành chính
│   ├── Trưởng phòng
│   └── Nhân viên
│
├── Phòng Dịch vụ
│   ├── Trưởng phòng
│   └── Nhân viên
│
└── Phòng Tố tụng
    ├── Trưởng phòng
    └── Luật sư / Nhân viên
```

## Thông tin phòng ban

- Tên phòng.
- Mã phòng.
- Trưởng phòng.
- Số lượng nhân sự.
- Mô tả/chức năng.
- Trạng thái.

## Trang chi tiết phòng ban

Khi mở một phòng ban phải xem được:

- Nhân sự.
- Công việc.
- Hồ sơ.
- Vụ án.
- Lịch làm việc.
- Doanh thu.
- Chi phí.
- Thống kê hoạt động.

Ví dụ:

```text
PHÒNG DỊCH VỤ

Nhân sự              4
Hồ sơ đang xử lý    12
Sắp đến hạn          3
Công việc            18
Doanh thu tháng     85.000.000đ
Chi phí tháng        9.500.000đ
```

## Tính năng

- Tạo phòng ban.
- Sửa phòng ban.
- Gán trưởng phòng.
- Xem nhân sự theo phòng.
- Xem hiệu suất/hoạt động theo phòng.

---

# 7. M04 – Quản lý nhân sự

## Thông tin

- Họ tên.
- Số điện thoại.
- Email.
- Chức vụ.
- Phòng ban.
- Ngày vào làm.
- Trạng thái tài khoản.

## Tính năng

- Thêm nhân viên.
- Sửa thông tin.
- Chuyển phòng ban.
- Khóa/mở tài khoản.
- Xem công việc.
- Xem hồ sơ đang phụ trách.
- Xem lịch làm việc.

## Quan hệ

```text
Phòng ban
   ↓
Nhân viên
   ↓
Công việc
   ↓
Hồ sơ / Vụ án
```

---

# 8. M05 – Hồ sơ dịch vụ

Dành chủ yếu cho Phòng Dịch vụ.

## Loại hồ sơ

- Đất đai.
- Sổ đỏ.
- Khai sinh.
- Hộ tịch.
- Giấy phép.
- Thủ tục hành chính.
- Dịch vụ pháp lý khác.

## Thông tin

- Mã hồ sơ.
- Tên hồ sơ.
- Khách hàng.
- Loại dịch vụ.
- Phòng phụ trách.
- Người phụ trách.
- Ngày tiếp nhận.
- Hạn xử lý.
- Giá trị dịch vụ.
- Trạng thái.

## Trạng thái

```text
Mới tiếp nhận
↓
Đang xử lý
↓
Chờ bổ sung
↓
Đang làm việc với cơ quan
↓
Đã có kết quả
↓
Hoàn thành
↓
Đóng hồ sơ
```

## Chi tiết hồ sơ

```text
Thông tin
Timeline
Công việc
Tài liệu
Hình ảnh
Trao đổi
Lịch
Doanh thu
Chi phí
Công nợ
```

---

# 9. M06 – Quản lý vụ án / Tố tụng

Dành cho Phòng Tố tụng.

## Loại vụ án

- Dân sự.
- Hình sự.
- Hôn nhân gia đình.
- Đất đai.
- Lao động.
- Kinh doanh thương mại.
- Hành chính.
- Khác.

## Thông tin vụ án

- Mã vụ án.
- Tên vụ án.
- Khách hàng.
- Loại vụ án.
- Luật sư phụ trách.
- Nhân viên hỗ trợ.
- Cơ quan giải quyết.
- Số vụ án.
- Ngày tiếp nhận.
- Trạng thái.

## Theo dõi

- Timeline.
- Deadline.
- Phiên tòa.
- Người liên quan.
- Tài liệu.
- Chứng cứ.
- Công việc.
- Trao đổi.
- Doanh thu.
- Chi phí.
- Công nợ.

---

# 10. M07 – Quản lý công việc

## Mục tiêu

Quản lý việc cần làm của toàn công ty.

## Thông tin

- Tên công việc.
- Người giao.
- Người thực hiện.
- Phòng ban.
- Khách hàng liên quan.
- Hồ sơ/vụ án liên quan.
- Deadline.
- Mức ưu tiên.
- Trạng thái.

## Trạng thái

```text
Chưa bắt đầu
↓
Đang thực hiện
↓
Chờ xử lý
↓
Hoàn thành
```

Ngoài ra:

- Quá hạn.
- Hủy.

## Tính năng

- Giao việc.
- Nhận việc.
- Cập nhật tiến độ.
- Bình luận.
- Đính kèm file.
- Theo dõi deadline.

---

# 11. M08 – Lịch làm việc

## Loại lịch

- Hẹn khách.
- Họp nội bộ.
- Làm việc với cơ quan nhà nước.
- Công chứng.
- Lịch tòa.
- Phiên xét xử.
- Deadline hồ sơ.

## Chế độ

- Ngày.
- Tuần.
- Tháng.

## Tính năng

- Tạo lịch.
- Gán người phụ trách.
- Liên kết khách hàng.
- Liên kết hồ sơ/vụ án.
- Nhắc lịch.

---

# 12. M09 – Trao đổi nội bộ

Đây là module có trọng số sử dụng cao theo yêu cầu khách hàng.

## Kênh trao đổi

### Toàn công ty

```text
Công ty Luật
```

### Theo phòng ban

```text
Hành chính
Dịch vụ
Tố tụng
```

### Cá nhân

```text
Nhân viên A ↔ Nhân viên B
```

### Theo hồ sơ/vụ án

```text
Hồ sơ HS-2026-001
Vụ án VA-2026-003
```

## Tính năng

- Tin nhắn.
- Gửi hình ảnh.
- Gửi file.
- Reply.
- Ghim tin nhắn.
- Tìm kiếm.
- Thông báo tin nhắn mới.

Không cần xây dựng thành mạng xã hội hoặc ứng dụng chat độc lập.

---

# 13. M10 – Tài liệu & Hình ảnh

## Phân loại

```text
Khách hàng
├── Hồ sơ dịch vụ
│   ├── Giấy tờ
│   ├── Hình ảnh
│   └── Văn bản
│
└── Vụ án
    ├── Hồ sơ
    ├── Chứng cứ
    ├── Hình ảnh
    └── Văn bản tố tụng
```

## Tính năng

- Upload.
- Preview.
- Download.
- Đổi tên.
- Xóa.
- Phân loại.
- Tìm kiếm.

## File hỗ trợ

- PDF.
- DOC/DOCX.
- XLS/XLSX.
- JPG.
- PNG.

---

# 14. M11 – Quản lý doanh thu

Module cần có để demo khả năng quản trị tài chính thực tế.

## Nguồn doanh thu

- Phí dịch vụ.
- Phí tư vấn.
- Phí xử lý hồ sơ.
- Phí vụ án.
- Khoản thu khác.

## Thông tin giao dịch

- Mã giao dịch.
- Khách hàng.
- Hồ sơ/vụ án.
- Loại dịch vụ.
- Số tiền.
- Ngày thu.
- Người thu.
- Phương thức thanh toán.
- Ghi chú.

## Phương thức

- Tiền mặt.
- Chuyển khoản.

## Báo cáo doanh thu

- Theo ngày.
- Theo tháng.
- Theo năm.
- Theo phòng ban.
- Theo nhân viên.
- Theo loại dịch vụ.

---

# 15. M12 – Quản lý chi phí

## Loại chi phí

- Hành chính.
- Đi lại.
- Công chứng.
- Hồ sơ.
- Tòa án.
- Dịch vụ bên ngoài.
- Chi phí vụ án.
- Chi phí khác.

## Thông tin

- Mã chi phí.
- Nội dung.
- Số tiền.
- Ngày chi.
- Người chi.
- Phòng ban.
- Hồ sơ/vụ án liên quan.
- Ghi chú.

## Báo cáo

- Chi phí theo tháng.
- Chi phí theo phòng.
- Chi phí theo hồ sơ.
- Chi phí theo loại.

---

# 16. M13 – Quản lý công nợ

## Mục tiêu

Theo dõi số tiền khách hàng phải thanh toán.

## Thông tin

- Khách hàng.
- Hồ sơ/vụ án.
- Giá trị dịch vụ.
- Đã thanh toán.
- Còn phải thu.
- Hạn thanh toán.
- Trạng thái.

## Trạng thái

```text
Chưa thanh toán
Đã thanh toán một phần
Đã thanh toán
Quá hạn
```

## Dashboard

- Tổng công nợ.
- Công nợ quá hạn.
- Công nợ trong tháng.
- Danh sách khách còn nợ.

---

# 17. M14 – Hợp đồng / Thỏa thuận

## Thông tin

- Mã hợp đồng.
- Khách hàng.
- Hồ sơ/vụ án.
- Giá trị.
- Ngày ký.
- Ngày hiệu lực.
- Ngày hết hạn.
- Người phụ trách.
- Trạng thái.

## Trạng thái

```text
Nháp
Chờ ký
Đang hiệu lực
Hoàn thành
Hủy
```

---

# 18. M15 – Chấm công / Nghỉ phép

Đây là module nhân sự mức cơ bản.

## Chấm công

- Ngày.
- Giờ vào.
- Giờ ra.
- Trạng thái.

## Nghỉ phép

- Tạo đơn.
- Duyệt đơn.
- Từ ngày.
- Đến ngày.
- Lý do.
- Trạng thái.

Không cần triển khai hệ thống tính lương/BHXH phức tạp trong demo.

---

# 19. M16 – Thông báo

## Loại thông báo

- Công việc mới.
- Hồ sơ mới.
- Vụ án được giao.
- Tin nhắn mới.
- Deadline sắp tới.
- Deadline quá hạn.
- Lịch sắp diễn ra.
- Thanh toán mới.
- Công nợ quá hạn.

## Notification Center

Hiển thị các thông báo theo thời gian và trạng thái đã đọc/chưa đọc.

---

# 20. M17 – Báo cáo quản trị

## Báo cáo hoạt động

- Khách hàng mới.
- Hồ sơ mới.
- Hồ sơ hoàn thành.
- Hồ sơ quá hạn.
- Vụ án đang xử lý.
- Công việc hoàn thành.
- Công việc quá hạn.

## Báo cáo theo phòng ban

```text
Phòng Hành chính
Phòng Dịch vụ
Phòng Tố tụng
```

Có thể so sánh:

- Nhân sự.
- Công việc.
- Hồ sơ.
- Vụ án.
- Doanh thu.
- Chi phí.

## Báo cáo tài chính

- Doanh thu.
- Chi phí.
- Công nợ.
- Đã thu.
- Chưa thu.
- Lợi nhuận tạm tính.

---

# 21. M18 – Cấu hình hệ thống

## Danh mục

- Phòng ban.
- Chức vụ.
- Loại hồ sơ.
- Loại vụ án.
- Loại dịch vụ.
- Loại doanh thu.
- Loại chi phí.
- Trạng thái hồ sơ.

## Tính năng

- Thêm.
- Sửa.
- Kích hoạt/vô hiệu hóa.

---

# 22. M19 – Phân quyền & Nhật ký

## Vai trò

### Giám đốc

Xem và quản lý toàn bộ hệ thống.

### Trưởng phòng

Quản lý nhân sự và hoạt động trong phòng.

### Nhân viên Hành chính

Truy cập khách hàng, hồ sơ, thu chi và công việc được phân quyền.

### Nhân viên Dịch vụ

Truy cập hồ sơ dịch vụ và dữ liệu liên quan.

### Nhân viên Tố tụng / Luật sư

Truy cập vụ án và dữ liệu liên quan.

## Nhật ký hoạt động

Ghi nhận:

- Ai tạo.
- Ai sửa.
- Ai cập nhật trạng thái.
- Ai upload tài liệu.
- Ai ghi nhận doanh thu/chi phí.
- Thời gian thao tác.

---

# 23. CORE FLOW – KHÁCH HÀNG

```text
Khách hàng đến
      ↓
Phòng Hành chính tiếp nhận
      ↓
Tạo khách hàng
      ↓
Ghi nhận yêu cầu
      ↓
Tạo hồ sơ / vụ án
      ↓
Phân phòng ban
      ↓
Phân người phụ trách
      ↓
Tạo công việc
      ↓
Xử lý
      ↓
Trao đổi nội bộ
      ↓
Cập nhật tài liệu
      ↓
Cập nhật tiến độ
      ↓
Hoàn thành
      ↓
Ghi nhận doanh thu
      ↓
Theo dõi công nợ
      ↓
Đóng hồ sơ
```

---

# 24. CORE FLOW – PHÒNG DỊCH VỤ

```text
Hành chính
    ↓
Tiếp nhận khách
    ↓
Tạo hồ sơ dịch vụ
    ↓
Giao Phòng Dịch vụ
    ↓
Giao nhân viên
    ↓
Kiểm tra giấy tờ
    ↓
Yêu cầu bổ sung nếu thiếu
    ↓
Làm việc với cơ quan
    ↓
Cập nhật tiến độ
    ↓
Nhận kết quả
    ↓
Hoàn thành
    ↓
Thanh toán
```

---

# 25. CORE FLOW – PHÒNG TỐ TỤNG

```text
Tiếp nhận khách
      ↓
Tạo vụ án
      ↓
Phân luật sư phụ trách
      ↓
Tạo công việc
      ↓
Thu thập tài liệu / chứng cứ
      ↓
Theo dõi deadline
      ↓
Lịch làm việc / lịch tòa
      ↓
Trao đổi nội bộ
      ↓
Cập nhật diễn biến
      ↓
Kết thúc / cập nhật trạng thái vụ án
      ↓
Thanh toán / công nợ
```

---

# 26. CORE FLOW – TÀI CHÍNH

```text
Hồ sơ / Vụ án
      │
      ├──────────────→ Doanh thu
      │
      └──────────────→ Chi phí
                         │
                         ↓
                    Công nợ
                         │
                         ↓
                    Thanh toán
                         │
                         ↓
                     Báo cáo
```

---

# 27. KỊCH BẢN DEMO THỰC TẾ

Demo không nên chỉ mở từng module rồi cho khách hàng xem CRUD.

Nên sử dụng một dữ liệu mẫu xuyên suốt.

## Scenario 1 – Hồ sơ dịch vụ

### Khách hàng

Nguyễn Văn A.

### Yêu cầu

Làm thủ tục đất đai.

### Quy trình demo

1. Hành chính tạo khách hàng.
2. Tạo hồ sơ `HS-2026-001`.
3. Chuyển hồ sơ cho Phòng Dịch vụ.
4. Trưởng phòng giao nhân viên.
5. Nhân viên tạo công việc.
6. Nhân viên trao đổi trong nhóm hồ sơ.
7. Upload ảnh/sổ đỏ.
8. Cập nhật trạng thái.
9. Ghi nhận doanh thu 15.000.000đ.
10. Khách thanh toán 10.000.000đ.
11. Hệ thống tự thể hiện công nợ 5.000.000đ.
12. Dashboard cập nhật số liệu.

---

# 28. KỊCH BẢN DEMO VỤ ÁN

## Vụ án

`VA-2026-003`

Khách hàng: Trần Văn B.

Loại: Dân sự.

### Quy trình

1. Tạo khách hàng.
2. Tạo vụ án.
3. Gán Phòng Tố tụng.
4. Gán luật sư.
5. Tạo công việc.
6. Upload hồ sơ.
7. Tạo lịch tòa.
8. Tạo deadline.
9. Trao đổi nội bộ.
10. Ghi nhận chi phí.
11. Ghi nhận doanh thu.
12. Theo dõi công nợ.
13. Cập nhật timeline vụ án.

---

# 29. GIAO DIỆN SIDEBAR ĐỀ XUẤT

```text
⚖️ LAW MANAGEMENT
│
├── 🏠 Dashboard
│
├── 👥 Khách hàng
├── 🏢 Tổ chức & Phòng ban
├── 👤 Nhân sự
│
├── 📁 Hồ sơ dịch vụ
├── ⚖️ Vụ án / Tố tụng
├── ✅ Công việc
├── 📅 Lịch làm việc
│
├── 💬 Trao đổi nội bộ
├── 📂 Tài liệu
├── 🔔 Thông báo
│
├── 💰 Doanh thu
├── 💸 Chi phí
├── 📌 Công nợ
├── 📄 Hợp đồng
│
├── 📊 Báo cáo
│
└── ⚙️ Cài đặt
    ├── Danh mục
    ├── Phân quyền
    └── Nhật ký hoạt động
```

---

# 30. DASHBOARD DEMO

Dashboard nên ưu tiên thông tin mà người quản lý cần biết ngay.

```text
┌─────────────────────────────────────────────────────────┐
│ Dashboard                                               │
├────────────┬────────────┬────────────┬─────────────────┤
│ Hồ sơ      │ Vụ án      │ Doanh thu  │ Công nợ         │
│ 32         │ 8          │ 185M       │ 42M             │
├────────────┴────────────┴────────────┴─────────────────┤
│                                                         │
│                 DOANH THU THEO THÁNG                    │
│                                                         │
│          ▂   ▅   ▆   ▇   █   ▇                         │
│                                                         │
├─────────────────────────┬───────────────────────────────┤
│ Công việc cần xử lý     │ Lịch hôm nay                 │
│                         │                               │
│ Hồ sơ A - Quá hạn       │ 09:00 - Hẹn khách            │
│ Hồ sơ B - Hôm nay       │ 14:00 - Họp nội bộ           │
│ Vụ án C - 2 ngày        │ 16:00 - Làm việc Tòa         │
├─────────────────────────┴───────────────────────────────┤
│ Hoạt động gần đây                                      │
│                                                         │
│ Nguyễn Văn B cập nhật HS-2026-001                      │
│ Phòng Hành chính ghi nhận thanh toán 10.000.000đ       │
│ Luật sư A cập nhật VA-2026-003                         │
└─────────────────────────────────────────────────────────┘
```

---

# 31. NGUYÊN TẮC QUAN TRỌNG KHI LÀM DEMO

## 31.1. Không biến thành phần mềm ERP

Không ưu tiên:

- Kho.
- Sản phẩm.
- Bán hàng.
- Marketing.
- Sản xuất.
- CRM bán hàng.

## 31.2. Không biến thành ứng dụng chat

Chat chỉ là công cụ hỗ trợ quản lý.

Dữ liệu chính phải xoay quanh:

```text
Khách hàng
    ↓
Hồ sơ / Vụ án
    ↓
Công việc
    ↓
Nhân sự / Phòng ban
    ↓
Lịch
    ↓
Tài liệu / Trao đổi
    ↓
Doanh thu / Chi phí / Công nợ
    ↓
Báo cáo
```

## 31.3. Mỗi module phải liên kết với nhau

Ví dụ mở một khách hàng phải thấy được:

- Hồ sơ.
- Vụ án.
- Công việc.
- Lịch.
- Tài liệu.
- Trao đổi.
- Doanh thu.
- Công nợ.

Mở một phòng ban phải thấy được:

- Nhân sự.
- Công việc.
- Hồ sơ.
- Vụ án.
- Doanh thu.
- Chi phí.

Mở một hồ sơ phải thấy được:

- Khách hàng.
- Người phụ trách.
- Công việc.
- Timeline.
- Tài liệu.
- Trao đổi.
- Lịch.
- Doanh thu.
- Chi phí.
- Công nợ.

---

# 32. PHẠM VI TRIỂN KHAI DEMO

## Nhóm A – Bắt buộc

- Dashboard.
- Khách hàng.
- Tổ chức & Phòng ban.
- Nhân sự.
- Hồ sơ dịch vụ.
- Vụ án.
- Công việc.
- Lịch.
- Trao đổi nội bộ.
- Tài liệu.
- Doanh thu.
- Chi phí.
- Công nợ.
- Báo cáo.

## Nhóm B – Tạo cảm giác hệ thống hoàn chỉnh

- Hợp đồng.
- Chấm công.
- Nghỉ phép.
- Thông báo.
- Phân quyền.
- Nhật ký hoạt động.
- Cấu hình danh mục.

---

# 33. TIÊU CHÍ DEMO THÀNH CÔNG

Sau khi xem demo, khách hàng phải có thể hình dung:

1. Công ty có bao nhiêu nhân sự.
2. Mỗi nhân sự thuộc phòng nào.
3. Mỗi phòng đang xử lý những gì.
4. Khách hàng nào đang làm việc với công ty.
5. Hồ sơ nào đang xử lý.
6. Vụ án nào đang xử lý.
7. Ai đang phụ trách từng việc.
8. Việc nào sắp quá hạn.
9. Hôm nay có lịch gì.
10. Nhân viên trao đổi với nhau ở đâu.
11. Hồ sơ đang có những tài liệu gì.
12. Công ty đã thu bao nhiêu.
13. Công ty đã chi bao nhiêu.
14. Khách hàng còn nợ bao nhiêu.
15. Phòng ban nào đang có bao nhiêu việc.
16. Tình hình tổng thể công ty hiện tại như thế nào.

---

# 34. KẾT LUẬN

Hệ thống được định vị là:

> **Hệ thống quản trị và điều hành nội bộ dành riêng cho công ty luật.**

Không phải:

> Phần mềm kế toán.

Không phải:

> CRM bán hàng.

Không phải:

> Phần mềm quản lý sản xuất.

Không phải:

> Ứng dụng chat.

Mà là một hệ thống kết nối:

```text
TỔ CHỨC
   +
NHÂN SỰ
   +
KHÁCH HÀNG
   +
HỒ SƠ / VỤ ÁN
   +
CÔNG VIỆC
   +
TRAO ĐỔI
   +
TÀI LIỆU
   +
LỊCH
   +
DOANH THU
   +
CHI PHÍ
   +
CÔNG NỢ
   +
BÁO CÁO
```

Trong đó **Tổ chức & Phòng ban** là lớp cấu trúc nền tảng; **Khách hàng → Hồ sơ/Vụ án → Công việc → Trao đổi/Tài liệu → Tài chính → Báo cáo** là core flow của toàn hệ thống.
