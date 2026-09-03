import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [Backend] Starting MySQL database seeding...');

  const todayStr = new Date().toISOString().split('T')[0];
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Departments
  console.log('Seeding Departments...');
  await prisma.department.deleteMany();
  await prisma.department.createMany({
    data: [
      { id: 'van-phong', name: 'Văn phòng & Hành chính', code: 'VP-HC', managerId: 'NV-001', description: 'Nhân sự, cơ cấu tổ chức, công văn, kỷ luật lao động, khen thưởng' },
      { id: 'dich-vu', name: 'Phòng Hồ sơ Dịch vụ', code: 'HS-DV', managerId: 'NV-002', description: 'Xử lý các hồ sơ dịch vụ đất đai, hộ tịch, giấy phép...' },
      { id: 'to-tung', name: 'Phòng Hồ sơ Tố tụng', code: 'HS-TT', managerId: 'NV-003', description: 'Tham gia tố tụng vụ án dân sự, hình sự, tranh chấp...' },
      { id: 'doanh-nghiep', name: 'Phòng Hồ sơ Doanh nghiệp', code: 'HS-DN', managerId: 'NV-007', description: 'Thành lập, thay đổi đăng ký kinh doanh, giải thể doanh nghiệp...' },
    ]
  });

  // 2. Staff / Users
  console.log('Seeding Staff / Users...');
  await prisma.staff.deleteMany();
  const staffList = [
    { id: 'NV-001', name: 'Nguyễn Văn Trưởng', phone: '0901234567', email: 'truong.nv@lawfirm.com', password: hashedPassword, role: 'Giám đốc', departmentId: 'van-phong', hireDate: '2020-01-01', status: 'Đang làm việc' },
    { id: 'NV-008', name: 'Trần Thị Phó', phone: '0901234999', email: 'pho.tt@lawfirm.com', password: hashedPassword, role: 'Phó Giám đốc', departmentId: 'van-phong', hireDate: '2020-03-01', status: 'Đang làm việc' },
    { id: 'NV-002', name: 'Lê Thị Dịch', phone: '0902345678', email: 'dich.lt@lawfirm.com', password: hashedPassword, role: 'Trưởng phòng', departmentId: 'dich-vu', hireDate: '2021-03-15', status: 'Đang làm việc' },
    { id: 'NV-003', name: 'Trần Văn Luật', phone: '0903456789', email: 'luat.tv@lawfirm.com', password: hashedPassword, role: 'Trưởng phòng', departmentId: 'to-tung', hireDate: '2021-06-01', status: 'Đang làm việc' },
    { id: 'NV-004', name: 'Phạm Kế Toán', phone: '0904567890', email: 'toan.p@lawfirm.com', password: hashedPassword, role: 'Nhân viên', departmentId: 'van-phong', hireDate: '2022-09-01', status: 'Đang làm việc' },
    { id: 'NV-005', name: 'Hoàng Văn Sự', phone: '0905678901', email: 'su.hv@lawfirm.com', password: hashedPassword, role: 'Nhân viên', departmentId: 'dich-vu', hireDate: '2023-01-10', status: 'Đang làm việc' },
    { id: 'NV-006', name: 'Vũ Hỗ Trợ', phone: '0906789012', email: 'tro.v@lawfirm.com', password: hashedPassword, role: 'Luật sư', departmentId: 'to-tung', hireDate: '2023-05-20', status: 'Đang làm việc' },
    { id: 'NV-007', name: 'Đặng Doanh Nghiệp', phone: '0907890123', email: 'dn.d@lawfirm.com', password: hashedPassword, role: 'Trưởng phòng', departmentId: 'doanh-nghiep', hireDate: '2022-01-15', status: 'Đang làm việc' },
    { id: 'NV-009', name: 'Lý Văn DN', phone: '0908901234', email: 'dn.lv@lawfirm.com', password: hashedPassword, role: 'Nhân viên', departmentId: 'doanh-nghiep', hireDate: '2023-06-01', status: 'Đang làm việc' },
  ];
  for (const s of staffList) {
    await prisma.staff.create({ data: s });
  }

  // 3. Customers
  console.log('Seeding Customers...');
  await prisma.customer.deleteMany();
  await prisma.customer.createMany({
    data: [
      { id: 'KH-001', name: 'Nguyễn Văn A', phone: '0987654321', email: 'nva@gmail.com', address: '123 Đường Láng, Đống Đa, Hà Nội', type: 'Cá nhân', taxId: '012345678912' },
      { id: 'KH-002', name: 'Trần Văn B', phone: '0912345678', email: 'tvb@gmail.com', address: '456 Trần Hưng Đạo, Quận 1, TP. HCM', type: 'Cá nhân', taxId: '098765432109' },
      { id: 'KH-003', name: 'Công ty TNHH ABC', phone: '0281234567', email: 'info@abc.com.vn', address: '789 Nguyễn Huệ, Quận 1, TP. HCM', type: 'Doanh nghiệp', taxId: '0301234567', representative: 'Nguyễn Văn C' },
    ]
  });

  // 4. Service Profiles
  console.log('Seeding Service Profiles...');
  await prisma.serviceProfile.deleteMany();
  await prisma.serviceProfile.createMany({
    data: [
      { id: 'HS-2026-001', title: 'Hồ sơ xin cấp sổ đỏ Nguyễn Văn A', customerId: 'KH-001', serviceType: 'Đất đai', managerId: 'NV-005', receiveDate: todayStr, price: 15000000, status: 'Đang xử lý', contractNumber: 'HDDV-01/2026', notes: 'Cần bổ sung bản đo đạc thửa đất mới nhất' },
      { id: 'HS-2026-002', title: 'Hồ sơ thành lập Công ty TNHH ABC', customerId: 'KH-003', serviceType: 'Doanh nghiệp', managerId: 'NV-009', receiveDate: todayStr, price: 8000000, status: 'Mới tiếp nhận', contractNumber: 'HDDV-03/2026', notes: 'Khách cần gấp để ký hợp đồng kinh doanh' },
    ]
  });

  // 5. Lawsuits
  console.log('Seeding Lawsuits...');
  await prisma.lawsuit.deleteMany();
  await prisma.lawsuit.createMany({
    data: [
      { id: 'VA-2026-003', title: 'Vụ án tranh chấp hợp đồng thương mại Trần Văn B', customerId: 'KH-002', lawyerId: 'NV-003', receiveDate: todayStr, status: 'Đang chuẩn bị xét xử', contractNumber: 'HDTT-02/2026', notes: 'Cần chuẩn bị bản luận cứ trước ngày xét xử. LS Luật đang xử lý.', advancePayment: 10000000 },
    ]
  });

  // 6. Tasks
  console.log('Seeding Tasks...');
  await prisma.task.deleteMany();
  await prisma.task.createMany({
    data: [
      { id: 'CV-001', title: 'Kiểm tra tính pháp lý của giấy tờ đất đai Nguyễn Văn A', assigneeId: 'NV-005', departmentId: 'dich-vu', deadline: todayStr, priority: 'Cao', status: 'Hoàn thành', description: 'Kiểm tra giấy tờ mua bán, hồ sơ đo đạc hiện trạng thửa đất.' },
      { id: 'CV-002', title: 'Nộp hồ sơ sổ đỏ lên Chi nhánh văn phòng đăng ký đất đai', assigneeId: 'NV-005', departmentId: 'dich-vu', deadline: todayStr, priority: 'Trung bình', status: 'Đang thực hiện', description: 'Lấy chữ ký khách hàng, chuẩn bị hồ sơ lệ phí trước bạ và nộp.' },
      { id: 'CV-003', title: 'Nghiên cứu hồ sơ khởi kiện tranh chấp hợp đồng Trần Văn B', assigneeId: 'NV-003', departmentId: 'to-tung', deadline: todayStr, priority: 'Khẩn cấp', status: 'Đang thực hiện', description: 'Lập bản luận cứ, nghiên cứu các điều khoản phạt vi phạm hợp đồng.' },
    ]
  });

  // 7. Contracts
  console.log('Seeding Contracts...');
  await prisma.contract.deleteMany();
  await prisma.contract.createMany({
    data: [
      { id: 'HD-001', customerId: 'KH-001', title: 'Hợp đồng dịch vụ pháp lý cấp sổ đỏ số 01/2026', value: 15000000, signDate: todayStr, expireDate: todayStr, managerId: 'NV-005', status: 'Đang hiệu lực', attachmentName: 'hopdong_sodo_mau.pdf', attachmentUrl: '/uploads/hopdong_sodo_mau.pdf' },
      { id: 'HD-002', customerId: 'KH-002', title: 'Hợp đồng bào chữa tố tụng tranh chấp thương mại số 02/2026', value: 30000000, signDate: todayStr, expireDate: todayStr, managerId: 'NV-003', status: 'Đang hiệu lực', attachmentName: 'hopdong_baochua_mau.pdf', attachmentUrl: '/uploads/hopdong_baochua_mau.pdf' },
    ]
  });

  // 8. Schedules
  console.log('Seeding Schedules...');
  await prisma.schedule.deleteMany();
  await prisma.schedule.createMany({
    data: [
      { id: 'L-001', title: 'Làm việc với Nguyễn Văn A về hồ sơ cấp sổ đỏ', type: 'Hẹn khách', time: '09:00', date: todayStr, status: 'Chưa diễn ra', organizerId: 'NV-005', location: 'Văn phòng Công ty' },
      { id: 'L-002', title: 'Phiên hòa giải vụ tranh chấp hợp đồng Trần Văn B', type: 'Lịch tòa', time: '14:00', date: todayStr, status: 'Chưa diễn ra', organizerId: 'NV-003', location: 'Tòa án nhân dân Quận 1' },
    ]
  });

  console.log('🎉 [Backend] MySQL database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
