'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ConfigProvider,
  theme as antdTheme,
  Layout,
  Menu,
  Button,
  Card,
  Table,
  Tag,
  Badge,
  Avatar,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  List,
  Tabs,
  message,
  Divider,
  Typography,
  Switch
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  UserOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  MessageOutlined,
  FolderOpenOutlined,
  DollarOutlined,
  SolutionOutlined,
  SettingOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
  PlusOutlined,
  SendOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  MenuOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  dashboardApi,
  customerApi,
  serviceProfileApi,
  lawsuitApi,
  taskApi,
  scheduleApi,
  chatApi,
  documentApi,
  financeApi,
  contractApi,
  hrApi,
  logApi
} from '../api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function App() {
  const [messageApi, contextHolder] = message.useMessage();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: 'NV-001',
    name: 'Nguyễn Văn Trưởng',
    role: 'Giám đốc',
    departmentId: 'hanh-chinh'
  });

  // State dữ liệu
  const [stats, setStats] = useState<any>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [lawsuits, setLawsuits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [revenues, setRevenues] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [timekeeping, setTimekeeping] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  // State chi tiết & modals
  const [detailModal, setDetailModal] = useState<{ visible: boolean; type: 'customer' | 'profile' | 'lawsuit' | 'department' | 'staff' | 'task' | 'schedule' | 'contract'; data: any }>({
    visible: false,
    type: 'customer',
    data: null
  });
  const [createModal, setCreateModal] = useState<{ visible: boolean; type: string }>({ visible: false, type: '' });
  const [chatChannel, setChatChannel] = useState<{ type: string; id: string; name: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = useCallback((e: any) => {
    setCurrentMenu(e.key);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (chatChannel) {
      fetchChatMessages(chatChannel.type, chatChannel.id);
      const interval = setInterval(() => {
        fetchChatMessages(chatChannel.type, chatChannel.id);
      }, 5000); // Poll mỗi 5s để giảm tải serverless
      return () => clearInterval(interval);
    }
  }, [chatChannel]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchData = async () => {
    try {
      const [
        sData, cData, pData, lData, tData, schData, docData, revData, expData, debtData, contrData, stData, deptData, logData, tkData, lvData
      ] = await Promise.all([
        dashboardApi.getStats(),
        customerApi.getAll(),
        serviceProfileApi.getAll(),
        lawsuitApi.getAll(),
        taskApi.getAll(),
        scheduleApi.getAll(),
        documentApi.getAll(),
        financeApi.getRevenues(),
        financeApi.getExpenses(),
        financeApi.getDebts(),
        contractApi.getAll(),
        hrApi.getStaff(),
        hrApi.getDepartments(),
        logApi.getAll(),
        hrApi.getTimekeeping(),
        hrApi.getLeaveRequests()
      ]);

      setStats(sData);
      setCustomers(cData);
      setProfiles(pData);
      setLawsuits(lData);
      setTasks(tData);
      setSchedules(schData);
      setDocuments(docData);
      setRevenues(revData);
      setExpenses(expData);
      setDebts(debtData);
      setContracts(contrData);
      setStaff(stData);
      setDepartments(deptData);
      setLogs(logData);
      setTimekeeping(tkData);
      setLeaveRequests(lvData);
    } catch (error) {
      messageApi.error('Không thể tải dữ liệu. Vui lòng tải lại trang.');
    }
  };

  const fetchChatMessages = async (type: string, id: string) => {
    try {
      const msgs = await chatApi.getMessages(type, id);
      setChatMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !chatChannel) return;
    try {
      const created = await chatApi.sendMessage({
        channelType: chatChannel.type,
        channelId: chatChannel.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: chatInput
      });
      setChatInput('');
      setChatMessages(prev => [...prev, created]);
    } catch (e) {
      messageApi.error('Gửi tin nhắn thất bại');
    }
  };

  const handleOpenDetail = async (type: 'customer' | 'profile' | 'lawsuit' | 'department' | 'staff' | 'task' | 'schedule' | 'contract', id: string) => {
    try {
      let data;
      if (type === 'customer') data = await customerApi.getById(id);
      else if (type === 'profile') data = await serviceProfileApi.getById(id);
      else if (type === 'lawsuit') data = await lawsuitApi.getById(id);
      else if (type === 'department') data = await hrApi.getDepartmentById(id);
      else if (type === 'staff') data = await hrApi.getStaffById(id);
      else if (type === 'task') data = await taskApi.getById(id);
      else if (type === 'schedule') data = await scheduleApi.getById(id);
      else if (type === 'contract') data = await contractApi.getById(id);
      
      setDetailModal({ visible: true, type, data });
    } catch (e) {
      messageApi.error('Không thể lấy chi tiết thông tin');
    }
  };

  const handleCreateSubmit = async (values: any) => {
    try {
      // Chuẩn hóa date
      if (values.deadline) values.deadline = values.deadline.format('YYYY-MM-DD');
      if (values.date) values.date = values.date.format('YYYY-MM-DD');
      if (values.dateTime) values.dateTime = values.dateTime.format('YYYY-MM-DDTHH:mm:ss');
      if (values.signDate) values.signDate = values.signDate.format('YYYY-MM-DD');
      if (values.effectiveDate) values.effectiveDate = values.effectiveDate.format('YYYY-MM-DD');
      if (values.expireDate) values.expireDate = values.expireDate.format('YYYY-MM-DD');
      if (values.fromDate) values.fromDate = values.fromDate.format('YYYY-MM-DD');
      if (values.toDate) values.toDate = values.toDate.format('YYYY-MM-DD');

      // Optimistic update: dùng response trả về từ API để cập nhật state ngay
      switch (createModal.type) {
        case 'customer': {
          const created = await customerApi.create(values);
          setCustomers(prev => [...prev, created]);
          break;
        }
        case 'profile': {
          const created = await serviceProfileApi.create(values);
          setProfiles(prev => [...prev, created]);
          break;
        }
        case 'lawsuit': {
          const created = await lawsuitApi.create(values);
          setLawsuits(prev => [...prev, created]);
          break;
        }
        case 'task': {
          const created = await taskApi.create({ ...values, assignerId: currentUser.id });
          setTasks(prev => [...prev, created]);
          break;
        }
        case 'schedule': {
          const created = await scheduleApi.create(values);
          setSchedules(prev => [...prev, created]);
          break;
        }
        case 'revenue': {
          const created = await financeApi.createRevenue({ ...values, collectorId: currentUser.id });
          setRevenues(prev => [...prev, created]);
          break;
        }
        case 'expense': {
          const created = await financeApi.createExpense({ ...values, spenderId: currentUser.id });
          setExpenses(prev => [...prev, created]);
          break;
        }
        case 'contract': {
          const created = await contractApi.create(values);
          setContracts(prev => [...prev, created]);
          break;
        }
        case 'leave': {
          const created = await hrApi.createLeaveRequest({ ...values, staffId: currentUser.id, status: 'Chờ duyệt' });
          setLeaveRequests(prev => [...prev, created]);
          break;
        }
        case 'timekeeping': {
          const created = await hrApi.createTimekeeping({ ...values, staffId: currentUser.id, status: 'Đúng giờ' });
          setTimekeeping(prev => [...prev, created]);
          break;
        }
        case 'staff': {
          const created = await hrApi.createStaff(values);
          setStaff(prev => [...prev, created]);
          break;
        }
        default:
          break;
      }
      messageApi.success('Tạo mới thành công');
      setCreateModal({ visible: false, type: '' });
      form.resetFields();
    } catch (e) {
      messageApi.error('Tạo mới thất bại');
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: 'Đã duyệt' | 'Từ chối') => {
    try {
      await hrApi.updateLeaveRequest(id, { status });
      setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      messageApi.success('Cập nhật trạng thái nghỉ phép thành công');
    } catch (e) {
      messageApi.error('Thao tác thất bại');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await hrApi.deleteStaff(id);
      setStaff(prev => prev.filter(s => s.id !== id));
      messageApi.success('Xóa nhân viên thành công');
    } catch (e) {
      messageApi.error('Xóa nhân viên thất bại');
    }
  };

  const handleUpdateStaff = async (values: any) => {
    try {
      await hrApi.updateStaff(detailModal.data.id, values);
      setStaff(prev => prev.map(s => s.id === detailModal.data.id ? { ...s, ...values } : s));
      messageApi.success('Cập nhật nhân viên thành công');
      setDetailModal({ visible: false, type: 'staff', data: null });
    } catch (e) {
      messageApi.error('Cập nhật nhân viên thất bại');
    }
  };

  const handleUpdateCustomer = async (values: any) => {
    try {
      await customerApi.update(detailModal.data.id, values);
      setCustomers(prev => prev.map(c => c.id === detailModal.data.id ? { ...c, ...values } : c));
      messageApi.success('Cập nhật khách hàng thành công');
      setDetailModal({ visible: false, type: 'customer', data: null });
    } catch (e) {
      messageApi.error('Cập nhật khách hàng thất bại');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await customerApi.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      messageApi.success('Xóa khách hàng thành công');
    } catch (e) {
      messageApi.error('Xóa khách hàng thất bại');
    }
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      await serviceProfileApi.update(detailModal.data.id, values);
      setProfiles(prev => prev.map(p => p.id === detailModal.data.id ? { ...p, ...values } : p));
      messageApi.success('Cập nhật hồ sơ thành công');
      setDetailModal({ visible: false, type: 'profile', data: null });
    } catch (e) {
      messageApi.error('Cập nhật hồ sơ thất bại');
    }
  };

  const handleUpdateLawsuit = async (values: any) => {
    try {
      await lawsuitApi.update(detailModal.data.id, values);
      setLawsuits(prev => prev.map(l => l.id === detailModal.data.id ? { ...l, ...values } : l));
      messageApi.success('Cập nhật vụ án thành công');
      setDetailModal({ visible: false, type: 'lawsuit', data: null });
    } catch (e) {
      messageApi.error('Cập nhật vụ án thất bại');
    }
  };

  const handleUpdateTask = async (values: any) => {
    try {
      await taskApi.update(detailModal.data.id, values);
      setTasks(prev => prev.map(t => t.id === detailModal.data.id ? { ...t, ...values } : t));
      messageApi.success('Cập nhật công việc thành công');
      setDetailModal({ visible: false, type: 'task', data: null });
    } catch (e) {
      messageApi.error('Cập nhật công việc thất bại');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskApi.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      messageApi.success('Xóa công việc thành công');
    } catch (e) {
      messageApi.error('Xóa công việc thất bại');
    }
  };

  const handleUpdateSchedule = async (values: any) => {
    try {
      await scheduleApi.update(detailModal.data.id, values);
      setSchedules(prev => prev.map(s => s.id === detailModal.data.id ? { ...s, ...values } : s));
      messageApi.success('Cập nhật lịch hẹn thành công');
      setDetailModal({ visible: false, type: 'schedule', data: null });
    } catch (e) {
      messageApi.error('Cập nhật lịch hẹn thất bại');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await scheduleApi.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      messageApi.success('Xóa lịch hẹn thành công');
    } catch (e) {
      messageApi.error('Xóa lịch hẹn thất bại');
    }
  };

  const handleUpdateContract = async (values: any) => {
    try {
      await contractApi.update(detailModal.data.id, values);
      setContracts(prev => prev.map(c => c.id === detailModal.data.id ? { ...c, ...values } : c));
      messageApi.success('Cập nhật hợp đồng thành công');
      setDetailModal({ visible: false, type: 'contract', data: null });
    } catch (e) {
      messageApi.error('Cập nhật hợp đồng thất bại');
    }
  };

  const handleDeleteContract = async (id: string) => {
    try {
      await contractApi.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
      messageApi.success('Xóa hợp đồng thành công');
    } catch (e) {
      messageApi.error('Xóa hợp đồng thất bại');
    }
  };

  if (!mounted) return null;

  // Lựa chọn màu sắc
  const primaryColor = darkMode ? '#3b82f6' : '#2563eb';
  const customTheme = {
    algorithm: darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: primaryColor,
      borderRadius: 8,
      fontFamily: 'var(--font-inter)'
    }
  };

  // Cấu hình Items của Sidebar
  const sidebarItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'customers', icon: <TeamOutlined />, label: 'Khách hàng' },
    { key: 'departments', icon: <ApartmentOutlined />, label: 'Tổ chức & Phòng ban' },
    { key: 'staff', icon: <UserOutlined />, label: 'Nhân sự' },
    { key: 'profiles', icon: <FileTextOutlined />, label: 'Hồ sơ dịch vụ' },
    { key: 'lawsuits', icon: <SafetyCertificateOutlined />, label: 'Vụ án / Tố tụng' },
    { key: 'tasks', icon: <SolutionOutlined />, label: 'Công việc' },
    { key: 'schedules', icon: <CalendarOutlined />, label: 'Lịch làm việc' },
    { key: 'chat', icon: <MessageOutlined />, label: 'Trao đổi nội bộ' },
    { key: 'documents', icon: <FolderOpenOutlined />, label: 'Tài liệu' },
    { key: 'finance', icon: <DollarOutlined />, label: 'Tài chính & Thu chi' },
    { key: 'contracts', icon: <FileTextOutlined />, label: 'Hợp đồng' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt hệ thống' }
  ];

  return (
    <>
      {contextHolder}
    <ConfigProvider theme={customTheme}>
      <div className={darkMode ? 'dark h-full flex flex-col' : 'h-full flex flex-col'}>
        <Layout className="min-h-screen">
          <Sider
            width={260}
            className={`glass-sidebar min-h-screen ${isMobile ? 'mobile-sidebar' : ''}`}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 100,
              overflow: 'auto',
              transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
              transition: 'transform 0.3s ease'
            }}
          >
            <div className="p-6 flex items-center justify-between border-b border-[var(--glass-border)]">
              <span className="text-xl font-bold tracking-wider flex items-center gap-2">
                ⚖️ <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-black">LAWFIRM ERP</span>
              </span>
            </div>

            <Menu
              mode="inline"
              selectedKeys={[currentMenu]}
              onClick={handleMenuClick}
              items={sidebarItems}
              style={{ borderRight: 0, background: 'transparent', marginTop: 12, flex: 1, overflow: 'auto' }}
            />

            {/* Phân quyền nhanh để demo */}
            <div className="p-4 m-4 rounded-xl border border-[var(--glass-border)] bg-[hsla(0,0%,50%,0.05)]">
              <Text className="block text-xs text-gray-400 mb-2">Đóng vai trò (Demo):</Text>
              <Select
                value={currentUser.id}
                onChange={(val) => {
                  const s = staff.find(x => x.id === val);
                  if (s) {
                    setCurrentUser({ id: s.id, name: s.name, role: s.role, departmentId: s.departmentId });
                    messageApi.success(`Đổi quyền sang: ${s.name} (${s.role})`);
                  }
                }}
                className="w-full"
                options={staff.map(s => ({ value: s.id, label: `${s.name} (${s.role})` }))}
              />
            </div>
          </Sider>

          <Layout className="transition-all duration-300" style={{ marginLeft: isMobile ? 0 : 260 }}>

            {isMobile && sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <Header
              className="glass-panel flex items-center justify-between px-4 md:px-8"
              style={{
                position: 'fixed',
                top: 16,
                left: isMobile ? 16 : 276,
                right: 16,
                height: 64,
                zIndex: 9,
                margin: 0
              }}
            >
              <div className="flex items-center gap-2 md:gap-4">
                {isMobile && (
                  <Button
                    icon={<MenuOutlined />}
                    type="text"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-lg"
                  />
                )}
                <Title level={4} style={{ margin: 0 }} className="hidden sm:block">
                  {sidebarItems.find(i => i.key === currentMenu)?.label}
                </Title>
              </div>

              <div className="flex items-center gap-3 md:gap-6">
                {/* Dark Mode Switch */}
                <Switch
                  checked={darkMode}
                  onChange={(checked) => {
                    setDarkMode(checked);
                    if (checked) document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                  }}
                  checkedChildren={<MoonOutlined />}
                  unCheckedChildren={<SunOutlined />}
                />

                {/* Notifications */}
                <Badge count={stats.overdueTasksCount || 0} size="small">
                  <Button
                    icon={<BellOutlined className="text-lg" />}
                    type="text"
                    onClick={() => {
                      setCurrentMenu('tasks');
                      messageApi.info('Hiển thị danh sách công việc quá hạn');
                    }}
                  />
                </Badge>

                {/* User Profile */}
                <div className="hidden sm:flex items-center gap-3">
                  <Avatar style={{ backgroundColor: primaryColor }}>{currentUser.name[0]}</Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight">{currentUser.name}</span>
                    <span className="text-xs text-gray-400">{currentUser.role}</span>
                  </div>
                </div>
              </div>
            </Header>

            <Content
              className="px-4 md:px-8 pb-8"
              style={{
                marginTop: 96,
                minHeight: 'calc(100vh - 96px)',
                overflow: 'initial'
              }}
            >
              {/* ---------------------------------------------------- */}
              {/* TAB 1: DASHBOARD */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'dashboard' && (
                <div className="space-y-6">
                  {/* Chỉ số hàng đầu */}
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={12} lg={6}>
                      <Card className="glass-panel text-center hover:scale-102 transition-transform duration-200">
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider">Khách hàng</Text>
                        <Title level={2} style={{ margin: '8px 0' }} className="text-blue-500">
                          {stats.totalCustomers || 0}
                        </Title>
                        <Text type="secondary">Hoạt động trong hệ thống</Text>
                      </Card>
                    </Col>
                    <Col xs={12} sm={12} lg={6}>
                      <Card className="glass-panel text-center hover:scale-102 transition-transform duration-200">
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider">Hồ sơ dịch vụ</Text>
                        <Title level={2} style={{ margin: '8px 0' }} className="text-orange-500">
                          {stats.activeProfiles || 0}
                        </Title>
                        <Text type="secondary">Đang xử lý tại phòng DV</Text>
                      </Card>
                    </Col>
                    <Col xs={12} sm={12} lg={6}>
                      <Card className="glass-panel text-center hover:scale-102 transition-transform duration-200">
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider">Vụ án hình sự / dân sự</Text>
                        <Title level={2} style={{ margin: '8px 0' }} className="text-red-500">
                          {stats.activeLawsuits || 0}
                        </Title>
                        <Text type="secondary">Đang chuẩn bị xét xử</Text>
                      </Card>
                    </Col>
                    <Col xs={12} sm={12} lg={6}>
                      <Card className="glass-panel text-center hover:scale-102 transition-transform duration-200">
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider">Tổng công nợ</Text>
                        <Title level={2} style={{ margin: '8px 0' }} className="text-green-500">
                          {((stats.totalDebt || 0) / 1000000).toFixed(1)}M
                        </Title>
                        <Text type="secondary">Phải thu từ khách hàng</Text>
                      </Card>
                    </Col>
                  </Row>

                  {/* Doanh thu / Chi phí tháng */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card title="Tài chính tháng này" className="glass-panel">
                        <div className="flex justify-around items-center h-32">
                          <div className="text-center">
                            <Text type="secondary" className="block">Doanh thu tháng</Text>
                            <Title level={3} className="text-green-600">
                              {(stats.monthlyRevenue || 0).toLocaleString()}đ
                            </Title>
                          </div>
                           <div className="border-l border-[var(--border)] h-20" />
                          <div className="text-center">
                            <Text type="secondary" className="block">Chi phí phát sinh</Text>
                            <Title level={3} className="text-red-500">
                              {(stats.monthlyExpense || 0).toLocaleString()}đ
                            </Title>
                          </div>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} md={12}>
                      <Card title="Lịch hẹn hôm nay" className="glass-panel h-full">
                         <div className="space-y-2">
                           {(stats.schedulesToday || []).length === 0 ? (
                             <div className="text-center text-gray-400 py-6">Không có lịch hẹn hôm nay</div>
                           ) : (
                             (stats.schedulesToday || []).map((item: any) => (
                               <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-[var(--border)] bg-[hsla(0,0%,50%,0.02)]">
                                 <div>
                                   <Tag color="blue">{item.type}</Tag>
                                   <Text strong>{item.title}</Text>
                                 </div>
                                 <Text type="secondary">{item.dateTime.split('T')[1]?.substring(0, 5)}</Text>
                               </div>
                             ))
                           )}
                         </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* Hoạt động & Công việc cần xử lý */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Card title="Công việc cần xử lý gấp / Quá hạn" className="glass-panel">
                                    <div className="space-y-3">
                           {tasks.filter(t => t.status !== 'Hoàn thành').length === 0 ? (
                             <div className="text-center text-gray-400 py-6">Không có công việc cần xử lý</div>
                           ) : (
                             tasks.filter(t => t.status !== 'Hoàn thành').slice(0, 5).map((item: any) => {
                               const isOverdue = item.status === 'Quá hạn';
                               return (
                                 <div key={item.id} className="p-3 rounded-lg border border-[var(--border)] bg-[hsla(0,0%,50%,0.02)] flex flex-col gap-2">
                                   <div>
                                     <a className="font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => item.profileId ? handleOpenDetail('profile', item.profileId) : item.lawsuitId ? handleOpenDetail('lawsuit', item.lawsuitId) : null}>
                                       {item.title}
                                     </a>
                                   </div>
                                   <Space>
                                     <Tag color={isOverdue ? 'red' : 'orange'}>{item.status}</Tag>
                                     <Text type="secondary" className="text-xs">Hạn: {item.deadline}</Text>
                                     <Tag color="purple">{item.priority}</Tag>
                                   </Space>
                                 </div>
                               );
                             })
                           )}
                         </div>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card title="Hoạt động gần đây" className="glass-panel">
                         <div className="space-y-3">
                           {(stats.recentActivities || []).length === 0 ? (
                             <div className="text-center text-gray-400 py-6">Không có hoạt động gần đây</div>
                           ) : (
                             (stats.recentActivities || []).map((item: any) => (
                               <div key={item.id} className="flex gap-3 items-start p-3 rounded-lg border border-[var(--border)] bg-[hsla(0,0%,50%,0.02)]">
                                 <Avatar>{item.staffName[0]}</Avatar>
                                 <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-center mb-1">
                                     <Text strong className="text-sm">{item.staffName} - {item.action}</Text>
                                     <Text type="secondary" className="text-xs">
                                       {dayjs(item.timestamp).format('HH:mm DD/MM')}
                                     </Text>
                                   </div>
                                   <div className="text-xs text-gray-500 truncate">{item.target}</div>
                                 </div>
                               </div>
                             ))
                           )}
                         </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 2: CUSTOMERS */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'customers' && (
                <Card
                  title="Danh sách Khách hàng"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'customer' })}>
                      Thêm khách hàng
                    </Button>
                  }
                  className="glass-panel"
                >
                  <Table
                    dataSource={customers}
                    rowKey="id"
                    onRow={(record) => ({
                      onClick: () => handleOpenDetail('customer', record.id),
                      style: { cursor: 'pointer' }
                    })}
                    columns={[
                      { title: 'Mã KH', dataIndex: 'id', key: 'id' },
                      { title: 'Họ tên', dataIndex: 'name', key: 'name', render: (text) => <a>{text}</a> },
                      { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
                      { title: 'Email', dataIndex: 'email', key: 'email' },
                      { title: 'Loại khách', dataIndex: 'type', key: 'type', render: (text) => <Tag color={text === 'Cá nhân' ? 'blue' : 'green'}>{text}</Tag> },
                      { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
                      {
                        title: 'Hành động',
                        key: 'action',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); handleOpenDetail('customer', record.id); }}>Chi tiết</Button>
                            <Button size="small" type="link" danger onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(record.id); }}>Xóa</Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </Card>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 3: DEPARTMENTS */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'departments' && (
                <div className="space-y-6">
                  <Row gutter={[16, 16]}>
                    {departments.map((dept: any) => {
                      const mgr = staff.find(s => s.id === dept.managerId);
                      return (
                        <Col xs={24} md={8} key={dept.id}>
                          <Card
                            title={dept.name}
                            className="glass-panel hover:shadow-lg transition-shadow duration-200"
                            actions={[
                              <Button type="link" onClick={() => handleOpenDetail('department', dept.id)} key="detail">Chi tiết phòng</Button>
                            ]}
                          >
                            <p><Text strong>Trưởng phòng:</Text> {mgr ? mgr.name : 'Chưa gán'}</p>
                            <p><Text type="secondary">{dept.description}</Text></p>
                            <Tag color="green">Đang hoạt động</Tag>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 4: STAFF */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'staff' && (
                <Card
                  title="Danh sách Nhân sự"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'staff' })}>
                      Thêm nhân viên
                    </Button>
                  }
                  className="glass-panel"
                >
                  <Table
                    dataSource={staff}
                    rowKey="id"
                    onRow={(record) => ({
                      onClick: () => handleOpenDetail('staff', record.id),
                      style: { cursor: 'pointer' }
                    })}
                    columns={[
                      { title: 'Mã NV', dataIndex: 'id', key: 'id' },
                      { title: 'Họ tên', dataIndex: 'name', key: 'name', render: (text) => <a>{text}</a> },
                      { title: 'Chức vụ', dataIndex: 'role', key: 'role', render: (r) => <Tag color="blue">{r}</Tag> },
                      { title: 'Phòng ban', dataIndex: 'departmentId', key: 'departmentId', render: (id) => departments.find(d => d.id === id)?.name || id },
                      { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
                      { title: 'Email', dataIndex: 'email', key: 'email' },
                      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Đang làm việc' ? 'green' : 'red'}>{s}</Tag> },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" type="link" onClick={() => handleOpenDetail('staff', record.id)}>Chi tiết</Button>
                            <Button size="small" type="link" danger onClick={() => handleDeleteStaff(record.id)}>Xóa</Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </Card>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 5: PROFILES (HỒ SƠ DỊCH VỤ) */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'profiles' && (
                <Card
                  title="Hồ sơ dịch vụ (Phòng Dịch vụ)"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'profile' })}>
                      Tạo hồ sơ mới
                    </Button>
                  }
                  className="glass-panel"
                >
                  <Table
                    dataSource={profiles}
                    rowKey="id"
                    onRow={(record) => ({
                      onClick: () => handleOpenDetail('profile', record.id),
                      style: { cursor: 'pointer' }
                    })}
                    columns={[
                      { title: 'Mã hồ sơ', dataIndex: 'id', key: 'id' },
                      { title: 'Tên hồ sơ', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                      { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                      { title: 'Loại dịch vụ', dataIndex: 'serviceType', key: 'serviceType' },
                      { title: 'Phụ trách', dataIndex: 'managerId', key: 'managerId', render: (mid) => staff.find(s => s.id === mid)?.name || mid },
                      { title: 'Hạn xử lý', dataIndex: 'deadline', key: 'deadline' },
                      { title: 'Phí dịch vụ', dataIndex: 'price', key: 'price', render: (v) => `${v.toLocaleString()}đ` },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (s) => {
                          let color = 'blue';
                          if (s === 'Hoàn thành') color = 'green';
                          if (s === 'Chờ bổ sung') color = 'orange';
                          return <Tag color={color}>{s}</Tag>;
                        }
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); handleOpenDetail('profile', record.id); }}>Chi tiết</Button>
                            <Button
                              size="small"
                              type="link"
                              onClick={(e) => { e.stopPropagation(); setChatChannel({ type: 'profile', id: record.id, name: record.title }); setCurrentMenu('chat'); }}
                            >
                              Trao đổi
                            </Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </Card>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 6: LAWSUITS (VỤ ÁN / TỐ TỤNG) */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'lawsuits' && (
                <Card
                  title="Vụ án / Tố tụng (Phòng Tố tụng)"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'lawsuit' })}>
                      Tạo vụ án mới
                    </Button>
                  }
                  className="glass-panel"
                >
                  <Table
                    dataSource={lawsuits}
                    rowKey="id"
                    onRow={(record) => ({
                      onClick: () => handleOpenDetail('lawsuit', record.id),
                      style: { cursor: 'pointer' }
                    })}
                    columns={[
                      { title: 'Mã vụ án', dataIndex: 'id', key: 'id' },
                      { title: 'Tên vụ án', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                      { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                      { title: 'Luật sư phụ trách', dataIndex: 'lawyerId', key: 'lawyerId', render: (lid) => staff.find(s => s.id === lid)?.name || lid },
                      { title: 'Cơ quan giải quyết', dataIndex: 'court', key: 'court' },
                      { title: 'Số vụ án', dataIndex: 'caseNumber', key: 'caseNumber' },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (s) => <Tag color={s === 'Hoàn thành' ? 'green' : 'blue'}>{s}</Tag>
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); handleOpenDetail('lawsuit', record.id); }}>Chi tiết</Button>
                            <Button
                              size="small"
                              type="link"
                              onClick={(e) => { e.stopPropagation(); setChatChannel({ type: 'lawsuit', id: record.id, name: record.title }); setCurrentMenu('chat'); }}
                            >
                              Trao đổi
                            </Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </Card>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 7: TASKS */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'tasks' && (
                <Card
                  title="Quản lý công việc"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'task' })}>
                      Giao việc mới
                    </Button>
                  }
                  className="glass-panel"
                >
                  <Table
                    dataSource={tasks}
                    rowKey="id"
                    onRow={(record) => ({
                      onClick: () => handleOpenDetail('task', record.id),
                      style: { cursor: 'pointer' }
                    })}
                    columns={[
                      { title: 'Công việc', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                      { title: 'Người thực hiện', dataIndex: 'assigneeId', key: 'assigneeId', render: (id) => staff.find(s => s.id === id)?.name || id },
                      { title: 'Phòng ban', dataIndex: 'departmentId', key: 'departmentId', render: (id) => departments.find(d => d.id === id)?.name || id },
                      { title: 'Hạn chót', dataIndex: 'deadline', key: 'deadline' },
                      { title: 'Mức ưu tiên', dataIndex: 'priority', key: 'priority', render: (p) => <Tag color={p === 'Khẩn cấp' ? 'red' : p === 'Cao' ? 'orange' : 'blue'}>{p}</Tag> },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (s, record) => (
                          <Select
                            value={s}
                            onClick={(e) => e.stopPropagation()}
                            onChange={async (newStatus) => {
                              try {
                                await taskApi.update(record.id, { status: newStatus });
                                setTasks(prev => prev.map(t => t.id === record.id ? { ...t, status: newStatus } : t));
                                messageApi.success('Cập nhật trạng thái thành công');
                              } catch (e) {
                                messageApi.error('Không thể cập nhật trạng thái');
                              }
                            }}
                            options={[
                              { value: 'Chưa bắt đầu', label: 'Chưa bắt đầu' },
                              { value: 'Đang thực hiện', label: 'Đang thực hiện' },
                              { value: 'Chờ xử lý', label: 'Chờ xử lý' },
                              { value: 'Hoàn thành', label: 'Hoàn thành' },
                              { value: 'Quá hạn', label: 'Quá hạn' },
                              { value: 'Hủy', label: 'Hủy' }
                            ]}
                          />
                        )
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); handleOpenDetail('task', record.id); }}>Chi tiết</Button>
                            <Button size="small" type="link" danger onClick={(e) => { e.stopPropagation(); handleDeleteTask(record.id); }}>Xóa</Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </Card>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 8: SCHEDULES */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'schedules' && (
                <Card
                  title="Lịch làm việc"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'schedule' })}>
                      Tạo lịch hẹn
                    </Button>
                  }
                  className="glass-panel"
                >
                  <Table
                    dataSource={schedules}
                    rowKey="id"
                    onRow={(record) => ({
                      onClick: () => handleOpenDetail('schedule', record.id),
                      style: { cursor: 'pointer' }
                    })}
                    columns={[
                      { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                      { title: 'Loại lịch', dataIndex: 'type', key: 'type', render: (t) => <Tag color="blue">{t}</Tag> },
                      { title: 'Thời gian', dataIndex: 'dateTime', key: 'dateTime', render: (val) => dayjs(val).format('HH:mm DD/MM/YYYY') },
                      {
                        title: 'Tham gia',
                        dataIndex: 'staffIds',
                        key: 'staffIds',
                        render: (ids: string[]) => ids.map(id => staff.find(s => s.id === id)?.name).join(', ')
                      },
                      { title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); handleOpenDetail('schedule', record.id); }}>Chi tiết</Button>
                            <Button size="small" type="link" danger onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(record.id); }}>Xóa</Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </Card>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 9: CHAT */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'chat' && (
                <Row gutter={[16, 16]} className="h-[calc(100vh-160px)]">
                  <Col xs={24} md={6}>
                    <Card title="Kênh trao đổi" className="glass-panel h-full overflow-y-auto">
                      <Menu
                        mode="vertical"
                        onClick={(e) => {
                          const [type, id] = e.key.split('|');
                          let name = '';
                          if (type === 'all') name = 'Toàn công ty';
                          if (type === 'department') name = departments.find(d => d.id === id)?.name || id;
                          if (type === 'profile') name = profiles.find(p => p.id === id)?.title || id;
                          if (type === 'lawsuit') name = lawsuits.find(l => l.id === id)?.title || id;
                          setChatChannel({ type, id, name });
                        }}
                        selectedKeys={chatChannel ? [`${chatChannel.type}|${chatChannel.id}`] : []}
                        items={[
                          { key: 'all|company', label: '📢 Toàn công ty' },
                          ...departments.map(d => ({ key: `department|${d.id}`, label: `🏢 Phòng ${d.name}` })),
                          ...profiles.map(p => ({ key: `profile|${p.id}`, label: `📁 HS: ${p.title.substring(0, 15)}...` })),
                          ...lawsuits.map(l => ({ key: `lawsuit|${l.id}`, label: `⚖️ VA: ${l.title.substring(0, 15)}...` }))
                        ]}
                      />
                    </Card>
                  </Col>

                  <Col xs={24} md={18} className="h-full">
                    {chatChannel ? (
                      <Card
                        title={`Kênh: ${chatChannel.name}`}
                        className="glass-panel h-full flex flex-col justify-between"
                        styles={{ body: { height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' } }}
                      >
                        {/* Messages Box */}
                        <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2 bg-[hsla(0,0%,50%,0.03)] rounded-lg">
                          {chatMessages.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">Bắt đầu cuộc trao đổi nội bộ</div>
                          ) : (
                            chatMessages.map((msg: any) => {
                              const isMe = msg.senderId === currentUser.id;
                              return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className="flex items-center gap-2">
                                    <Avatar size="small">{(msg.senderName || 'U')[0]}</Avatar>
                                    <Text strong className="text-xs">{msg.senderName || 'Người dùng'}</Text>
                                    <Text type="secondary" className="text-[10px]">{dayjs(msg.createdAt).format('HH:mm')}</Text>
                                  </div>
                                  <div
                                    className={`mt-1 p-3 rounded-lg max-w-[70%] ${
                                      isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[hsl(var(--background))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-tl-none'
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Input Box */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nhập nội dung trao đổi..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onPressEnter={handleSendChatMessage}
                          />
                          <Button type="primary" icon={<SendOutlined />} onClick={handleSendChatMessage}>
                            Gửi
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <Card className="glass-panel h-full flex items-center justify-center">
                        <Text type="secondary">Hãy chọn một kênh ở bên trái để trao đổi nội bộ</Text>
                      </Card>
                    )}
                  </Col>
                </Row>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 10: DOCUMENTS */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'documents' && (
                <Card
                  title="Kho tài liệu / Văn bản hồ sơ"
                  extra={
                    <Button type="primary" icon={<PaperClipOutlined />} onClick={() => setCreateModal({ visible: true, type: 'document' })}>
                      Tải tài liệu lên
                    </Button>
                  }
                  className="glass-panel"
                >
                  <Table
                    dataSource={documents}
                    rowKey="id"
                    columns={[
                      { title: 'Tên tài liệu', dataIndex: 'name', key: 'name' },
                      { title: 'Định dạng', dataIndex: 'fileType', key: 'fileType', render: (t) => <Tag color="blue">{t.toUpperCase()}</Tag> },
                      { title: 'Kích thước', dataIndex: 'fileSize', key: 'fileSize' },
                      { title: 'Người tải', dataIndex: 'uploadedBy', key: 'uploadedBy', render: (id) => staff.find(s => s.id === id)?.name || id },
                      { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
                      {
                        title: 'Liên kết',
                        key: 'link',
                        render: (_, record) => {
                          if (record.profileId) return <Tag color="orange">Hồ sơ: {record.profileId}</Tag>;
                          if (record.lawsuitId) return <Tag color="purple">Vụ án: {record.lawsuitId}</Tag>;
                          return <Tag>Khách hàng</Tag>;
                        }
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_, record) => (
                          <Button type="link" href="#" onClick={(e) => { e.preventDefault(); messageApi.success(`Tải xuống: ${record.name}`); }}>
                            Tải xuống
                          </Button>
                        )
                      }
                    ]}
                  />
                </Card>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 11: FINANCE */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'finance' && (
                <div className="space-y-6">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card
                        title="Doanh thu (Khoản thu)"
                        extra={<Button type="primary" onClick={() => setCreateModal({ visible: true, type: 'revenue' })}>Ghi nhận thu</Button>}
                        className="glass-panel"
                      >
                        <Table
                          dataSource={revenues}
                          rowKey="id"
                          columns={[
                            { title: 'Mã thu', dataIndex: 'id', key: 'id' },
                            { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (id) => customers.find(c => c.id === id)?.name || id },
                            { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v) => `${v.toLocaleString()}đ` },
                            { title: 'Ngày thu', dataIndex: 'date', key: 'date' },
                            { title: 'Phương thức', dataIndex: 'paymentMethod', key: 'paymentMethod' }
                          ]}
                        />
                      </Card>
                    </Col>

                    <Col xs={24} md={12}>
                      <Card
                        title="Chi phí (Khoản chi)"
                        extra={<Button type="primary" onClick={() => setCreateModal({ visible: true, type: 'expense' })}>Ghi nhận chi</Button>}
                        className="glass-panel"
                      >
                        <Table
                          dataSource={expenses}
                          rowKey="id"
                          columns={[
                            { title: 'Mã chi', dataIndex: 'id', key: 'id' },
                            { title: 'Nội dung chi', dataIndex: 'content', key: 'content' },
                            { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v) => `${v.toLocaleString()}đ` },
                            { title: 'Ngày chi', dataIndex: 'date', key: 'date' },
                            { title: 'Người chi', dataIndex: 'spenderId', key: 'spenderId', render: (id) => staff.find(s => s.id === id)?.name || id }
                          ]}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Card title="Theo dõi Công nợ khách hàng" className="glass-panel">
                    <Table
                      dataSource={debts}
                      rowKey="id"
                      columns={[
                        { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (id) => customers.find(c => c.id === id)?.name || id },
                        { title: 'Hồ sơ / Vụ án', key: 'project', render: (_, record) => record.profileId ? `Hồ sơ: ${record.profileId}` : record.lawsuitId ? `Vụ án: ${record.lawsuitId}` : 'Khác' },
                        { title: 'Tổng giá trị', dataIndex: 'totalAmount', key: 'totalAmount', render: (v) => `${v.toLocaleString()}đ` },
                        { title: 'Đã thanh toán', dataIndex: 'paidAmount', key: 'paidAmount', render: (v) => `${v.toLocaleString()}đ` },
                        { title: 'Còn phải thu', dataIndex: 'remainAmount', key: 'remainAmount', render: (v) => <Text type="danger" strong>{v.toLocaleString()}đ</Text> },
                        { title: 'Hạn thanh toán', dataIndex: 'deadline', key: 'deadline' },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          key: 'status',
                          render: (s) => <Tag color={s === 'Đã thanh toán' ? 'green' : s === 'Quá hạn' ? 'red' : 'orange'}>{s}</Tag>
                        }
                      ]}
                    />
                  </Card>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 12: CONTRACTS */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'contracts' && (
                <Card
                  title="Hợp đồng dịch vụ / Thỏa thuận pháp lý"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'contract' })}>
                      Tạo hợp đồng
                    </Button>
                  }
                  className="glass-panel"
                >
                  <Table
                    dataSource={contracts}
                    rowKey="id"
                    onRow={(record) => ({
                      onClick: () => handleOpenDetail('contract', record.id),
                      style: { cursor: 'pointer' }
                    })}
                    columns={[
                      { title: 'Mã HĐ', dataIndex: 'id', key: 'id' },
                      { title: 'Tên hợp đồng', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                      { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (id) => customers.find(c => c.id === id)?.name || id },
                      { title: 'Giá trị hợp đồng', dataIndex: 'value', key: 'value', render: (v) => `${v.toLocaleString()}đ` },
                      { title: 'Ngày ký', dataIndex: 'signDate', key: 'signDate' },
                      { title: 'Ngày hết hạn', dataIndex: 'expireDate', key: 'expireDate' },
                      { title: 'Quản lý', dataIndex: 'managerId', key: 'managerId', render: (id) => staff.find(s => s.id === id)?.name || id },
                      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Đang hiệu lực' ? 'green' : 'orange'}>{s}</Tag> },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); handleOpenDetail('contract', record.id); }}>Chi tiết</Button>
                            <Button size="small" type="link" danger onClick={(e) => { e.stopPropagation(); handleDeleteContract(record.id); }}>Xóa</Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </Card>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 13: SETTINGS (Chấm công & Nghỉ phép ở đây) */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'settings' && (
                <div className="space-y-6">
                  <Tabs
                    type="card"
                    items={[
                      {
                        key: 'timekeeping',
                        label: 'Chấm công',
                        children: (
                          <Card
                            title="Bảng chấm công hàng ngày"
                            extra={<Button type="primary" onClick={() => setCreateModal({ visible: true, type: 'timekeeping' })}>Điểm danh</Button>}
                          >
                            <Table
                              dataSource={timekeeping}
                              rowKey="id"
                              columns={[
                                { title: 'Nhân viên', dataIndex: 'staffId', key: 'staffId', render: (id) => staff.find(s => s.id === id)?.name || id },
                                { title: 'Ngày', dataIndex: 'date', key: 'date' },
                                { title: 'Giờ vào', dataIndex: 'checkIn', key: 'checkIn' },
                                { title: 'Giờ ra', dataIndex: 'checkOut', key: 'checkOut', render: (v) => v || 'Chưa ra' },
                                { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color="green">{s}</Tag> }
                              ]}
                            />
                          </Card>
                        )
                      },
                      {
                        key: 'leave',
                        label: 'Nghỉ phép',
                        children: (
                          <Card
                            title="Đơn xin nghỉ phép"
                            extra={<Button type="primary" onClick={() => setCreateModal({ visible: true, type: 'leave' })}>Tạo đơn nghỉ phép</Button>}
                          >
                            <Table
                              dataSource={leaveRequests}
                              rowKey="id"
                              columns={[
                                { title: 'Nhân viên', dataIndex: 'staffId', key: 'staffId', render: (id) => staff.find(s => s.id === id)?.name || id },
                                { title: 'Từ ngày', dataIndex: 'fromDate', key: 'fromDate' },
                                { title: 'Đến ngày', dataIndex: 'toDate', key: 'toDate' },
                                { title: 'Lý do nghỉ', dataIndex: 'reason', key: 'reason' },
                                { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Đã duyệt' ? 'green' : s === 'Từ chối' ? 'red' : 'orange'}>{s}</Tag> },
                                {
                                  title: 'Thao tác (Chỉ Trưởng phòng/Giám đốc)',
                                  key: 'action',
                                  render: (_, record) => {
                                    if (currentUser.role !== 'Giám đốc' && currentUser.role !== 'Trưởng phòng') return null;
                                    if (record.status !== 'Chờ duyệt') return null;
                                    return (
                                      <Space>
                                        <Button size="small" type="primary" onClick={() => handleUpdateLeaveStatus(record.id, 'Đã duyệt')}>Duyệt</Button>
                                        <Button size="small" danger onClick={() => handleUpdateLeaveStatus(record.id, 'Từ chối')}>Từ chối</Button>
                                      </Space>
                                    );
                                  }
                                }
                              ]}
                            />
                          </Card>
                        )
                      },
                      {
                        key: 'logs',
                        label: 'Nhật ký hoạt động',
                        children: (
                          <Card title="Lịch sử hệ thống">
                            <Table
                              dataSource={logs}
                              rowKey="id"
                              columns={[
                                { title: 'Thời gian', dataIndex: 'timestamp', key: 'timestamp', render: (v) => dayjs(v).format('HH:mm:ss DD/MM/YYYY') },
                                { title: 'Nhân sự thực hiện', dataIndex: 'staffName', key: 'staffName' },
                                { title: 'Hành động', dataIndex: 'action', key: 'action', render: (a) => <Tag color="blue">{a}</Tag> },
                                { title: 'Đối tượng đích', dataIndex: 'target', key: 'target' }
                              ]}
                            />
                          </Card>
                        )
                      }
                    ]}
                  />
                </div>
              )}
            </Content>
          </Layout>
        </Layout>

        {/* ---------------------------------------------------- */}
        {/* MODAL: CHI TIẾT ĐỐI TƯỢNG */}
        {/* ---------------------------------------------------- */}
        <Modal
          title={`Chỉnh sửa ${detailModal.type === 'customer' ? 'Khách hàng' : detailModal.type === 'profile' ? 'Hồ sơ' : detailModal.type === 'lawsuit' ? 'Vụ án' : detailModal.type === 'staff' ? 'Nhân viên' : detailModal.type === 'task' ? 'Công việc' : detailModal.type === 'schedule' ? 'Lịch hẹn' : detailModal.type === 'contract' ? 'Hợp đồng' : 'Phòng ban'}`}
          open={detailModal.visible}
          onCancel={() => { setDetailModal({ visible: false, type: 'customer', data: null }); editForm.resetFields(); }}
          footer={[
            <Button key="cancel" onClick={() => { setDetailModal({ visible: false, type: 'customer', data: null }); editForm.resetFields(); }}>Đóng</Button>,
            <Button key="save" type="primary" onClick={() => editForm.submit()}>Lưu thay đổi</Button>
          ]}
          width={isMobile ? '95%' : 800}
          style={{ top: isMobile ? 16 : undefined }}
        >
          {detailModal.data && (
            <div className="space-y-6">
              {detailModal.type === 'customer' && (
                <div>
                  <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateCustomer}
                    initialValues={{
                      name: detailModal.data.name,
                      phone: detailModal.data.phone,
                      email: detailModal.data.email,
                      cccd: detailModal.data.cccd,
                      type: detailModal.data.type,
                      address: detailModal.data.address,
                      notes: detailModal.data.notes
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã khách hàng">
                          <Input value={detailModal.data.id} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="cccd" label="Số CCCD" rules={[{ required: true, message: 'Nhập CCCD' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="type" label="Loại khách">
                          <Select options={[{ value: 'Cá nhân', label: 'Cá nhân' }, { value: 'Doanh nghiệp', label: 'Doanh nghiệp' }]} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="address" label="Địa chỉ">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="notes" label="Ghi chú">
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>

                  <Divider />
                  <Title level={5}>Hồ sơ dịch vụ & Vụ án liên kết</Title>
                  <div className="space-y-2">
                    {[...(detailModal.data.profiles || []), ...(detailModal.data.lawsuits || [])].length === 0 ? (
                      <div className="text-center text-gray-400 py-3 text-sm">Không có dữ liệu liên kết</div>
                    ) : (
                      [...(detailModal.data.profiles || []), ...(detailModal.data.lawsuits || [])].map((item: any) => (
                        <div key={item.id} className="p-2.5 rounded border border-[var(--border)] bg-[hsla(0,0%,50%,0.01)] flex items-center justify-between">
                          <Space>
                            <Tag color={item.id.startsWith('HS') ? 'orange' : 'purple'}>
                              {item.id.startsWith('HS') ? 'Hồ sơ' : 'Vụ án'}
                            </Tag>
                            <Text strong>{item.title}</Text>
                          </Space>
                          <Tag>{item.status}</Tag>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {detailModal.type === 'staff' && (
                <div>
                  <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateStaff}
                    initialValues={{
                      name: detailModal.data.name,
                      role: detailModal.data.role,
                      departmentId: detailModal.data.departmentId,
                      phone: detailModal.data.phone,
                      email: detailModal.data.email,
                      status: detailModal.data.status
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã nhân viên">
                          <Input value={detailModal.data.id} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="role" label="Chức vụ" rules={[{ required: true, message: 'Chọn chức vụ' }]}>
                          <Select options={[{ value: 'Giám đốc', label: 'Giám đốc' }, { value: 'Trưởng phòng', label: 'Trưởng phòng' }, { value: 'Luật sư', label: 'Luật sư' }, { value: 'Nhân viên', label: 'Nhân viên' }]} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="departmentId" label="Phòng ban" rules={[{ required: true, message: 'Chọn phòng ban' }]}>
                          <Select options={departments.map(d => ({ value: d.id, label: d.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="status" label="Trạng thái">
                          <Select options={[{ value: 'Đang làm việc', label: 'Đang làm việc' }, { value: 'Nghỉ việc', label: 'Nghỉ việc' }]} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}

              {detailModal.type === 'profile' && (
                <div>
                  <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                    initialValues={{
                      title: detailModal.data.title,
                      customerId: detailModal.data.customerId,
                      managerId: detailModal.data.managerId,
                      serviceType: detailModal.data.serviceType,
                      deadline: detailModal.data.deadline,
                      price: detailModal.data.price,
                      status: detailModal.data.status
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã hồ sơ">
                          <Input value={detailModal.data.id} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="title" label="Tên hồ sơ" rules={[{ required: true, message: 'Nhập tên hồ sơ' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Chọn khách hàng' }]}>
                          <Select options={customers.map(c => ({ value: c.id, label: c.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="managerId" label="Người phụ trách" rules={[{ required: true, message: 'Chọn người phụ trách' }]}>
                          <Select options={staff.map(s => ({ value: s.id, label: s.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="serviceType" label="Loại dịch vụ" rules={[{ required: true, message: 'Chọn loại dịch vụ' }]}>
                          <Select options={[{ value: 'Tư vấn', label: 'Tư vấn' }, { value: 'Đại diện', label: 'Đại diện' }, { value: 'Soạn thảo', label: 'Soạn thảo' }, { value: 'Tranh tụng', label: 'Tranh tụng' }]} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="deadline" label="Hạn xử lý">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="price" label="Phí dịch vụ">
                          <InputNumber className="w-full" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v!.replace(/,/g, '') as unknown as number} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="status" label="Trạng thái">
                          <Select options={[{ value: 'Đang xử lý', label: 'Đang xử lý' }, { value: 'Chờ bổ sung', label: 'Chờ bổ sung' }, { value: 'Hoàn thành', label: 'Hoàn thành' }, { value: 'Đóng hồ sơ', label: 'Đóng hồ sơ' }]} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>

                  <Divider />
                  <Title level={5}>Công việc trong hồ sơ</Title>
                  <div className="space-y-2">
                    {(detailModal.data.tasks || []).length === 0 ? (
                      <div className="text-center text-gray-400 py-3 text-sm">Không có công việc</div>
                    ) : (
                      (detailModal.data.tasks || []).map((item: any) => (
                        <div key={item.id} className="p-2.5 rounded border border-[var(--border)] bg-[hsla(0,0%,50%,0.01)] flex justify-between items-center">
                          <Text>{item.title}</Text>
                          <Space>
                            <Tag color={item.status === 'Hoàn thành' ? 'green' : 'orange'}>{item.status}</Tag>
                            <Text type="secondary" className="text-xs">Deadline: {item.deadline}</Text>
                          </Space>
                        </div>
                      ))
                    )}
                  </div>

                  <Divider />
                  <Title level={5}>Tài liệu đính kèm</Title>
                  <div className="space-y-2">
                    {(detailModal.data.documents || []).length === 0 ? (
                      <div className="text-center text-gray-400 py-3 text-sm">Không có tài liệu đính kèm</div>
                    ) : (
                      (detailModal.data.documents || []).map((item: any) => (
                        <div key={item.id} className="p-2.5 rounded border border-[var(--border)] bg-[hsla(0,0%,50%,0.01)] flex items-center">
                          <Space>
                            📄 <Text>{item.name}</Text>
                            <Text type="secondary" className="text-xs">({item.fileSize})</Text>
                          </Space>
                        </div>
                      ))
                    )}
                  </div>

                  <Divider />
                  <div className="flex justify-between items-center">
                    <Title level={5} style={{ margin: 0 }}>Công nợ phải thu</Title>
                    {detailModal.data.debt ? (
                      <Space>
                        <Text>Tổng: <strong className="text-blue-600">{detailModal.data.debt.totalAmount?.toLocaleString()}đ</strong></Text>
                        <Text>Đã thu: <strong className="text-green-600">{detailModal.data.debt.paidAmount?.toLocaleString()}đ</strong></Text>
                        <Text>Còn nợ: <strong className="text-red-500">{detailModal.data.debt.remainAmount?.toLocaleString()}đ</strong></Text>
                      </Space>
                    ) : (
                      <Text type="secondary">Không tìm thấy thông tin công nợ</Text>
                    )}
                  </div>
                </div>
              )}

              {detailModal.type === 'lawsuit' && (
                <div>
                  <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateLawsuit}
                    initialValues={{
                      title: detailModal.data.title,
                      customerId: detailModal.data.customerId,
                      lawyerId: detailModal.data.lawyerId,
                      supportId: detailModal.data.supportId,
                      court: detailModal.data.court,
                      caseNumber: detailModal.data.caseNumber,
                      status: detailModal.data.status
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã vụ án">
                          <Input value={detailModal.data.id} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="title" label="Tên vụ án" rules={[{ required: true, message: 'Nhập tên vụ án' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Chọn khách hàng' }]}>
                          <Select options={customers.map(c => ({ value: c.id, label: c.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="lawyerId" label="Luật sư phụ trách" rules={[{ required: true, message: 'Chọn luật sư' }]}>
                          <Select options={staff.filter(s => s.role === 'Luật sư').map(s => ({ value: s.id, label: s.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="supportId" label="Nhân viên hỗ trợ">
                          <Select allowClear options={staff.map(s => ({ value: s.id, label: s.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="court" label="Cơ quan giải quyết">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="caseNumber" label="Số hiệu vụ án">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="status" label="Trạng thái">
                          <Select options={[{ value: 'Đang xử lý', label: 'Đang xử lý' }, { value: 'Tạm đình chỉ', label: 'Tạm đình chỉ' }, { value: 'Hoàn thành', label: 'Hoàn thành' }, { value: 'Đóng hồ sơ', label: 'Đóng hồ sơ' }]} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>

                  <Divider />
                  <Title level={5}>Lịch làm việc / Lịch tòa</Title>
                  <div className="space-y-2">
                    {(detailModal.data.schedules || []).length === 0 ? (
                      <div className="text-center text-gray-400 py-3 text-sm">Không có lịch làm việc</div>
                    ) : (
                      (detailModal.data.schedules || []).map((item: any) => (
                        <div key={item.id} className="p-2.5 rounded border border-[var(--border)] bg-[hsla(0,0%,50%,0.01)] flex items-center">
                          <Space>
                            ⏰ <Text strong>{dayjs(item.dateTime).format('HH:mm DD/MM/YYYY')}</Text>
                            <Text>{item.title}</Text>
                          </Space>
                        </div>
                      ))
                    )}
                  </div>

                  <Divider />
                  <Title level={5}>Công việc trong vụ án</Title>
                  <div className="space-y-2">
                    {(detailModal.data.tasks || []).length === 0 ? (
                      <div className="text-center text-gray-400 py-3 text-sm">Không có công việc</div>
                    ) : (
                      (detailModal.data.tasks || []).map((item: any) => (
                        <div key={item.id} className="p-2.5 rounded border border-[var(--border)] bg-[hsla(0,0%,50%,0.01)] flex justify-between items-center">
                          <Text>{item.title}</Text>
                          <Space>
                            <Tag color={item.status === 'Hoàn thành' ? 'green' : 'orange'}>{item.status}</Tag>
                            <Text type="secondary" className="text-xs">Deadline: {item.deadline}</Text>
                          </Space>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {detailModal.type === 'task' && (
                <div>
                  <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateTask}
                    initialValues={{
                      title: detailModal.data.title,
                      assigneeId: detailModal.data.assigneeId,
                      departmentId: detailModal.data.departmentId,
                      deadline: detailModal.data.deadline,
                      priority: detailModal.data.priority,
                      status: detailModal.data.status,
                      description: detailModal.data.description
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã công việc">
                          <Input value={detailModal.data.id} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="title" label="Tên công việc" rules={[{ required: true, message: 'Nhập tên công việc' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="assigneeId" label="Người thực hiện" rules={[{ required: true, message: 'Chọn người thực hiện' }]}>
                          <Select options={staff.map(s => ({ value: s.id, label: s.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="departmentId" label="Phòng ban">
                          <Select allowClear options={departments.map(d => ({ value: d.id, label: d.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="deadline" label="Hạn chót">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="priority" label="Mức ưu tiên">
                          <Select options={[{ value: 'Thấp', label: 'Thấp' }, { value: 'Trung bình', label: 'Trung bình' }, { value: 'Cao', label: 'Cao' }, { value: 'Khẩn cấp', label: 'Khẩn cấp' }]} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="status" label="Trạng thái">
                          <Select options={[{ value: 'Chưa bắt đầu', label: 'Chưa bắt đầu' }, { value: 'Đang thực hiện', label: 'Đang thực hiện' }, { value: 'Chờ xử lý', label: 'Chờ xử lý' }, { value: 'Hoàn thành', label: 'Hoàn thành' }, { value: 'Hủy', label: 'Hủy' }]} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="description" label="Mô tả">
                          <Input.TextArea rows={3} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}

              {detailModal.type === 'schedule' && (
                <div>
                  <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateSchedule}
                    initialValues={{
                      title: detailModal.data.title,
                      type: detailModal.data.type,
                      dateTime: detailModal.data.dateTime,
                      staffIds: detailModal.data.staffIds,
                      customerId: detailModal.data.customerId,
                      notes: detailModal.data.notes
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã lịch hẹn">
                          <Input value={detailModal.data.id} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="type" label="Loại lịch">
                          <Select options={[{ value: 'Họp khách hàng', label: 'Họp khách hàng' }, { value: 'Tòa án', label: 'Tòa án' }, { value: 'Họp nội bộ', label: 'Họp nội bộ' }, { value: 'Khác', label: 'Khác' }]} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="dateTime" label="Thời gian">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="staffIds" label="Tham gia">
                          <Select mode="multiple" options={staff.map(s => ({ value: s.id, label: s.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="customerId" label="Khách hàng">
                          <Select allowClear options={customers.map(c => ({ value: c.id, label: c.name }))} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="notes" label="Ghi chú">
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}

              {detailModal.type === 'contract' && (
                <div>
                  <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateContract}
                    initialValues={{
                      title: detailModal.data.title,
                      customerId: detailModal.data.customerId,
                      value: detailModal.data.value,
                      signDate: detailModal.data.signDate,
                      expireDate: detailModal.data.expireDate,
                      managerId: detailModal.data.managerId,
                      status: detailModal.data.status,
                      content: detailModal.data.content
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã hợp đồng">
                          <Input value={detailModal.data.id} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="title" label="Tên hợp đồng" rules={[{ required: true, message: 'Nhập tên hợp đồng' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Chọn khách hàng' }]}>
                          <Select options={customers.map(c => ({ value: c.id, label: c.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="managerId" label="Quản lý" rules={[{ required: true, message: 'Chọn quản lý' }]}>
                          <Select options={staff.map(s => ({ value: s.id, label: s.name }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="value" label="Giá trị hợp đồng">
                          <InputNumber className="w-full" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v!.replace(/,/g, '') as unknown as number} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="signDate" label="Ngày ký">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="expireDate" label="Ngày hết hạn">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="status" label="Trạng thái">
                          <Select options={[{ value: 'Đang hiệu lực', label: 'Đang hiệu lực' }, { value: 'Hết hiệu lực', label: 'Hết hiệu lực' }, { value: 'Chờ phê duyệt', label: 'Chờ phê duyệt' }, { value: 'Đã chấm dứt', label: 'Đã chấm dứt' }]} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="content" label="Nội dung">
                          <Input.TextArea rows={3} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}

              {detailModal.type === 'department' && (
                <div>
                  <Title level={5}>{detailModal.data.name}</Title>
                  <Text type="secondary" className="block mb-4">{detailModal.data.description}</Text>
                  
                  <Tabs
                    type="line"
                    items={[
                      {
                        key: 'staff',
                        label: `Nhân sự (${detailModal.data.staff?.length || 0})`,
                        children: (
                          <div className="space-y-2">
                            {(detailModal.data.staff || []).length === 0 ? (
                              <div className="text-center text-gray-400 py-3 text-sm">Không có nhân sự</div>
                            ) : (
                              (detailModal.data.staff || []).map((item: any) => (
                                <div key={item.id} className="p-2.5 rounded border border-[var(--border)] bg-[hsla(0,0%,50%,0.01)] flex items-center">
                                  <Space>
                                    <Avatar>{item.name[0]}</Avatar>
                                    <Text strong>{item.name}</Text>
                                    <Tag color="blue">{item.role}</Tag>
                                  </Space>
                                </div>
                              ))
                            )}
                          </div>
                        )
                      },
                      {
                        key: 'tasks',
                        label: `Công việc (${detailModal.data.tasks?.length || 0})`,
                        children: (
                          <div className="space-y-2">
                            {(detailModal.data.tasks || []).length === 0 ? (
                              <div className="text-center text-gray-400 py-3 text-sm">Không có công việc</div>
                            ) : (
                              (detailModal.data.tasks || []).map((item: any) => (
                                <div key={item.id} className="p-2.5 rounded border border-[var(--border)] bg-[hsla(0,0%,50%,0.01)] flex justify-between items-center">
                                  <Text>{item.title}</Text>
                                  <Tag color={item.status === 'Hoàn thành' ? 'green' : 'orange'}>{item.status}</Tag>
                                </div>
                              ))
                            )}
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* ---------------------------------------------------- */}
        {/* MODAL: TẠO MỚI ĐỐI TƯỢNG */}
        {/* ---------------------------------------------------- */}
        <Modal
          title={`Tạo mới ${createModal.type === 'customer' ? 'Khách hàng' : createModal.type === 'profile' ? 'Hồ sơ' : createModal.type === 'lawsuit' ? 'Vụ án' : createModal.type === 'task' ? 'Công việc' : createModal.type === 'schedule' ? 'Lịch hẹn' : createModal.type === 'revenue' ? 'Doanh thu' : createModal.type === 'expense' ? 'Chi phí' : createModal.type === 'contract' ? 'Hợp đồng' : createModal.type === 'leave' ? 'Đơn nghỉ phép' : createModal.type === 'staff' ? 'Nhân viên' : 'Chấm công'}`}
          open={createModal.visible}
          onCancel={() => { setCreateModal({ visible: false, type: '' }); form.resetFields(); }}
          onOk={() => form.submit()}
          width={isMobile ? '95%' : 600}
          style={{ top: isMobile ? 16 : undefined }}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateSubmit}>
            {createModal.type === 'customer' && (
              <>
                <Form.Item name="name" label="Họ tên khách hàng" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                  <Input placeholder="0987654321" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                  <Input placeholder="nva@gmail.com" />
                </Form.Item>
                <Form.Item name="cccd" label="Số CCCD" rules={[{ required: true, message: 'Nhập số CCCD' }]}>
                  <Input placeholder="012345678912" />
                </Form.Item>
                <Form.Item name="address" label="Địa chỉ">
                  <Input placeholder="123 Đường Láng, Hà Nội" />
                </Form.Item>
                <Form.Item name="type" label="Phân loại" initialValue="Cá nhân">
                  <Select options={[{ value: 'Cá nhân', label: 'Cá nhân' }, { value: 'Doanh nghiệp', label: 'Doanh nghiệp' }]} />
                </Form.Item>
                <Form.Item name="notes" label="Ghi chú">
                  <Input.TextArea placeholder="Ghi chú thông tin..." />
                </Form.Item>
              </>
            )}

            {createModal.type === 'profile' && (
              <>
                <Form.Item name="title" label="Tiêu đề hồ sơ" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                  <Input placeholder="Hồ sơ xin cấp sổ đỏ Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Chọn khách hàng' }]}>
                  <Select options={customers.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
                <Form.Item name="serviceType" label="Loại dịch vụ" rules={[{ required: true }]}>
                  <Select options={[{ value: 'Đất đai', label: 'Đất đai' }, { value: 'Sổ đỏ', label: 'Sổ đỏ' }, { value: 'Khai sinh', label: 'Khai sinh' }, { value: 'Giấy phép', label: 'Giấy phép' }]} />
                </Form.Item>
                <Form.Item name="managerId" label="Người phụ trách" rules={[{ required: true }]}>
                  <Select options={staff.filter(s => s.departmentId === 'dich-vu').map(s => ({ value: s.id, label: s.name }))} />
                </Form.Item>
                <Form.Item name="deadline" label="Hạn xử lý" rules={[{ required: true }]}>
                  <DatePicker className="w-full" />
                </Form.Item>
                <Form.Item name="price" label="Giá trị dịch vụ (VND)" rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') as any} parser={(v) => (v ? v.replace(/\$\s?|(,*)/g, '') : '') as any} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái ban đầu" initialValue="Mới tiếp nhận">
                  <Select options={[{ value: 'Mới tiếp nhận', label: 'Mới tiếp nhận' }, { value: 'Đang xử lý', label: 'Đang xử lý' }]} />
                </Form.Item>
              </>
            )}

            {createModal.type === 'lawsuit' && (
              <>
                <Form.Item name="title" label="Tiêu đề vụ án" rules={[{ required: true }]}>
                  <Input placeholder="Vụ án tranh chấp hợp đồng Trần Văn B" />
                </Form.Item>
                <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true }]}>
                  <Select options={customers.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
                <Form.Item name="lawsuitType" label="Loại vụ án" rules={[{ required: true }]}>
                  <Select options={[{ value: 'Dân sự', label: 'Dân sự' }, { value: 'Hình sự', label: 'Hình sự' }, { value: 'Kinh doanh thương mại', label: 'Kinh doanh thương mại' }]} />
                </Form.Item>
                <Form.Item name="lawyerId" label="Luật sư phụ trách" rules={[{ required: true }]}>
                  <Select options={staff.filter(s => s.role === 'Luật sư' || s.departmentId === 'to-tung').map(s => ({ value: s.id, label: s.name }))} />
                </Form.Item>
                <Form.Item name="court" label="Cơ quan giải quyết" rules={[{ required: true }]}>
                  <Input placeholder="Tòa án nhân dân Quận 1" />
                </Form.Item>
                <Form.Item name="caseNumber" label="Số hiệu vụ án">
                  <Input placeholder="102/2026/DS-ST" />
                </Form.Item>
                <Form.Item name="price" label="Trị giá hợp đồng tố tụng" initialValue={30000000}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái ban đầu" initialValue="Mới tiếp nhận">
                  <Select options={[{ value: 'Mới tiếp nhận', label: 'Mới tiếp nhận' }, { value: 'Đang thụ lý', label: 'Đang thụ lý' }]} />
                </Form.Item>
              </>
            )}

            {createModal.type === 'task' && (
              <>
                <Form.Item name="title" label="Tên công việc" rules={[{ required: true }]}>
                  <Input placeholder="Kiểm tra hồ sơ đất đai" />
                </Form.Item>
                <Form.Item name="assigneeId" label="Người thực hiện" rules={[{ required: true }]}>
                  <Select options={staff.map(s => ({ value: s.id, label: s.name }))} />
                </Form.Item>
                <Form.Item name="departmentId" label="Phòng ban phụ trách" rules={[{ required: true }]}>
                  <Select options={departments.map(d => ({ value: d.id, label: d.name }))} />
                </Form.Item>
                <Form.Item name="customerId" label="Khách hàng liên quan">
                  <Select allowClear options={customers.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
                <Form.Item name="profileId" label="Hồ sơ dịch vụ liên kết">
                  <Select allowClear options={profiles.map(p => ({ value: p.id, label: p.title }))} />
                </Form.Item>
                <Form.Item name="lawsuitId" label="Vụ án liên kết">
                  <Select allowClear options={lawsuits.map(l => ({ value: l.id, label: l.title }))} />
                </Form.Item>
                <Form.Item name="deadline" label="Hạn chót" rules={[{ required: true }]}>
                  <DatePicker className="w-full" />
                </Form.Item>
                <Form.Item name="priority" label="Mức độ ưu tiên" initialValue="Trung bình">
                  <Select options={[{ value: 'Thấp', label: 'Thấp' }, { value: 'Trung bình', label: 'Trung bình' }, { value: 'Cao', label: 'Cao' }, { value: 'Khẩn cấp', label: 'Khẩn cấp' }]} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" initialValue="Chưa bắt đầu">
                  <Select options={[{ value: 'Chưa bắt đầu', label: 'Chưa bắt đầu' }, { value: 'Đang thực hiện', label: 'Đang thực hiện' }]} />
                </Form.Item>
                <Form.Item name="description" label="Chi tiết công việc">
                  <Input.TextArea />
                </Form.Item>
              </>
            )}

            {createModal.type === 'schedule' && (
              <>
                <Form.Item name="title" label="Tiêu đề lịch hẹn/Lịch làm việc" rules={[{ required: true }]}>
                  <Input placeholder="Hẹn khách hàng trao đổi hồ sơ" />
                </Form.Item>
                <Form.Item name="type" label="Loại lịch" rules={[{ required: true }]}>
                  <Select options={[{ value: 'Hẹn khách', label: 'Hẹn khách' }, { value: 'Họp nội bộ', label: 'Họp nội bộ' }, { value: 'Lịch tòa', label: 'Lịch tòa' }]} />
                </Form.Item>
                <Form.Item name="dateTime" label="Thời gian diễn ra" rules={[{ required: true }]}>
                  <DatePicker showTime className="w-full" />
                </Form.Item>
                <Form.Item name="staffIds" label="Nhân viên tham gia" rules={[{ required: true }]}>
                  <Select mode="multiple" options={staff.map(s => ({ value: s.id, label: s.name }))} />
                </Form.Item>
                <Form.Item name="customerId" label="Khách hàng liên kết">
                  <Select allowClear options={customers.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
                <Form.Item name="notes" label="Ghi chú thêm">
                  <Input.TextArea />
                </Form.Item>
              </>
            )}

            {createModal.type === 'revenue' && (
              <>
                <Form.Item name="customerId" label="Khách hàng thanh toán" rules={[{ required: true }]}>
                  <Select options={customers.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
                <Form.Item name="profileId" label="Hồ sơ dịch vụ liên kết">
                  <Select allowClear options={profiles.map(p => ({ value: p.id, label: p.title }))} />
                </Form.Item>
                <Form.Item name="lawsuitId" label="Vụ án liên kết">
                  <Select allowClear options={lawsuits.map(l => ({ value: l.id, label: l.title }))} />
                </Form.Item>
                <Form.Item name="amount" label="Số tiền thu (VND)" rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="paymentMethod" label="Phương thức thanh toán" initialValue="Chuyển khoản">
                  <Select options={[{ value: 'Tiền mặt', label: 'Tiền mặt' }, { value: 'Chuyển khoản', label: 'Chuyển khoản' }]} />
                </Form.Item>
                <Form.Item name="notes" label="Ghi chú">
                  <Input />
                </Form.Item>
              </>
            )}

            {createModal.type === 'expense' && (
              <>
                <Form.Item name="content" label="Nội dung chi phí" rules={[{ required: true }]}>
                  <Input placeholder="Chi phí đi lại làm việc cơ quan" />
                </Form.Item>
                <Form.Item name="amount" label="Số tiền chi (VND)" rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="departmentId" label="Phòng ban chi" rules={[{ required: true }]}>
                  <Select options={departments.map(d => ({ value: d.id, label: d.name }))} />
                </Form.Item>
                <Form.Item name="profileId" label="Hồ sơ liên quan">
                  <Select allowClear options={profiles.map(p => ({ value: p.id, label: p.title }))} />
                </Form.Item>
                <Form.Item name="lawsuitId" label="Vụ án liên quan">
                  <Select allowClear options={lawsuits.map(l => ({ value: l.id, label: l.title }))} />
                </Form.Item>
                <Form.Item name="notes" label="Ghi chú chi phí">
                  <Input />
                </Form.Item>
              </>
            )}

            {createModal.type === 'contract' && (
              <>
                <Form.Item name="title" label="Tên hợp đồng" rules={[{ required: true }]}>
                  <Input placeholder="Hợp đồng dịch vụ pháp lý cấp sổ đỏ" />
                </Form.Item>
                <Form.Item name="customerId" label="Khách hàng ký kết" rules={[{ required: true }]}>
                  <Select options={customers.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
                <Form.Item name="value" label="Giá trị hợp đồng (VND)" rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="signDate" label="Ngày ký" rules={[{ required: true }]}>
                  <DatePicker className="w-full" />
                </Form.Item>
                <Form.Item name="effectiveDate" label="Ngày hiệu lực" rules={[{ required: true }]}>
                  <DatePicker className="w-full" />
                </Form.Item>
                <Form.Item name="expireDate" label="Ngày hết hạn" rules={[{ required: true }]}>
                  <DatePicker className="w-full" />
                </Form.Item>
                <Form.Item name="managerId" label="Người quản lý hợp đồng" rules={[{ required: true }]}>
                  <Select options={staff.map(s => ({ value: s.id, label: s.name }))} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" initialValue="Đang hiệu lực">
                  <Select options={[{ value: 'Nháp', label: 'Nháp' }, { value: 'Chờ ký', label: 'Chờ ký' }, { value: 'Đang hiệu lực', label: 'Đang hiệu lực' }]} />
                </Form.Item>
              </>
            )}

            {createModal.type === 'leave' && (
              <>
                <Form.Item name="fromDate" label="Từ ngày" rules={[{ required: true }]}>
                  <DatePicker className="w-full" />
                </Form.Item>
                <Form.Item name="toDate" label="Đến ngày" rules={[{ required: true }]}>
                  <DatePicker className="w-full" />
                </Form.Item>
                <Form.Item name="reason" label="Lý do nghỉ phép" rules={[{ required: true }]}>
                  <Input.TextArea placeholder="Có việc gia đình..." />
                </Form.Item>
              </>
            )}

            {createModal.type === 'timekeeping' && (
              <>
                <Form.Item name="checkIn" label="Giờ vào" rules={[{ required: true }]} initialValue="08:00">
                  <Input placeholder="08:00" />
                </Form.Item>
                <Form.Item name="checkOut" label="Giờ ra (Nếu có)">
                  <Input placeholder="17:00" />
                </Form.Item>
              </>
            )}

            {createModal.type === 'staff' && (
              <>
                <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="role" label="Chức vụ" rules={[{ required: true, message: 'Chọn chức vụ' }]}>
                  <Select options={[{ value: 'Giám đốc', label: 'Giám đốc' }, { value: 'Trưởng phòng', label: 'Trưởng phòng' }, { value: 'Luật sư', label: 'Luật sư' }, { value: 'Nhân viên', label: 'Nhân viên' }]} />
                </Form.Item>
                <Form.Item name="departmentId" label="Phòng ban" rules={[{ required: true, message: 'Chọn phòng ban' }]}>
                  <Select options={departments.map(d => ({ value: d.id, label: d.name }))} />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                  <Input placeholder="0987654321" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                  <Input placeholder="nva@gmail.com" />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" initialValue="Đang làm việc">
                  <Select options={[{ value: 'Đang làm việc', label: 'Đang làm việc' }, { value: 'Nghỉ việc', label: 'Nghỉ việc' }]} />
                </Form.Item>
              </>
            )}

            {createModal.type === 'document' && (
              <>
                <Form.Item name="name" label="Tên tài liệu" rules={[{ required: true }]}>
                  <Input placeholder="Giấy chứng nhận quyền sử dụng đất.pdf" />
                </Form.Item>
                <Form.Item name="fileType" label="Định dạng file" initialValue="pdf">
                  <Select options={[{ value: 'pdf', label: 'PDF' }, { value: 'docx', label: 'DOCX' }, { value: 'xlsx', label: 'XLSX' }, { value: 'png', label: 'PNG' }]} />
                </Form.Item>
                <Form.Item name="fileSize" label="Dung lượng" initialValue="1.5 MB">
                  <Input />
                </Form.Item>
                <Form.Item name="customerId" label="Khách hàng liên quan">
                  <Select allowClear options={customers.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
                <Form.Item name="profileId" label="Hồ sơ liên quan">
                  <Select allowClear options={profiles.map(p => ({ value: p.id, label: p.title }))} />
                </Form.Item>
                <Form.Item name="lawsuitId" label="Vụ án liên quan">
                  <Select allowClear options={lawsuits.map(l => ({ value: l.id, label: l.title }))} />
                </Form.Item>
                <Form.Item name="uploadedBy" label="Người tải lên" rules={[{ required: true }]}>
                  <Select options={staff.map(s => ({ value: s.id, label: s.name }))} />
                </Form.Item>
                <Form.Item name="fileUrl" label="Đường dẫn file (Giả lập)" initialValue="/uploads/file.pdf">
                  <Input />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
    </>
  );
}
