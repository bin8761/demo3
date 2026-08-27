import {
  Customer,
  Department,
  Staff,
  ServiceProfile,
  Lawsuit,
  Task,
  Schedule,
  ChatMessage,
  Document,
  Revenue,
  Expense,
  Debt,
  Contract,
  Timekeeping,
  LeaveRequest,
  SystemLog
} from './types';

// Mock in-memory database
export const db = {
  departments: [] as Department[],
  staff: [] as Staff[],
  customers: [] as Customer[],
  serviceProfiles: [] as ServiceProfile[],
  lawsuits: [] as Lawsuit[],
  tasks: [] as Task[],
  schedules: [] as Schedule[],
  chatMessages: [] as ChatMessage[],
  documents: [] as Document[],
  revenues: [] as Revenue[],
  expenses: [] as Expense[],
  debts: [] as Debt[],
  contracts: [] as Contract[],
  timekeeping: [] as Timekeeping[],
  leaveRequests: [] as LeaveRequest[],
  systemLogs: [] as SystemLog[]
};

// Khởi tạo dữ liệu mẫu
export function initMockData() {
  const now = new Date();
  const formatISO = (d: Date) => d.toISOString();
  const todayStr = formatISO(now).split('T')[0];

  // 1. Phòng ban
  db.departments = [
    { id: 'hanh-chinh', name: 'Phòng Hành chính', managerId: 'NV-001', description: 'Tiếp nhận khách hàng, hành chính nhân sự, kế toán thu chi', status: 'active' },
    { id: 'dich-vu', name: 'Phòng Dịch vụ', managerId: 'NV-002', description: 'Xử lý các hồ sơ dịch vụ đất đai, hộ tịch, giấy phép...', status: 'active' },
    { id: 'to-tung', name: 'Phòng Tố tụng', managerId: 'NV-003', description: 'Tham gia tố tụng vụ án dân sự, hình sự, tranh chấp...', status: 'active' }
  ];

  // 2. Nhân sự
  db.staff = [
    { id: 'NV-001', name: 'Nguyễn Văn Trưởng', phone: '0901234567', email: 'truong.nv@lawfirm.com', role: 'Giám đốc', departmentId: 'hanh-chinh', joinDate: '2020-01-01', status: 'Đang làm việc' },
    { id: 'NV-002', name: 'Lê Thị Dịch', phone: '0902345678', email: 'dich.lt@lawfirm.com', role: 'Trưởng phòng', departmentId: 'dich-vu', joinDate: '2021-03-15', status: 'Đang làm việc' },
    { id: 'NV-003', name: 'Trần Văn Luật', phone: '0903456789', email: 'luat.tv@lawfirm.com', role: 'Luật sư', departmentId: 'to-tung', joinDate: '2021-06-01', status: 'Đang làm việc' },
    { id: 'NV-004', name: 'Phạm Kế Toán', phone: '0904567890', email: 'toan.p@lawfirm.com', role: 'Nhân viên', departmentId: 'hanh-chinh', joinDate: '2022-09-01', status: 'Đang làm việc' },
    { id: 'NV-005', name: 'Hoàng Văn Sự', phone: '0905678901', email: 'su.hv@lawfirm.com', role: 'Nhân viên', departmentId: 'dich-vu', joinDate: '2023-01-10', status: 'Đang làm việc' },
    { id: 'NV-006', name: 'Vũ Hỗ Trợ', phone: '0906789012', email: 'tro.v@lawfirm.com', role: 'Nhân viên', departmentId: 'to-tung', joinDate: '2023-05-20', status: 'Đang làm việc' }
  ];

  // 3. Khách hàng
  db.customers = [
    { id: 'KH-001', name: 'Nguyễn Văn A', phone: '0987654321', email: 'nva@gmail.com', cccd: '012345678912', address: '123 Đường Láng, Đống Đa, Hà Nội', type: 'Cá nhân', notes: 'Khách làm thủ tục đất đai', createdAt: todayStr },
    { id: 'KH-002', name: 'Trần Văn B', phone: '0912345678', email: 'tvb@gmail.com', cccd: '098765432109', address: '456 Trần Hưng Đạo, Quận 1, TP. HCM', type: 'Cá nhân', notes: 'Khách tranh chấp thương mại tố tụng', createdAt: todayStr }
  ];

  // 4. Hồ sơ dịch vụ (HS-2026-001)
  const deadlineProfile = new Date();
  deadlineProfile.setDate(now.getDate() + 15);
  db.serviceProfiles = [
    {
      id: 'HS-2026-001',
      title: 'Hồ sơ xin cấp sổ đỏ Nguyễn Văn A',
      customerId: 'KH-001',
      serviceType: 'Đất đai',
      managerId: 'NV-005',
      receiveDate: todayStr,
      deadline: deadlineProfile.toISOString().split('T')[0],
      price: 15000000,
      status: 'Đang xử lý',
      createdAt: todayStr
    }
  ];

  // 5. Vụ án / Tố tụng (VA-2026-003)
  const deadlineLawsuit = new Date();
  deadlineLawsuit.setDate(now.getDate() + 30);
  db.lawsuits = [
    {
      id: 'VA-2026-003',
      title: 'Vụ án tranh chấp hợp đồng thương mại Trần Văn B',
      customerId: 'KH-002',
      lawsuitType: 'Kinh doanh thương mại',
      lawyerId: 'NV-003',
      supportId: 'NV-006',
      court: 'Tòa án nhân dân Quận 1',
      caseNumber: '102/2026/DS-ST',
      receiveDate: todayStr,
      status: 'Đang chuẩn bị xét xử',
      createdAt: todayStr
    }
  ];

  // 6. Công việc
  db.tasks = [
    {
      id: 'CV-001',
      title: 'Kiểm tra tính pháp lý của giấy tờ đất đai Nguyễn Văn A',
      assignerId: 'NV-002',
      assigneeId: 'NV-005',
      departmentId: 'dich-vu',
      customerId: 'KH-001',
      profileId: 'HS-2026-001',
      deadline: todayStr,
      priority: 'Cao',
      status: 'Hoàn thành',
      description: 'Kiểm tra giấy tờ mua bán, hồ sơ đo đạc hiện trạng thửa đất.',
      createdAt: todayStr
    },
    {
      id: 'CV-002',
      title: 'Nộp hồ sơ sổ đỏ lên Chi nhánh văn phòng đăng ký đất đai',
      assignerId: 'NV-002',
      assigneeId: 'NV-005',
      departmentId: 'dich-vu',
      customerId: 'KH-001',
      profileId: 'HS-2026-001',
      deadline: deadlineProfile.toISOString().split('T')[0],
      priority: 'Trung bình',
      status: 'Đang thực hiện',
      description: 'Lấy chữ ký khách hàng, chuẩn bị hồ sơ lệ phí trước bạ và nộp.',
      createdAt: todayStr
    },
    {
      id: 'CV-003',
      title: 'Nghiên cứu hồ sơ khởi kiện tranh chấp hợp đồng Trần Văn B',
      assignerId: 'NV-001',
      assigneeId: 'NV-003',
      departmentId: 'to-tung',
      customerId: 'KH-002',
      lawsuitId: 'VA-2026-003',
      deadline: deadlineLawsuit.toISOString().split('T')[0],
      priority: 'Khẩn cấp',
      status: 'Đang thực hiện',
      description: 'Lập bản luận cứ, nghiên cứu các điều khoản phạt vi phạm hợp đồng.',
      createdAt: todayStr
    }
  ];

  // 7. Lịch làm việc
  db.schedules = [
    {
      id: 'L-001',
      title: 'Làm việc với Nguyễn Văn A về hồ sơ cấp sổ đỏ',
      type: 'Hẹn khách',
      dateTime: `${todayStr}T09:00:00`,
      staffIds: ['NV-004', 'NV-005'],
      customerId: 'KH-001',
      profileId: 'HS-2026-001',
      notes: 'Khách mang theo bản gốc sổ hộ khẩu và CMT cũ để đối chiếu.'
    },
    {
      id: 'L-002',
      title: 'Phiên hòa giải vụ tranh chấp hợp đồng Trần Văn B',
      type: 'Lịch tòa',
      dateTime: `${deadlineLawsuit.toISOString().split('T')[0]}T14:00:00`,
      staffIds: ['NV-003'],
      customerId: 'KH-002',
      lawsuitId: 'VA-2026-003',
      notes: 'Địa điểm: Phòng hòa giải Tòa án Quận 1.'
    }
  ];

  // 8. Trao đổi nội bộ (Chat)
  db.chatMessages = [
    {
      id: 'CHAT-001',
      channelType: 'profile',
      channelId: 'HS-2026-001',
      senderId: 'NV-005',
      senderName: 'Hoàng Văn Sự',
      content: 'Chào chị Dịch, tôi đã liên hệ khách hàng Nguyễn Văn A. Anh ấy hứa sẽ mang đủ hồ sơ vào sáng nay.',
      createdAt: `${todayStr}T08:30:00`
    },
    {
      id: 'CHAT-002',
      channelType: 'profile',
      channelId: 'HS-2026-001',
      senderId: 'NV-002',
      senderName: 'Lê Thị Dịch',
      content: 'Tốt lắm Sự. Lưu ý đối chiếu kỹ thông tin trên CMT/CCCD cũ và mới nhé.',
      createdAt: `${todayStr}T08:45:00`
    }
  ];

  // 9. Tài liệu
  db.documents = [
    {
      id: 'DOC-001',
      name: 'Giấy chứng nhận quyền sử dụng đất cũ - Nguyễn Văn A.pdf',
      fileType: 'pdf',
      fileSize: '2.5 MB',
      fileUrl: '/uploads/sodo_nva_old.pdf',
      customerId: 'KH-001',
      profileId: 'HS-2026-001',
      uploadedBy: 'NV-005',
      createdAt: todayStr
    },
    {
      id: 'DOC-002',
      name: 'Hợp đồng mua bán thương mại tranh chấp - Trần Văn B.docx',
      fileType: 'docx',
      fileSize: '1.2 MB',
      fileUrl: '/uploads/hopdong_tvb.docx',
      customerId: 'KH-002',
      lawsuitId: 'VA-2026-003',
      uploadedBy: 'NV-003',
      createdAt: todayStr
    }
  ];

  // 10. Doanh thu
  db.revenues = [
    {
      id: 'REV-001',
      customerId: 'KH-001',
      profileId: 'HS-2026-001',
      amount: 10000000,
      date: todayStr,
      collectorId: 'NV-004',
      paymentMethod: 'Chuyển khoản',
      notes: 'Tạm ứng 10,000,000đ cho chi phí hồ sơ dịch vụ.'
    }
  ];

  // 11. Chi phí
  db.expenses = [
    {
      id: 'EXP-001',
      content: 'Nộp lệ phí thụ lý đơn khởi kiện tại Tòa Quận 1',
      amount: 2000000,
      date: todayStr,
      spenderId: 'NV-003',
      departmentId: 'to-tung',
      lawsuitId: 'VA-2026-003',
      notes: 'Áp dụng biên lai thu tạm ứng án phí của tòa án.'
    }
  ];

  // 12. Công nợ
  db.debts = [
    {
      id: 'DEBT-001',
      customerId: 'KH-001',
      profileId: 'HS-2026-001',
      totalAmount: 15000000,
      paidAmount: 10000000,
      remainAmount: 5000000,
      deadline: deadlineProfile.toISOString().split('T')[0],
      status: 'Đã thanh toán một phần'
    },
    {
      id: 'DEBT-002',
      customerId: 'KH-002',
      lawsuitId: 'VA-2026-003',
      totalAmount: 30000000,
      paidAmount: 0,
      remainAmount: 30000000,
      deadline: deadlineLawsuit.toISOString().split('T')[0],
      status: 'Chưa thanh toán'
    }
  ];

  // 13. Hợp đồng
  db.contracts = [
    {
      id: 'HD-001',
      customerId: 'KH-001',
      profileId: 'HS-2026-001',
      title: 'Hợp đồng dịch vụ pháp lý cấp sổ đỏ số 01/2026',
      value: 15000000,
      signDate: todayStr,
      effectiveDate: todayStr,
      expireDate: deadlineProfile.toISOString().split('T')[0],
      managerId: 'NV-005',
      status: 'Đang hiệu lực'
    },
    {
      id: 'HD-002',
      customerId: 'KH-002',
      lawsuitId: 'VA-2026-003',
      title: 'Hợp đồng dịch vụ bào chữa, tố tụng tranh chấp thương mại số 02/2026',
      value: 30000000,
      signDate: todayStr,
      effectiveDate: todayStr,
      expireDate: deadlineLawsuit.toISOString().split('T')[0],
      managerId: 'NV-003',
      status: 'Đang hiệu lực'
    }
  ];

  // 14. Chấm công
  db.timekeeping = [
    { id: 'CC-001', staffId: 'NV-001', date: todayStr, checkIn: '08:00', checkOut: '17:30', status: 'Đúng giờ' },
    { id: 'CC-002', staffId: 'NV-002', date: todayStr, checkIn: '08:05', checkOut: '17:00', status: 'Đúng giờ' },
    { id: 'CC-003', staffId: 'NV-003', date: todayStr, checkIn: '08:45', checkOut: '17:15', status: 'Đi muộn' },
    { id: 'CC-004', staffId: 'NV-004', date: todayStr, checkIn: '07:55', checkOut: '17:40', status: 'Đúng giờ' },
    { id: 'CC-005', staffId: 'NV-005', date: todayStr, checkIn: '08:00', checkOut: '17:00', status: 'Đúng giờ' }
  ];

  // 15. Nghỉ phép
  db.leaveRequests = [
    { id: 'NP-001', staffId: 'NV-006', fromDate: todayStr, toDate: todayStr, reason: 'Có việc gia đình đột xuất', status: 'Đã duyệt' }
  ];

  // 16. Nhật ký hệ thống
  db.systemLogs = [
    { id: 'LOG-001', staffId: 'NV-004', staffName: 'Phạm Kế Toán', action: 'Tạo khách hàng', target: 'Khách hàng Nguyễn Văn A', timestamp: `${todayStr}T08:00:00` },
    { id: 'LOG-002', staffId: 'NV-004', staffName: 'Phạm Kế Toán', action: 'Tạo hồ sơ dịch vụ', target: 'Hồ sơ HS-2026-001', timestamp: `${todayStr}T08:15:00` },
    { id: 'LOG-003', staffId: 'NV-004', staffName: 'Phạm Kế Toán', action: 'Ghi nhận doanh thu tạm ứng', target: 'Doanh thu REV-001', timestamp: `${todayStr}T08:20:00` }
  ];
}
export function resetDB() {
  db.departments = [];
  db.staff = [];
  db.customers = [];
  db.serviceProfiles = [];
  db.lawsuits = [];
  db.tasks = [];
  db.schedules = [];
  db.chatMessages = [];
  db.documents = [];
  db.revenues = [];
  db.expenses = [];
  db.debts = [];
  db.contracts = [];
  db.timekeeping = [];
  db.leaveRequests = [];
  db.systemLogs = [];
}
