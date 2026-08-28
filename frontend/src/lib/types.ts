export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  cccd: string;
  address: string;
  type: 'Cá nhân' | 'Doanh nghiệp';
  notes?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'Giám đốc' | 'Trưởng phòng' | 'Luật sư' | 'Nhân viên';
  departmentId: string;
  joinDate: string;
  status: 'Đang làm việc' | 'Đã nghỉ việc';
}

export interface ServiceProfile {
  id: string;
  title: string;
  customerId: string;
  serviceType: 'Đất đai' | 'Sổ đỏ' | 'Khai sinh' | 'Hộ tịch' | 'Giấy phép' | 'Khác';
  managerId: string;
  receiveDate: string;
  deadline: string;
  price: number;
  status: 'Mới tiếp nhận' | 'Đang xử lý' | 'Chờ bổ sung' | 'Đang làm việc với cơ quan' | 'Đã có kết quả' | 'Hoàn thành' | 'Đóng hồ sơ';
  createdAt: string;
}

export interface Lawsuit {
  id: string;
  title: string;
  customerId: string;
  lawsuitType: 'Dân sự' | 'Hình sự' | 'Hôn nhân gia đình' | 'Đất đai' | 'Lao động' | 'Kinh doanh thương mại' | 'Khác';
  lawyerId: string;
  supportId?: string;
  court: string;
  caseNumber: string;
  receiveDate: string;
  status: 'Mới tiếp nhận' | 'Đang thụ lý' | 'Đang chuẩn bị xét xử' | 'Đang xét xử' | 'Đã có bản án' | 'Hoàn thành' | 'Đóng hồ sơ';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  assignerId: string;
  assigneeId: string;
  departmentId: string;
  customerId?: string;
  profileId?: string;
  lawsuitId?: string;
  deadline: string;
  priority: 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';
  status: 'Chưa bắt đầu' | 'Đang thực hiện' | 'Chờ xử lý' | 'Hoàn thành' | 'Quá hạn' | 'Hủy';
  description?: string;
  createdAt: string;
}

export interface Schedule {
  id: string;
  title: string;
  type: 'Hẹn khách' | 'Họp nội bộ' | 'Làm việc cơ quan' | 'Công chứng' | 'Lịch tòa' | 'Deadline' | 'Khác';
  dateTime: string;
  staffIds: string[];
  customerId?: string;
  profileId?: string;
  lawsuitId?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  channelType: 'all' | 'department' | 'direct' | 'profile' | 'lawsuit';
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;  // null/undefined = root
  createdBy: string;
  createdAt: string;
  color?: string;
}

export interface Document {
  id: string;
  name: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'jpg' | 'png';
  fileSize: string;
  fileUrl: string;
  folderId?: string;  // null/undefined = root
  customerId?: string;
  profileId?: string;
  lawsuitId?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Revenue {
  id: string;
  customerId: string;
  profileId?: string;
  lawsuitId?: string;
  amount: number;
  date: string;
  collectorId: string;
  paymentMethod: 'Tiền mặt' | 'Chuyển khoản';
  notes?: string;
}

export interface Expense {
  id: string;
  content: string;
  amount: number;
  date: string;
  spenderId: string;
  departmentId: string;
  profileId?: string;
  lawsuitId?: string;
  notes?: string;
}

export interface Debt {
  id: string;
  customerId: string;
  profileId?: string;
  lawsuitId?: string;
  totalAmount: number;
  paidAmount: number;
  remainAmount: number;
  deadline: string;
  status: 'Chưa thanh toán' | 'Đã thanh toán một phần' | 'Đã thanh toán' | 'Quá hạn';
}

export interface Contract {
  id: string;
  customerId: string;
  profileId?: string;
  lawsuitId?: string;
  title: string;
  value: number;
  signDate: string;
  effectiveDate: string;
  expireDate: string;
  managerId: string;
  status: 'Nháp' | 'Chờ ký' | 'Đang hiệu lực' | 'Hoàn thành' | 'Hủy';
}

export interface Timekeeping {
  id: string;
  staffId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Đúng giờ' | 'Đi muộn' | 'Nghỉ phép' | 'Vắng mặt';
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
}

export interface SystemLog {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  target: string;
  timestamp: string;
}
