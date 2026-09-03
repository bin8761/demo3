'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ConfigProvider,
  theme as antdTheme,
  Layout,
  Menu,
  Button,
  Card,
  Table as AntdTable,
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
  Switch,
  Radio,
  Calendar,
  Tooltip,
  TimePicker,
  Upload,
  Alert
} from 'antd';
import type { TableProps as AntdTableProps } from 'antd';
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
  MenuOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  PrinterOutlined,
  DownloadOutlined,
  LogoutOutlined,
  LockOutlined,
  MailOutlined,
  KeyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { snapCenterToCursor, restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  dashboardApi,
  customerApi,
  serviceProfileApi,
  lawsuitApi,
  taskApi,
  scheduleApi,
  chatApi,
  documentApi,
  folderApi,
  financeApi,
  contractApi,
  hrApi,
  logApi,
  authApi
} from '../api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface CustomTableProps<RecordType> {
  dataSource?: RecordType[];
  columns?: AntdTableProps<RecordType>['columns'];
  rowKey?: any;
  onRow?: (record: RecordType, index?: number) => any;
  pagination?: any;
  [key: string]: any;
}

// Custom Table component to handle responsive layout on mobile
function Table<RecordType extends object = any>({
  dataSource,
  columns,
  rowKey = 'id',
  onRow,
  pagination,
  ...rest
}: CustomTableProps<RecordType>) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return (
      <AntdTable
        dataSource={dataSource}
        columns={columns as any}
        rowKey={rowKey}
        onRow={onRow as any}
        pagination={pagination}
        {...rest}
      />
    );
  }

  const dataList = (dataSource || []) as any[];
  const colsList = (columns || []) as any[];

  return (
    <List
      dataSource={dataList}
      pagination={pagination ? ({ size: 'small', ...pagination } as any) : undefined}
      renderItem={(record: any, index: number) => {
        const actionCol = colsList.find((col: any) => col.key === 'action' || col.key === 'operations');
        const displayCols = colsList.filter((col: any) => col.key !== 'action' && col.key !== 'operations' && col.title);

        const titleCol = displayCols.find((col: any) => col.dataIndex === 'name' || col.dataIndex === 'title' || col.dataIndex === 'content') || displayCols[0];
        const otherCols = displayCols.filter((col: any) => col !== titleCol);

        const handleCardClick = () => {
          if (onRow) {
            const rowProps = onRow(record, index);
            if (rowProps && rowProps.onClick) {
              rowProps.onClick();
            }
          }
        };

        const renderTitle = () => {
          const val = titleCol?.dataIndex ? record[titleCol.dataIndex] : undefined;
          return titleCol?.render ? titleCol.render(val, record, index) : val || '';
        };

        const getRecordKey = () => {
          if (typeof rowKey === 'function') {
            return rowKey(record, index);
          }
          return record[rowKey as string] || index + 1;
        };

        return (
          <List.Item style={{ padding: '8px 0', borderBottom: 'none' }}>
            <Card
              className="w-full glass-panel shadow-sm hover:shadow-md transition-shadow"
              style={{ borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}
              styles={{ body: { padding: 16 } }}
              onClick={handleCardClick}
              hoverable
            >
              <div className="flex justify-between items-start border-b border-[var(--border)] pb-2 mb-3">
                <span className="font-bold text-sm text-blue-600 dark:text-blue-400 max-w-[80%] truncate">
                  {renderTitle()}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  #{getRecordKey()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {otherCols.map((col: any, colIdx: number) => {
                  const val = col.dataIndex ? record[col.dataIndex] : undefined;
                  const renderedVal = col.render ? col.render(val, record, index) : val;
                  return (
                    <div key={colIdx} className="flex justify-between items-start gap-2">
                      <span className="text-gray-400 font-medium whitespace-nowrap">{col.title}:</span>
                      <span className="text-right font-normal text-gray-600 dark:text-gray-300 truncate max-w-[70%]">
                        {renderedVal ?? '-'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {actionCol && (
                <div
                  className="flex justify-end gap-2 border-t border-[var(--border)] pt-2 mt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actionCol.render(null, record, index)}
                </div>
              )}
            </Card>
          </List.Item>
        );
      }}
    />
  );
}

// ─── Kanban: Sortable Card ────────────────────────────────────────────────────
interface TaskCardProps {
  task: any;
  staff: any[];
  onOpenDetail: (type: any, id: string) => void;
  isDragging?: boolean;
}

function TaskCard({ task, staff, onOpenDetail, isDragging = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    touchAction: 'none'
  };
  const assignee = staff.find((s: any) => s.id === task.assigneeId);
  const isOverdue = task.status !== 'Hoàn thành' && task.deadline < new Date().toISOString().split('T')[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpenDetail('task', task.id)}
      className="p-3 rounded-lg border border-[var(--glass-border)] bg-[hsl(var(--surface))] shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-blue-500/50 space-y-2 select-none"
    >
      <div className="font-semibold text-xs leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
        {task.title}
      </div>
      <div className="flex justify-between items-center">
        <Tag color={task.priority === 'Khẩn cấp' ? 'red' : task.priority === 'Cao' ? 'orange' : 'blue'} className="text-[10px] m-0">
          {task.priority}
        </Tag>
        {isOverdue && <Tag color="red" className="text-[10px] m-0">Quá hạn</Tag>}
      </div>
      <div className="flex justify-between items-center border-t border-[var(--border)] pt-2 text-[10px] text-gray-400">
        <Space size={4}>
          <Avatar size={18} style={{ backgroundColor: '#2563eb', fontSize: '9px' }}>
            {assignee ? assignee.name[0] : 'U'}
          </Avatar>
          <span>{assignee ? assignee.name : 'Chưa gán'}</span>
        </Space>
        <span className="font-mono">{dayjs(task.deadline).format('DD/MM')}</span>
      </div>
    </div>
  );
}

// ─── Kanban: Task Card Overlay (clone khi đang kéo) ──────────────────────────
function TaskCardOverlay({ task, staff }: { task: any; staff: any[] }) {
  const assignee = staff.find((s: any) => s.id === task.assigneeId);
  const isOverdue = task.status !== 'Hoàn thành' && task.deadline < new Date().toISOString().split('T')[0];
  return (
    <div className="p-3 rounded-lg border border-blue-500 bg-[hsl(var(--surface))] shadow-2xl space-y-2 select-none rotate-2" style={{ opacity: 0.95, touchAction: 'none' }}>
      <div className="font-semibold text-xs leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
        {task.title}
      </div>
      <div className="flex justify-between items-center">
        <Tag color={task.priority === 'Khẩn cấp' ? 'red' : task.priority === 'Cao' ? 'orange' : 'blue'} className="text-[10px] m-0">
          {task.priority}
        </Tag>
        {isOverdue && <Tag color="red" className="text-[10px] m-0">Quá hạn</Tag>}
      </div>
      <div className="flex justify-between items-center border-t border-[var(--border)] pt-2 text-[10px] text-gray-400">
        <Space size={4}>
          <Avatar size={18} style={{ backgroundColor: '#2563eb', fontSize: '9px' }}>
            {assignee ? assignee.name[0] : 'U'}
          </Avatar>
          <span>{assignee ? assignee.name : 'Chưa gán'}</span>
        </Space>
        <span className="font-mono">{dayjs(task.deadline).format('DD/MM')}</span>
      </div>
    </div>
  );
}

// ─── Kanban: Droppable Column ─────────────────────────────────────────────────
interface KanbanColumnProps {
  col: { key: string; title: string; color: string };
  colTasks: any[];
  staff: any[];
  onOpenDetail: (type: any, id: string) => void;
  activeTaskId: string | null;
  isOver: boolean;
}

function KanbanColumn({ col, colTasks, staff, onOpenDetail, activeTaskId, isOver }: KanbanColumnProps) {
  const badgeColor = col.color === 'blue' ? '#3b82f6' : col.color === 'orange' ? '#f97316' : col.color === 'purple' ? '#a855f7' : '#22c55e';

  // useDroppable đảm bảo cột rỗng vẫn là vùng thả hợp lệ
  const { setNodeRef: setDropRef, isOver: isDragOver } = useDroppable({ id: col.key });

  const isHighlighted = isOver || isDragOver;

  return (
    <div
      className="flex flex-col rounded-xl border transition-all duration-200"
      style={{
        background: isHighlighted ? 'rgba(37, 99, 235, 0.08)' : 'rgba(128, 128, 128, 0.03)',
        borderColor: isHighlighted ? 'var(--primary)' : 'var(--glass-border)',
        minWidth: '220px',
        flex: '1 1 0'
      }}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-[var(--border)] flex justify-between items-center">
        <Space>
          <Badge color={badgeColor} />
          <span className="font-bold text-xs">{col.title}</span>
          <Tag className="ml-1 text-[10px] py-0 px-1">{colTasks.length}</Tag>
        </Space>
      </div>

      {/* Tasks list — gắn ref droppable vào đây để cột rỗng vẫn nhận thẻ */}
      <div
        ref={setDropRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto"
        style={{ minHeight: '120px' }}
      >
        <SortableContext items={colTasks.map((t: any) => t.id)} strategy={rectSortingStrategy}>
          {colTasks.map((task: any) => (
            <TaskCard
              key={task.id}
              task={task}
              staff={staff}
              onOpenDetail={onOpenDetail}
              isDragging={activeTaskId === task.id}
            />
          ))}
        </SortableContext>
        {colTasks.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-full py-10 gap-2 rounded-lg border-2 border-dashed transition-all duration-200"
            style={{
              borderColor: isHighlighted ? 'var(--primary)' : 'transparent',
              background: isHighlighted ? 'rgba(37,99,235,0.04)' : 'transparent'
            }}
          >
            <span className="text-2xl">{isHighlighted ? '⬇️' : '➕'}</span>
            <span className="text-gray-400 text-xs">
              {isHighlighted ? 'Thả vào đây' : 'Chưa có việc'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Board (Main) ──────────────────────────────────────────────────────
interface TaskKanbanProps {
  tasks: any[];
  staff: any[];
  departments: any[];
  onOpenDetail: (type: any, id: string) => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

function TaskKanban({ tasks, staff, onOpenDetail, onUpdateStatus }: TaskKanbanProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColKey, setOverColKey] = useState<string | null>(null);

  const columns = [
    { key: 'Chưa bắt đầu', title: 'Chưa bắt đầu', color: 'blue' },
    { key: 'Đang thực hiện', title: 'Đang thực hiện', color: 'orange' },
    { key: 'Chờ xử lý', title: 'Chờ xử lý', color: 'purple' },
    { key: 'Hoàn thành', title: 'Hoàn thành', color: 'green' }
  ];

  // Hỗ trợ cả chuột (desktop) và cảm ứng (di động)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const getTaskColumnKey = (taskId: string) => {
    const task = tasks.find((t: any) => t.id === taskId);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (!over) return;
    // Nếu thả lên một column key trực tiếp
    const colKey = columns.find(c => c.key === String(over.id))?.key;
    if (colKey) {
      setOverColKey(colKey);
      return;
    }
    // Nếu thả lên một task trong cột khác
    const overTask = tasks.find((t: any) => t.id === String(over.id));
    if (overTask) setOverColKey(overTask.status);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);
    setOverColKey(null);
    if (!over) return;

    const taskId = String(active.id);
    const currentColKey = getTaskColumnKey(taskId);

    // Xác định cột đích: over có thể là column key hoặc task id trong cột đích
    let targetColKey: string | null = null;
    const directCol = columns.find(c => c.key === String(over.id));
    if (directCol) {
      targetColKey = directCol.key;
    } else {
      const overTask = tasks.find((t: any) => t.id === String(over.id));
      if (overTask) targetColKey = overTask.status;
    }

    if (targetColKey && targetColKey !== currentColKey) {
      await onUpdateStatus(taskId, targetColKey);
    }
  };

  const activeTask = activeTaskId ? tasks.find((t: any) => t.id === activeTaskId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[snapCenterToCursor, restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Desktop: flex-row cuộn ngang / Mobile: flex-col cuộn dọc */}
      <div className="
        flex flex-col gap-4
        sm:flex-row sm:overflow-x-auto
        pb-4
      " style={{ minHeight: '400px' }}>
        {columns.map(col => {
          const colTasks = tasks.filter((t: any) => t.status === col.key);
          return (
            <KanbanColumn
              key={col.key}
              col={col}
              colTasks={colTasks}
              staff={staff}
              onOpenDetail={onOpenDetail}
              activeTaskId={activeTaskId}
              isOver={overColKey === col.key}
            />
          );
        })}
      </div>

      {/* Bóng thẻ đang kéo (hiển thị ở mọi thiết bị) */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? <TaskCardOverlay task={activeTask} staff={staff} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

const timeOptions = Array.from({ length: 24 }).flatMap((_, h) => {
  const hStr = String(h).padStart(2, '0');
  return [0, 15, 30, 45].map(m => {
    const mStr = String(m).padStart(2, '0');
    return { value: `${hStr}:${mStr}`, label: `${hStr}:${mStr}` };
  });
});

export default function App() {
  const [messageApi, contextHolder] = message.useMessage();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState<'table' | 'kanban'>('kanban');
  const [scheduleViewMode, setScheduleViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDayModal, setSelectedDayModal] = useState<{ visible: boolean; date: string; items: any[] }>({ visible: false, date: '', items: [] });
  const [currentUser, setCurrentUser] = useState({
    id: 'NV-001',
    name: 'Nguyễn Văn Trưởng',
    role: 'Giám đốc',
    departmentId: 'van-phong'
  });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [deptSubTab, setDeptSubTab] = useState('nhan-su');
  const [reportMonth, setReportMonth] = useState('2026-09');
  const [reportSubTab, setReportSubTab] = useState('dich-vu');

  // State Thông tin doanh nghiệp
  const [companyName, setCompanyName] = useState('LAWFIRM ERP');
  const [companyLogo, setCompanyLogo] = useState('⚖️');
  const [companyAddress, setCompanyAddress] = useState('123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh');
  const [companyPhone, setCompanyPhone] = useState('028.1234.5678');
  const [companyEmail, setCompanyEmail] = useState('contact@lawfirm.com.vn');
  const [companyTaxId, setCompanyTaxId] = useState('0312345678');

  // State Xác thực Đăng nhập & Đăng ký
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginLoading, setLoginLoading] = useState(false);

  const [companyForm] = Form.useForm();

  // State dữ liệu
  const [stats, setStats] = useState<any>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [lawsuits, setLawsuits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAttachmentName, setCurrentAttachmentName] = useState<string | null>(null);
  const [revenues, setRevenues] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [timekeeping, setTimekeeping] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  // State cho Công văn, Kỷ luật, Khen thưởng
  const [dispatches, setDispatches] = useState<any[]>([
    { id: 'CV-001', number: '102/2026/CV-STP', type: 'Công văn đi', content: 'Gửi Sở Tư Pháp đề nghị xác minh hồ sơ hộ tịch', date: '2026-08-25', handler: 'Nguyễn Văn Trưởng', unit: 'Sở Tư Pháp' },
    { id: 'CV-002', number: '45/2026/CV-TA', type: 'Công văn đến', content: 'Thông báo thụ lý đơn khởi kiện từ Tòa án Quận 1', date: '2026-08-28', handler: 'Trần Văn Luật', unit: 'TAND Quận 1' },
  ]);
  const [disciplines, setDisciplines] = useState<any[]>([
    { id: 'KL-001', staffName: 'Hoàng Văn Sự', type: 'Nhắc nhở', reason: 'Vi phạm quy định giờ giấc làm việc', date: '2026-08-20', notes: 'Đã rút kinh nghiệm' },
  ]);
  const [rewards, setRewards] = useState<any[]>([
    { id: 'KT-001', staffName: 'Lê Thị Dịch', type: 'Bằng khen', reason: 'Hoàn thành xuất sắc chỉ tiêu hồ sơ dịch vụ tháng 8', bonus: 2000000, date: '2026-08-15', notes: 'Tuyên dương toàn đơn vị' },
  ]);

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [disciplineModalOpen, setDisciplineModalOpen] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);

  const [dispatchForm] = Form.useForm();
  const [disciplineForm] = Form.useForm();
  const [rewardForm] = Form.useForm();

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
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('app_company_name');
      const savedLogo = localStorage.getItem('app_company_logo');
      const savedAddress = localStorage.getItem('app_company_address');
      const savedPhone = localStorage.getItem('app_company_phone');
      const savedEmail = localStorage.getItem('app_company_email');
      const savedTaxId = localStorage.getItem('app_company_tax');

      if (savedName) setCompanyName(savedName);
      if (savedLogo) setCompanyLogo(savedLogo);
      if (savedAddress) setCompanyAddress(savedAddress);
      if (savedPhone) setCompanyPhone(savedPhone);
      if (savedEmail) setCompanyEmail(savedEmail);
      if (savedTaxId) setCompanyTaxId(savedTaxId);
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authApi.me();
      if (res && res.user) {
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        fetchData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (values: any) => {
    setLoginLoading(true);
    try {
      const res = await authApi.login(values);
      if (res && res.user) {
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        messageApi.success(`Chào mừng ${res.user.name} (${res.user.role}) quay trở lại hệ thống!`);
        fetchData();
      }
    } catch (err: any) {
      messageApi.error(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra Email và Mật khẩu.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoginLoading(true);
    try {
      const res = await authApi.register(values);
      if (res && res.user) {
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        messageApi.success(`Đăng ký tài khoản mới thành công! Chào mừng ${res.user.name} gia nhập hệ thống.`);
        fetchData();
      }
    } catch (err: any) {
      messageApi.error(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    setIsAuthenticated(false);
    messageApi.info('Đã đăng xuất khỏi hệ thống');
  };

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
        sData, cData, pData, lData, tData, schData, docData, folderData, revData, expData, debtData, contrData, stData, deptData, logData, tkData, lvData
      ] = await Promise.all([
        dashboardApi.getStats(),
        customerApi.getAll(),
        serviceProfileApi.getAll(),
        lawsuitApi.getAll(),
        taskApi.getAll(),
        scheduleApi.getAll(),
        documentApi.getAll(),
        folderApi.getAll(),
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
      setFolders(folderData);
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
      console.error('Fetch data error:', error);
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
      else if (type === 'contract') {
        data = await contractApi.getById(id);
        setCurrentAttachmentName(data?.attachmentName || null);
      }
      
      editForm.resetFields();
      if (data) editForm.setFieldsValue(data);
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
      if (values.endDate && typeof values.endDate.format === 'function') values.endDate = values.endDate.format('YYYY-MM-DD');

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
        case 'folder': {
          const created = await folderApi.create({
            ...values,
            parentId: values.parentId || undefined,
          });
          setFolders(prev => [...prev, created]);
          break;
        }
        case 'document': {
          const created = await documentApi.create({
            ...values,
            folderId: values.folderId || undefined,
          });
          setDocuments(prev => [...prev, created]);
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
      setSelectedFile(null);
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

  const handleUpdateTaskStatus = async (id: string, newStatus: string) => {
    try {
      await taskApi.update(id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      messageApi.success('Cập nhật trạng thái thành công');
    } catch (e) {
      messageApi.error('Không thể cập nhật trạng thái');
    }
  };

  const handleUpdateSchedule = async (values: any) => {
    try {
      const { scheduleDate, scheduleTime, ...rest } = values;
      let dateTime = rest.dateTime || '';
      if (scheduleDate && scheduleTime) {
        const datePart = dayjs(scheduleDate).format('YYYY-MM-DD');
        dateTime = `${datePart}T${scheduleTime}:00`;
      } else if (scheduleDate) {
        dateTime = dayjs(scheduleDate).format('YYYY-MM-DD') + 'T00:00:00';
      }
      const payload = { ...rest, dateTime };
      
      await scheduleApi.update(detailModal.data.id, payload);
      setSchedules(prev => prev.map(s => s.id === detailModal.data.id ? { ...s, ...payload } : s));
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

  if (isAuthenticated === false) {
    return (
      <ConfigProvider theme={customTheme}>
        {contextHolder}
        <div style={{
          minHeight: '100vh',
          background: darkMode ? '#0f172a' : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px'
        }}>
          <Card style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(20px)',
            background: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 44, marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {companyLogo.startsWith('data:') || companyLogo.startsWith('http') || companyLogo.startsWith('/') ? (
                  <img src={companyLogo} alt="Logo" style={{ width: 50, height: 50, objectFit: 'contain' }} />
                ) : (
                  companyLogo
                )}
              </div>
              <Title level={3} style={{ margin: '4px 0 0 0', color: primaryColor }}>{companyName}</Title>
              <Text type="secondary">Hệ thống Quản lý Công ty Luật & Doanh nghiệp</Text>
            </div>

            <Tabs
              activeKey={authTab}
              onChange={(key) => setAuthTab(key as any)}
              centered
              items={[
                {
                  key: 'login',
                  label: '🔑 Đăng nhập hệ thống',
                  children: (
                    <Form layout="vertical" onFinish={handleLogin} style={{ marginTop: 16 }}>
                      <Form.Item
                        name="email"
                        label="Email tài khoản"
                        rules={[{ required: true, message: 'Vui lòng nhập Email' }]}
                        initialValue="truong.nv@lawfirm.com"
                      >
                        <Input prefix={<MailOutlined style={{ opacity: 0.5 }} />} placeholder="truong.nv@lawfirm.com" size="large" />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu' }]}
                        initialValue="123456"
                      >
                        <Input.Password prefix={<LockOutlined style={{ opacity: 0.5 }} />} placeholder="Mật khẩu" size="large" />
                      </Form.Item>

                      <Button type="primary" htmlType="submit" size="large" block loading={loginLoading} style={{ height: 46, fontSize: 16, fontWeight: 600 }}>
                        Đăng nhập
                      </Button>
                    </Form>
                  )
                },
                {
                  key: 'register',
                  label: '📝 Đăng ký tài khoản',
                  children: (
                    <Form layout="vertical" onFinish={handleRegister} style={{ marginTop: 16 }}>
                      <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                        <Input placeholder="Nguyễn Văn Mới" size="large" />
                      </Form.Item>
                      <Form.Item name="email" label="Email làm việc" rules={[{ required: true, message: 'Nhập email' }]}>
                        <Input placeholder="moi.nv@lawfirm.com" size="large" />
                      </Form.Item>
                      <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
                        <Input.Password placeholder="Mật khẩu ít nhất 6 ký tự" size="large" />
                      </Form.Item>

                      <Button type="primary" htmlType="submit" size="large" block loading={loginLoading} style={{ height: 46, fontSize: 16, fontWeight: 600 }}>
                        Tạo tài khoản mới
                      </Button>
                    </Form>
                  )
                }
              ]}
            />

            <Divider style={{ margin: '20px 0 16px 0', fontSize: 13 }}>Đăng nhập nhanh Demo Accounts</Divider>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <Button size="small" onClick={() => handleLogin({ email: 'truong.nv@lawfirm.com', password: '123456' })}>
                👑 Giám đốc (Full)
              </Button>
              <Button size="small" onClick={() => handleLogin({ email: 'pho.tt@lawfirm.com', password: '123456' })}>
                👔 Phó Giám đốc
              </Button>
              <Button size="small" onClick={() => handleLogin({ email: 'dich.lt@lawfirm.com', password: '123456' })}>
                🏢 TP. Hồ sơ Dịch vụ
              </Button>
              <Button size="small" onClick={() => handleLogin({ email: 'luat.tv@lawfirm.com', password: '123456' })}>
                ⚖️ TP. Hồ sơ Tố tụng
              </Button>
              <Button size="small" style={{ gridColumn: 'span 2' }} onClick={() => handleLogin({ email: 'su.hv@lawfirm.com', password: '123456' })}>
                💼 Nhân viên / Luật sư (RBAC hạn chế)
              </Button>
            </div>
          </Card>
        </div>
      </ConfigProvider>
    );
  }

  // Cấu hình Items của Sidebar
  const sidebarItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'customers', icon: <TeamOutlined />, label: 'Khách hàng' },
    { key: 'departments', icon: <ApartmentOutlined />, label: 'Tổ chức & Phòng ban' },
    { key: 'staff', icon: <UserOutlined />, label: 'Nhân sự' },
    { key: 'profiles', icon: <FileTextOutlined />, label: 'Hồ sơ dịch vụ' },
    { key: 'lawsuits', icon: <SafetyCertificateOutlined />, label: 'Vụ án / Tố tụng' },
    { key: 'tasks', icon: <BarChartOutlined />, label: 'Báo cáo tháng' },
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
                {companyLogo.startsWith('data:') || companyLogo.startsWith('http') || companyLogo.startsWith('/') ? (
                  <img src={companyLogo} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} />
                ) : (
                  <span style={{ fontSize: 22 }}>{companyLogo}</span>
                )}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-black truncate max-w-[170px]" title={companyName}>
                  {companyName}
                </span>
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
                  <Tooltip title="Đăng xuất khỏi hệ thống">
                    <Button icon={<LogoutOutlined />} danger type="text" onClick={handleLogout} />
                  </Tooltip>
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
              {currentMenu === 'departments' && (() => {
                const deptStaffCount = (deptId: string) => staff.filter(s => s.departmentId === deptId).length;
                const selectedDeptData = departments.find(d => d.id === selectedDept);

                if (!selectedDept) {
                  // Trang tổng quan 4 phòng ban
                  return (
                    <div className="space-y-6">
                      <Card className="glass-panel" title="Cơ cấu Tổ chức Công ty Luật" extra={<Tag color="blue">4 Phòng ban</Tag>}>
                        <div style={{ textAlign: 'center', marginBottom: 24, padding: '16px 0', background: 'linear-gradient(135deg, rgba(22,119,255,0.06), rgba(114,46,209,0.06))', borderRadius: 12 }}>
                          <Text strong style={{ fontSize: 14, color: '#888' }}>SƠ ĐỒ CƠ CẤU TỔ CHỨC</Text>
                          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <Tag color="gold" style={{ fontSize: 16, padding: '6px 20px' }}>🏛️ Giám đốc: {staff.find(s => s.role === 'Giám đốc')?.name || '—'}</Tag>
                            <div style={{ width: 2, height: 16, background: '#ddd' }} />
                            <Tag color="purple" style={{ fontSize: 14, padding: '4px 16px' }}>👔 Phó GĐ: {staff.find(s => s.role === 'Phó Giám đốc')?.name || '—'}</Tag>
                            <div style={{ width: 2, height: 16, background: '#ddd' }} />
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                              {departments.map(d => (
                                <Tag key={d.id} color="blue" style={{ padding: '4px 12px' }}>📁 {d.name}</Tag>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Row gutter={[16, 16]}>
                        {departments.map((dept: any) => {
                          const mgr = staff.find(s => s.id === dept.managerId);
                          const memberCount = deptStaffCount(dept.id);
                          const iconMap: Record<string, string> = { 'van-phong': '🏢', 'dich-vu': '📋', 'to-tung': '⚖️', 'doanh-nghiep': '🏭' };
                          return (
                            <Col xs={24} sm={12} md={6} key={dept.id}>
                              <Card
                                hoverable
                                className="glass-panel"
                                onClick={() => { setSelectedDept(dept.id); setDeptSubTab(dept.id === 'van-phong' ? 'nhan-su' : 'ho-so'); }}
                                style={{ textAlign: 'center', cursor: 'pointer' }}
                              >
                                <div style={{ fontSize: 36, marginBottom: 8 }}>{iconMap[dept.id] || '📁'}</div>
                                <Title level={5} style={{ margin: 0 }}>{dept.name}</Title>
                                <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>{dept.description}</Text>
                                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
                                  <Tag color="green">{memberCount} nhân viên</Tag>
                                  <Tag color="blue">Đang hoạt động</Tag>
                                </div>
                                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                                  Trưởng phòng: <Text strong>{mgr?.name || 'Chưa gán'}</Text>
                                </Text>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  );
                }

                // Chi tiết một phòng ban cụ thể
                const deptStaff = staff.filter(s => s.departmentId === selectedDept);
                const deptMgr = staff.find(s => s.id === selectedDeptData?.managerId);

                return (
                  <div className="space-y-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedDept(null)}>← Quay lại danh sách phòng ban</Button>
                    <Card className="glass-panel" title={<span style={{ fontSize: 18 }}>{selectedDeptData?.name}</span>} extra={<Tag color="green">Trưởng phòng: {deptMgr?.name || '—'}</Tag>}>

                      {/* ===== Phòng Văn phòng & Hành chính ===== */}
                      {selectedDept === 'van-phong' && (
                        <Tabs activeKey={deptSubTab} onChange={setDeptSubTab} items={[
                          {
                            key: 'nhan-su',
                            label: '👥 Nhân sự',
                            children: (
                              <Table
                                dataSource={deptStaff}
                                rowKey="id"
                                columns={[
                                  { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                                  { title: 'Họ tên', dataIndex: 'name', key: 'name' },
                                  { title: 'Chức vụ', dataIndex: 'role', key: 'role', render: (r) => <Tag color="blue">{r}</Tag> },
                                  { title: 'Phòng ban', key: 'dept', render: () => selectedDeptData?.name },
                                  { title: 'Thời gian vào làm', dataIndex: 'joinDate', key: 'joinDate' },
                                  { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
                                  { title: 'Email', dataIndex: 'email', key: 'email' },
                                  { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Đang làm việc' ? 'green' : 'red'}>{s}</Tag> },
                                ]}
                              />
                            )
                          },
                          {
                            key: 'co-cau',
                            label: '🏛️ Cơ cấu tổ chức',
                            children: (
                              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                  <Card size="small" style={{ minWidth: 250, border: '2px solid #faad14' }}>
                                    <Text strong>🏛️ Giám đốc</Text><br/>
                                    <Text>{staff.find(s => s.role === 'Giám đốc')?.name || '—'}</Text>
                                  </Card>
                                  <div style={{ width: 2, height: 20, background: '#d9d9d9' }} />
                                  <Card size="small" style={{ minWidth: 250, border: '2px solid #722ed1' }}>
                                    <Text strong>👔 Phó Giám đốc</Text><br/>
                                    <Text>{staff.find(s => s.role === 'Phó Giám đốc')?.name || '—'}</Text>
                                  </Card>
                                  <div style={{ width: 2, height: 20, background: '#d9d9d9' }} />
                                  <Row gutter={[12, 12]} justify="center">
                                    {departments.map(d => {
                                      const tp = staff.find(s => s.id === d.managerId);
                                      const count = staff.filter(s => s.departmentId === d.id).length;
                                      return (
                                        <Col key={d.id}>
                                          <Card size="small" style={{ minWidth: 180, border: '1px solid #1677ff', textAlign: 'center' }}>
                                            <Text strong style={{ fontSize: 12 }}>📁 {d.name}</Text><br/>
                                            <Text type="secondary" style={{ fontSize: 11 }}>TP: {tp?.name || '—'}</Text><br/>
                                            <Tag color="green" style={{ marginTop: 4 }}>{count} người</Tag>
                                          </Card>
                                        </Col>
                                      );
                                    })}
                                  </Row>
                                </div>
                              </div>
                            )
                          },
                          {
                            key: 'cong-van',
                            label: '📨 Công văn đến/đi',
                            children: (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                  <Text type="secondary">Danh sách công văn vào và ra của công ty</Text>
                                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setDispatchModalOpen(true)}>
                                    Thêm công văn mới
                                  </Button>
                                </div>
                                <Table
                                  dataSource={dispatches}
                                  rowKey="id"
                                  columns={[
                                    { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                                    { title: 'Số công văn', dataIndex: 'number', key: 'number', render: (v) => <Text strong>{v}</Text> },
                                    { title: 'Loại', dataIndex: 'type', key: 'type', render: (t) => <Tag color={t === 'Công văn đến' ? 'blue' : 'purple'}>{t}</Tag> },
                                    { title: 'Nội dung trích yếu', dataIndex: 'content', key: 'content' },
                                    { title: 'Đơn vị liên quan', dataIndex: 'unit', key: 'unit', render: (v) => v || '—' },
                                    { title: 'Ngày phát hành/nhận', dataIndex: 'date', key: 'date' },
                                    { title: 'Người xử lý', dataIndex: 'handler', key: 'handler' },
                                  ]}
                                />
                              </div>
                            )
                          },
                          {
                            key: 'ky-luat',
                            label: '⚠️ Kỷ luật',
                            children: (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                  <Text type="secondary">Ghi nhận các quyết định kỷ luật lao động</Text>
                                  <Button type="primary" danger icon={<PlusOutlined />} onClick={() => setDisciplineModalOpen(true)}>
                                    Thêm quyết định kỷ luật
                                  </Button>
                                </div>
                                <Table
                                  dataSource={disciplines}
                                  rowKey="id"
                                  columns={[
                                    { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                                    { title: 'Nhân viên bị kỷ luật', dataIndex: 'staffName', key: 'staffName', render: (v) => <Text strong>{v}</Text> },
                                    { title: 'Hình thức kỷ luật', dataIndex: 'type', key: 'type', render: (t) => <Tag color="volcano">{t}</Tag> },
                                    { title: 'Lý do kỷ luật', dataIndex: 'reason', key: 'reason' },
                                    { title: 'Ngày quyết định', dataIndex: 'date', key: 'date' },
                                    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes', render: (v) => v || '—' },
                                  ]}
                                />
                              </div>
                            )
                          },
                          {
                            key: 'khen-thuong',
                            label: '🏆 Khen thưởng',
                            children: (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                  <Text type="secondary">Ghi nhận thành tích và khen thưởng nhân sự</Text>
                                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setRewardModalOpen(true)}>
                                    Thêm khen thưởng
                                  </Button>
                                </div>
                                <Table
                                  dataSource={rewards}
                                  rowKey="id"
                                  columns={[
                                    { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                                    { title: 'Nhân viên được khen thưởng', dataIndex: 'staffName', key: 'staffName', render: (v) => <Text strong>{v}</Text> },
                                    { title: 'Hình thức', dataIndex: 'type', key: 'type', render: (t) => <Tag color="gold">{t}</Tag> },
                                    { title: 'Lý do khen thưởng', dataIndex: 'reason', key: 'reason' },
                                    { title: 'Tiền thưởng (VND)', dataIndex: 'bonus', key: 'bonus', render: (v) => v ? `${v.toLocaleString()}đ` : '—' },
                                    { title: 'Ngày quyết định', dataIndex: 'date', key: 'date' },
                                    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes', render: (v) => v || '—' },
                                  ]}
                                />
                              </div>
                            )
                          },
                        ]} />
                      )}

                      {/* ===== Phòng Hồ sơ Dịch vụ ===== */}
                      {selectedDept === 'dich-vu' && (
                        <Table
                          dataSource={profiles.filter(p => p.serviceType !== 'Doanh nghiệp')}
                          rowKey="id"
                          onRow={(record) => ({ onClick: () => handleOpenDetail('profile', record.id), style: { cursor: 'pointer' } })}
                          columns={[
                            { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                            { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                            { title: 'Số hợp đồng', dataIndex: 'contractNumber', key: 'contractNumber', render: (v) => v || '—' },
                            { title: 'Quan hệ pháp luật', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                            { title: 'Nhân viên', dataIndex: 'managerId', key: 'managerId', render: (mid) => staff.find(s => s.id === mid)?.name || mid },
                            { title: 'Tình trạng', dataIndex: 'status', key: 'status', render: (s) => {
                              let color = 'blue';
                              if (s === 'Hoàn thành' || s === 'Đóng hồ sơ') color = 'green';
                              if (s === 'Chờ bổ sung') color = 'orange';
                              return <Tag color={color}>{s}</Tag>;
                            }},
                            { title: 'Lưu ý', dataIndex: 'notes', key: 'notes', ellipsis: true, render: (v) => v || '—' },
                            { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v) => v || 'Chưa kết thúc' },
                          ]}
                        />
                      )}

                      {/* ===== Phòng Hồ sơ Tố tụng ===== */}
                      {selectedDept === 'to-tung' && (
                        <Table
                          dataSource={lawsuits}
                          rowKey="id"
                          onRow={(record) => ({ onClick: () => handleOpenDetail('lawsuit', record.id), style: { cursor: 'pointer' } })}
                          columns={[
                            { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                            { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                            { title: 'Số hợp đồng', dataIndex: 'contractNumber', key: 'contractNumber', render: (v) => v || '—' },
                            { title: 'Quan hệ pháp luật', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                            { title: 'Nhân viên', dataIndex: 'lawyerId', key: 'lawyerId', render: (lid) => staff.find(s => s.id === lid)?.name || lid },
                            { title: 'Tình trạng', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Hoàn thành' || s === 'Đóng hồ sơ' ? 'green' : 'blue'}>{s}</Tag> },
                            { title: 'Lưu ý hồ sơ', dataIndex: 'notes', key: 'notes', ellipsis: true, render: (v) => v || '—' },
                            { title: 'Tạm ứng', dataIndex: 'advancePayment', key: 'advancePayment', render: (v) => v ? `${v.toLocaleString()}đ` : '—' },
                            { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v) => v || 'Chưa kết thúc' },
                          ]}
                        />
                      )}

                      {/* ===== Phòng Hồ sơ Doanh nghiệp ===== */}
                      {selectedDept === 'doanh-nghiep' && (
                        <Table
                          dataSource={profiles.filter(p => p.serviceType === 'Doanh nghiệp')}
                          rowKey="id"
                          onRow={(record) => ({ onClick: () => handleOpenDetail('profile', record.id), style: { cursor: 'pointer' } })}
                          columns={[
                            { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                            { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                            { title: 'Số hợp đồng', dataIndex: 'contractNumber', key: 'contractNumber', render: (v) => v || '—' },
                            { title: 'Quan hệ pháp luật', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                            { title: 'Nhân viên', dataIndex: 'managerId', key: 'managerId', render: (mid) => staff.find(s => s.id === mid)?.name || mid },
                            { title: 'Tình trạng', dataIndex: 'status', key: 'status', render: (s) => {
                              let color = 'blue';
                              if (s === 'Hoàn thành' || s === 'Đóng hồ sơ') color = 'green';
                              if (s === 'Chờ bổ sung') color = 'orange';
                              return <Tag color={color}>{s}</Tag>;
                            }},
                            { title: 'Lưu ý', dataIndex: 'notes', key: 'notes', ellipsis: true, render: (v) => v || '—' },
                            { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v) => v || 'Chưa kết thúc' },
                          ]}
                        />
                      )}
                    </Card>
                  </div>
                );
              })()}

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
                      { title: 'Thời gian vào làm', dataIndex: 'joinDate', key: 'joinDate' },
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
                  title="Hồ sơ dịch vụ (Phòng Hồ sơ Dịch vụ)"
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
                      { title: 'STT', key: 'stt', render: (_, __, index) => index + 1, width: 60 },
                      { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                      { title: 'Quan hệ pháp luật', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                      { title: 'Số hợp đồng', dataIndex: 'contractNumber', key: 'contractNumber', render: (v) => v || '—' },
                      { title: 'Loại dịch vụ', dataIndex: 'serviceType', key: 'serviceType' },
                      { title: 'Nhân viên', dataIndex: 'managerId', key: 'managerId', render: (mid) => staff.find(s => s.id === mid)?.name || mid },
                      {
                        title: 'Tình trạng',
                        dataIndex: 'status',
                        key: 'status',
                        render: (s) => {
                          let color = 'blue';
                          if (s === 'Hoàn thành' || s === 'Đóng hồ sơ') color = 'green';
                          if (s === 'Chờ bổ sung') color = 'orange';
                          return <Tag color={color}>{s}</Tag>;
                        }
                      },
                      { title: 'Lưu ý', dataIndex: 'notes', key: 'notes', ellipsis: true, render: (v) => v || '—' },
                      { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v) => v || 'Chưa kết thúc' },
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
                  title="Vụ án / Tố tụng (Phòng Hồ sơ Tố tụng)"
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
                      { title: 'STT', key: 'stt', render: (_, __, index) => index + 1, width: 60 },
                      { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                      { title: 'Số hợp đồng', dataIndex: 'contractNumber', key: 'contractNumber', render: (v) => v || '—' },
                      { title: 'Quan hệ pháp luật', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                      { title: 'Nhân viên', dataIndex: 'lawyerId', key: 'lawyerId', render: (lid) => staff.find(s => s.id === lid)?.name || lid },
                      {
                        title: 'Tình trạng',
                        dataIndex: 'status',
                        key: 'status',
                        render: (s) => <Tag color={s === 'Hoàn thành' || s === 'Đóng hồ sơ' ? 'green' : 'blue'}>{s}</Tag>
                      },
                      { title: 'Lưu ý hồ sơ', dataIndex: 'notes', key: 'notes', ellipsis: true, render: (v) => v || '—' },
                      { title: 'Tạm ứng', dataIndex: 'advancePayment', key: 'advancePayment', render: (v) => v ? `${v.toLocaleString()}đ` : '—' },
                      { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v) => v || 'Chưa kết thúc' },
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
              {/* ---------------------------------------------------- */}
              {/* TAB 7: MONTHLY REPORTS (BÁO CÁO THÁNG) */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'tasks' && (() => {
                const totalProfilesCount = profiles.length;
                const totalLawsuitsCount = lawsuits.length;
                const totalRevenueMonth = revenues.reduce((acc, r) => acc + (r.amount || 0), 0);
                const completedProfilesCount = profiles.filter(p => p.status === 'Hoàn thành' || p.status === 'Đóng hồ sơ').length;
                const totalDebtsCount = debts.reduce((acc, d) => acc + (d.remainAmount || 0), 0);

                const handleExportExcel = () => {
                  try {
                    let csvContent = '\uFEFF'; // UTF-8 BOM cho Microsoft Excel đọc được tiếng Việt
                    
                    if (reportSubTab === 'dich-vu') {
                      csvContent += 'STT,Ma Ho So,Khach Hang,Quan He Phap Luat,Nhan Vien Phu Trach,Gia Tri Dich Vu,Trang Thai,Ngay Tiep Nhan,Ngay Ket Thuc\n';
                      profiles.filter(p => p.serviceType !== 'Doanh nghiệp').forEach((p, i) => {
                        const cust = customers.find(c => c.id === p.customerId)?.name || p.customerId;
                        const mgr = staff.find(s => s.id === p.managerId)?.name || p.managerId;
                        csvContent += `"${i + 1}","${p.id}","${cust}","${p.title}","${mgr}","${p.price || 0}","${p.status}","${p.receiveDate}","${p.endDate || 'Chưa kết thúc'}"\n`;
                      });
                    } else if (reportSubTab === 'to-tung') {
                      csvContent += 'STT,Ma Vu An,Khach Hang,Quan He Phap Luat,Nhan Vien Phu Trach,Tam Ung,Trang Thai,Ngay Tiep Nhan,Ngay Ket Thuc\n';
                      lawsuits.forEach((l, i) => {
                        const cust = customers.find(c => c.id === l.customerId)?.name || l.customerId;
                        const lwr = staff.find(s => s.id === l.lawyerId)?.name || l.lawyerId;
                        csvContent += `"${i + 1}","${l.id}","${cust}","${l.title}","${lwr}","${l.advancePayment || 0}","${l.status}","${l.receiveDate}","${l.endDate || 'Chưa kết thúc'}"\n`;
                      });
                    } else if (reportSubTab === 'doanh-nghiep') {
                      csvContent += 'STT,Ma Ho So,Khach Hang,Quan He Phap Luat,Nhan Vien Phu Trach,Gia Tri,Trang Thai,Ngay Tiep Nhan,Ngay Ket Thuc\n';
                      profiles.filter(p => p.serviceType === 'Doanh nghiệp').forEach((p, i) => {
                        const cust = customers.find(c => c.id === p.customerId)?.name || p.customerId;
                        const mgr = staff.find(s => s.id === p.managerId)?.name || p.managerId;
                        csvContent += `"${i + 1}","${p.id}","${cust}","${p.title}","${mgr}","${p.price || 0}","${p.status}","${p.receiveDate}","${p.endDate || 'Chưa kết thúc'}"\n`;
                      });
                    } else if (reportSubTab === 'hieu-suat') {
                      csvContent += 'STT,Ma NV,Ho Ten Nhan Vien,Chuc Vu,Phong Ban,So Ho So Dang Xu Ly,So Dau Viec Giao,Danh Gia\n';
                      staff.forEach((s, i) => {
                        const dept = departments.find(d => d.id === s.departmentId)?.name || s.departmentId;
                        const pCount = profiles.filter(p => p.managerId === s.id).length + lawsuits.filter(l => l.lawyerId === s.id).length;
                        const tCount = tasks.filter(t => t.assigneeId === s.id).length;
                        csvContent += `"${i + 1}","${s.id}","${s.name}","${s.role}","${dept}","${pCount}","${tCount}","Xuất sắc"\n`;
                      });
                    } else {
                      csvContent += 'STT,Ten Cong Viec,Nguoi Thuc Hien,Phong Ban,Han Chot,Muc Uu Tien,Trang Thai\n';
                      tasks.forEach((t, i) => {
                        const assign = staff.find(s => s.id === t.assigneeId)?.name || t.assigneeId;
                        const dept = departments.find(d => d.id === t.departmentId)?.name || t.departmentId;
                        csvContent += `"${i + 1}","${t.title}","${assign}","${dept}","${t.deadline}","${t.priority}","${t.status}"\n`;
                      });
                    }

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `Bao_Cao_Thang_${reportMonth}_${reportSubTab}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    messageApi.success(`Đã tự động xuất và tải file Excel báo cáo tháng ${reportMonth} về máy!`);
                  } catch (e) {
                    messageApi.error('Không thể xuất file Excel!');
                  }
                };

                return (
                  <div className="space-y-6">
                    <Card
                      className="glass-panel"
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <BarChartOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                          <span style={{ fontSize: 20, fontWeight: 700 }}>Báo cáo Hoạt động Tháng</span>
                        </div>
                      }
                      extra={
                        <Space size={12}>
                          <Select
                            value={reportMonth}
                            onChange={setReportMonth}
                            style={{ width: 160 }}
                            options={[
                              { value: '2026-09', label: 'Tháng 09/2026' },
                              { value: '2026-08', label: 'Tháng 08/2026' },
                              { value: '2026-07', label: 'Tháng 07/2026' },
                            ]}
                          />
                          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                            In báo cáo
                          </Button>
                          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel}>
                            Xuất Excel
                          </Button>
                        </Space>
                      }
                    >
                      {/* Thống kê KPI Tháng */}
                      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, rgba(22,119,255,0.1), rgba(22,119,255,0.02))', border: '1px solid rgba(22,119,255,0.2)' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>📋 Tổng hồ sơ & vụ án mới</Text>
                            <Title level={3} style={{ margin: '8px 0 0 0', color: '#1677ff' }}>{totalProfilesCount + totalLawsuitsCount}</Title>
                            <Text type="secondary" style={{ fontSize: 11 }}>Trong kỳ báo cáo {reportMonth}</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, rgba(82,196,26,0.1), rgba(82,196,26,0.02))', border: '1px solid rgba(82,196,26,0.2)' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>💰 Doanh thu thu về</Text>
                            <Title level={3} style={{ margin: '8px 0 0 0', color: '#52c41a' }}>{totalRevenueMonth.toLocaleString()}đ</Title>
                            <Text type="secondary" style={{ fontSize: 11 }}>Tổng tiền đã thực thu</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, rgba(114,46,209,0.1), rgba(114,46,209,0.02))', border: '1px solid rgba(114,46,209,0.2)' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>✅ Tỷ lệ hoàn thành</Text>
                            <Title level={3} style={{ margin: '8px 0 0 0', color: '#722ed1' }}>
                              {totalProfilesCount > 0 ? `${Math.round((completedProfilesCount / totalProfilesCount) * 100)}%` : '100%'}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 11 }}>{completedProfilesCount}/{totalProfilesCount} hồ sơ xong</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, rgba(250,140,22,0.1), rgba(250,140,22,0.02))', border: '1px solid rgba(250,140,22,0.2)' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>⚠️ Công nợ tồn đọng</Text>
                            <Title level={3} style={{ margin: '8px 0 0 0', color: '#fa8c16' }}>{totalDebtsCount.toLocaleString()}đ</Title>
                            <Text type="secondary" style={{ fontSize: 11 }}>Chờ thu hồi trong tháng</Text>
                          </div>
                        </Col>
                      </Row>

                      {/* Sub-tabs báo cáo chi tiết */}
                      <Tabs activeKey={reportSubTab} onChange={setReportSubTab} items={[
                        {
                          key: 'dich-vu',
                          label: '📋 Báo cáo Hồ sơ Dịch vụ',
                          children: (
                            <div>
                              <Table
                                dataSource={profiles.filter(p => p.serviceType !== 'Doanh nghiệp')}
                                rowKey="id"
                                columns={[
                                  { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                                  { title: 'Mã hồ sơ', dataIndex: 'id', key: 'id' },
                                  { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                                  { title: 'Quan hệ pháp luật', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                                  { title: 'Nhân viên phụ trách', dataIndex: 'managerId', key: 'managerId', render: (mid) => staff.find(s => s.id === mid)?.name || mid },
                                  { title: 'Giá trị dịch vụ', dataIndex: 'price', key: 'price', render: (v) => `${v?.toLocaleString() || 0}đ` },
                                  { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Hoàn thành' ? 'green' : 'blue'}>{s}</Tag> },
                                  { title: 'Ngày tiếp nhận', dataIndex: 'receiveDate', key: 'receiveDate' },
                                  { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v) => v || 'Chưa kết thúc' },
                                ]}
                              />
                            </div>
                          )
                        },
                        {
                          key: 'to-tung',
                          label: '⚖️ Báo cáo Vụ án / Tố tụng',
                          children: (
                            <div>
                              <Table
                                dataSource={lawsuits}
                                rowKey="id"
                                columns={[
                                  { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                                  { title: 'Mã vụ án', dataIndex: 'id', key: 'id' },
                                  { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                                  { title: 'Quan hệ pháp luật', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                                  { title: 'Nhân viên phụ trách', dataIndex: 'lawyerId', key: 'lawyerId', render: (lid) => staff.find(s => s.id === lid)?.name || lid },
                                  { title: 'Tạm ứng', dataIndex: 'advancePayment', key: 'advancePayment', render: (v) => v ? `${v.toLocaleString()}đ` : '—' },
                                  { title: 'Trạng thái giải quyết', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Hoàn thành' ? 'green' : 'blue'}>{s}</Tag> },
                                  { title: 'Ngày tiếp nhận', dataIndex: 'receiveDate', key: 'receiveDate' },
                                  { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v) => v || 'Chưa kết thúc' },
                                ]}
                              />
                            </div>
                          )
                        },
                        {
                          key: 'doanh-nghiep',
                          label: '🏭 Báo cáo Hồ sơ Doanh nghiệp',
                          children: (
                            <div>
                              <Table
                                dataSource={profiles.filter(p => p.serviceType === 'Doanh nghiệp')}
                                rowKey="id"
                                columns={[
                                  { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                                  { title: 'Mã hồ sơ', dataIndex: 'id', key: 'id' },
                                  { title: 'Khách hàng', dataIndex: 'customerId', key: 'customerId', render: (cid) => customers.find(c => c.id === cid)?.name || cid },
                                  { title: 'Quan hệ pháp luật', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                                  { title: 'Nhân viên phụ trách', dataIndex: 'managerId', key: 'managerId', render: (mid) => staff.find(s => s.id === mid)?.name || mid },
                                  { title: 'Giá trị', dataIndex: 'price', key: 'price', render: (v) => `${v?.toLocaleString() || 0}đ` },
                                  { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Hoàn thành' ? 'green' : 'blue'}>{s}</Tag> },
                                  { title: 'Ngày tiếp nhận', dataIndex: 'receiveDate', key: 'receiveDate' },
                                  { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v) => v || 'Chưa kết thúc' },
                                ]}
                              />
                            </div>
                          )
                        },
                        {
                          key: 'hieu-suat',
                          label: '👥 Báo cáo Hiệu suất Nhân viên',
                          children: (
                            <div>
                              <Table
                                dataSource={staff}
                                rowKey="id"
                                columns={[
                                  { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60 },
                                  { title: 'Mã NV', dataIndex: 'id', key: 'id' },
                                  { title: 'Họ tên nhân viên', dataIndex: 'name', key: 'name', render: (v) => <Text strong>{v}</Text> },
                                  { title: 'Chức vụ', dataIndex: 'role', key: 'role', render: (r) => <Tag color="blue">{r}</Tag> },
                                  { title: 'Phòng ban', dataIndex: 'departmentId', key: 'departmentId', render: (id) => departments.find(d => d.id === id)?.name || id },
                                  { title: 'Số hồ sơ đang xử lý', key: 'handlingCount', render: (_, record) => {
                                    const count = profiles.filter(p => p.managerId === record.id).length + lawsuits.filter(l => l.lawyerId === record.id).length;
                                    return <Tag color="orange">{count} hồ sơ</Tag>;
                                  }},
                                  { title: 'Số công việc giao', key: 'taskCount', render: (_, record) => {
                                    const count = tasks.filter(t => t.assigneeId === record.id).length;
                                    return <Tag color="cyan">{count} đầu việc</Tag>;
                                  }},
                                  { title: 'Đánh giá hiệu suất', key: 'rating', render: () => <Tag color="green">Xuất sắc</Tag> },
                                ]}
                              />
                            </div>
                          )
                        },
                        {
                          key: 'cong-viec-thang',
                          label: '📌 Danh sách Đầu việc trong Tháng',
                          children: (
                            <div>
                              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Radio.Group value={taskViewMode} onChange={(e) => setTaskViewMode(e.target.value)}>
                                  <Radio.Button value="kanban">Bảng Kanban</Radio.Button>
                                  <Radio.Button value="table">Danh sách</Radio.Button>
                                </Radio.Group>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'task' })}>
                                  Giao việc mới trong tháng
                                </Button>
                              </div>

                              {taskViewMode === 'kanban' ? (
                                <TaskKanban
                                  tasks={tasks}
                                  staff={staff}
                                  departments={departments}
                                  onOpenDetail={handleOpenDetail}
                                  onUpdateStatus={handleUpdateTaskStatus}
                                />
                              ) : (
                                <Table
                                  dataSource={tasks}
                                  rowKey="id"
                                  onRow={(record) => ({ onClick: () => handleOpenDetail('task', record.id), style: { cursor: 'pointer' } })}
                                  columns={[
                                    { title: 'Tên công việc', dataIndex: 'title', key: 'title', render: (text) => <a>{text}</a> },
                                    { title: 'Người thực hiện', dataIndex: 'assigneeId', key: 'assigneeId', render: (id) => staff.find(s => s.id === id)?.name || id },
                                    { title: 'Phòng ban', dataIndex: 'departmentId', key: 'departmentId', render: (id) => departments.find(d => d.id === id)?.name || id },
                                    { title: 'Hạn chót', dataIndex: 'deadline', key: 'deadline' },
                                    { title: 'Mức ưu tiên', dataIndex: 'priority', key: 'priority', render: (p) => <Tag color={p === 'Khẩn cấp' ? 'red' : p === 'Cao' ? 'orange' : 'blue'}>{p}</Tag> },
                                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Hoàn thành' ? 'green' : 'orange'}>{s}</Tag> },
                                  ]}
                                />
                              )}
                            </div>
                          )
                        }
                      ]} />
                    </Card>
                  </div>
                );
              })()}

              {/* ---------------------------------------------------- */}
              {/* TAB 8: SCHEDULES */}
              {/* ---------------------------------------------------- */}
              {currentMenu === 'schedules' && (
                <Card
                  title="Lịch làm việc"
                  extra={
                    <Space size={12}>
                      <Radio.Group
                        value={scheduleViewMode}
                        onChange={(e) => setScheduleViewMode(e.target.value)}
                        size="middle"
                      >
                        <Radio.Button value="calendar">Lịch</Radio.Button>
                        <Radio.Button value="list">Danh sách</Radio.Button>
                      </Radio.Group>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal({ visible: true, type: 'schedule' })}>
                        Tạo lịch hẹn
                      </Button>
                    </Space>
                  }
                  className="glass-panel"
                >
                  {scheduleViewMode === 'calendar' ? (
                    <div>
                      <Calendar
                        fullscreen={false}
                        mode="month"
                        className="schedule-cal"
                        onPanelChange={(_, mode) => {
                          // Không cho chuyển sang Year view
                          if (mode !== 'month') return;
                        }}
                        onSelect={(date) => {
                          const dateStr = date.format('YYYY-MM-DD');
                          const daySchedules = schedules.filter((s: any) =>
                            dayjs(s.dateTime).format('YYYY-MM-DD') === dateStr
                          );
                          if (daySchedules.length > 0) {
                            setSelectedDayModal({ visible: true, date: dateStr, items: daySchedules });
                          }
                        }}
                        cellRender={(current, info) => {
                          if (info.type !== 'date') return info.originNode;
                          const dateStr = current.format('YYYY-MM-DD');
                          const daySchedules = schedules.filter((s: any) =>
                            dayjs(s.dateTime).format('YYYY-MM-DD') === dateStr
                          );
                          if (daySchedules.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                              {daySchedules.slice(0, 4).map((s: any) => (
                                <span
                                  key={s.id}
                                  className="rounded-full shrink-0"
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    display: 'inline-block',
                                    background: s.type === 'Hẹn khách' ? '#2563eb' : s.type === 'Lịch tòa' ? '#dc2626' : '#059669'
                                  }}
                                />
                              ))}
                            </div>
                          );
                        }}
                        style={{ borderRadius: '8px' }}
                      />

                      {/* Modal khi click vào ngày có lịch */}
                      <Modal
                        open={selectedDayModal.visible}
                        title={`Lịch ngày ${dayjs(selectedDayModal.date).format('DD/MM/YYYY')}`}
                        onCancel={() => setSelectedDayModal({ visible: false, date: '', items: [] })}
                        footer={null}
                        width={480}
                      >
                        <div className="space-y-3 py-2">
                          {selectedDayModal.items.map((s: any) => (
                            <div
                              key={s.id}
                              onClick={() => { setSelectedDayModal({ visible: false, date: '', items: [] }); handleOpenDetail('schedule', s.id); }}
                              className="flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] hover:border-blue-400/50 cursor-pointer transition-all"
                            >
                              <div
                                className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 text-white font-bold"
                                style={{ background: s.type === 'Hẹn khách' ? '#2563eb' : s.type === 'Lịch tòa' ? '#dc2626' : '#059669', fontSize: '11px' }}
                              >
                                {dayjs(s.dateTime).format('HH:mm')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.title}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{s.type} {s.notes ? `· ${s.notes}` : ''}</div>
                              </div>
                              <Tag color={s.type === 'Hẹn khách' ? 'blue' : s.type === 'Lịch tòa' ? 'red' : 'green'} className="shrink-0">{s.type}</Tag>
                            </div>
                          ))}
                        </div>
                      </Modal>

                      {/* Danh sách lịch trong tháng này */}
                      <div className="mt-4">
                        <Divider className="text-xs">Sự kiện sắp tới</Divider>
                        <div className="space-y-2 max-h-[240px] overflow-y-auto">
                          {schedules
                            .filter((s: any) => dayjs(s.dateTime).isAfter(dayjs().subtract(1, 'day')))
                            .sort((a: any, b: any) => dayjs(a.dateTime).unix() - dayjs(b.dateTime).unix())
                            .slice(0, 8)
                            .map((s: any) => (
                              <div
                                key={s.id}
                                onClick={() => handleOpenDetail('schedule', s.id)}
                                className="flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] hover:border-blue-400/50 cursor-pointer transition-all"
                              >
                                <div
                                  className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 text-white text-xs font-bold"
                                  style={{ background: s.type === 'Hẹn khách' ? '#2563eb' : s.type === 'Lịch tòa' ? '#dc2626' : '#059669' }}
                                >
                                  <span className="text-[10px] leading-none">{dayjs(s.dateTime).format('DD')}</span>
                                  <span className="text-[8px] leading-none opacity-80">{dayjs(s.dateTime).format('MMM')}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{s.title}</div>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    ⏰ {dayjs(s.dateTime).format('HH:mm')} · {s.type}
                                  </div>
                                </div>
                                <Tag color={s.type === 'Hẹn khách' ? 'blue' : s.type === 'Lịch tòa' ? 'red' : 'green'} className="shrink-0">{s.type}</Tag>
                              </div>
                            ))}
                          {schedules.filter((s: any) => dayjs(s.dateTime).isAfter(dayjs().subtract(1, 'day'))).length === 0 && (
                            <div className="text-center text-gray-400 py-6 text-sm">Không có sự kiện sắp tới</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
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
                          render: (ids: string[]) => (ids || []).map(id => staff.find(s => s.id === id)?.name || id).join(', ')
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
                  )}
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
              {currentMenu === 'documents' && (() => {
                // Breadcrumb path
                const getBreadcrumb = (folderId: string | undefined): any[] => {
                  if (!folderId) return [];
                  const folder = folders.find(f => f.id === folderId);
                  if (!folder) return [];
                  return [...getBreadcrumb(folder.parentId), folder];
                };
                const breadcrumb = getBreadcrumb(currentFolderId);

                // Filter items trong folder hiện tại + search
                const subFolders = folders.filter(f =>
                  f.parentId === currentFolderId &&
                  (docSearchQuery === '' || f.name.toLowerCase().includes(docSearchQuery.toLowerCase()))
                );
                const filteredDocs = docSearchQuery
                  ? documents.filter(d => d.name.toLowerCase().includes(docSearchQuery.toLowerCase()))
                  : documents.filter(d => d.folderId === currentFolderId);

                const fileTypeIcon = (t: string) => {
                  const m: Record<string, {color: string; label: string}> = {
                    pdf: { color: '#ff4d4f', label: 'PDF' },
                    docx: { color: '#1677ff', label: 'DOCX' },
                    doc: { color: '#1677ff', label: 'DOC' },
                    xlsx: { color: '#52c41a', label: 'XLSX' },
                    xls: { color: '#52c41a', label: 'XLS' },
                    png: { color: '#fa8c16', label: 'PNG' },
                    jpg: { color: '#fa8c16', label: 'JPG' },
                  };
                  return m[t] || { color: '#999', label: t?.toUpperCase() };
                };

                return (
                  <div className="space-y-4">
                    {/* Thanh công cụ */}
                    <Card className="glass-panel" styles={{ body: { padding: '12px 16px' } }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Input
                          prefix={<span style={{ opacity: 0.5 }}>🔍</span>}
                          placeholder="Tìm kiếm tài liệu, thư mục..."
                          value={docSearchQuery}
                          onChange={e => setDocSearchQuery(e.target.value)}
                          allowClear
                          style={{ flex: 1, minWidth: 200 }}
                        />
                        <Button
                          icon={<span>📁</span>}
                          onClick={() => setCreateModal({ visible: true, type: 'folder' })}
                        >
                          Tạo thư mục
                        </Button>
                        <Button
                          type="primary"
                          icon={<PaperClipOutlined />}
                          onClick={() => setCreateModal({ visible: true, type: 'document' })}
                        >
                          Tải lên
                        </Button>
                      </div>
                    </Card>

                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingLeft: 4 }}>
                      <span
                        style={{ cursor: 'pointer', color: '#1677ff', fontWeight: 500 }}
                        onClick={() => setCurrentFolderId(undefined)}
                      >
                        🏠 Tài liệu
                      </span>
                      {breadcrumb.map((f: any) => (
                        <span key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ opacity: 0.4 }}>›</span>
                          <span
                            style={{ cursor: 'pointer', color: '#1677ff', fontWeight: 500 }}
                            onClick={() => setCurrentFolderId(f.id)}
                          >
                            {f.name}
                          </span>
                        </span>
                      ))}
                    </div>

                    {/* Grid thư mục */}
                    {subFolders.length > 0 && (
                      <Card className="glass-panel" title="Thư mục" styles={{ body: { padding: '12px 16px' } }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                          {subFolders.map((f: any) => (
                            <div
                              key={f.id}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 12,
                                padding: '16px 12px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                position: 'relative',
                              }}
                              className="hover:scale-[1.03] hover:shadow-lg"
                              onDoubleClick={() => setCurrentFolderId(f.id)}
                              onClick={() => setCurrentFolderId(f.id)}
                            >
                              <div style={{ fontSize: 40, marginBottom: 6 }}>📁</div>
                              <div style={{ fontWeight: 500, fontSize: 13, wordBreak: 'break-word' }}>{f.name}</div>
                              <div style={{ position: 'absolute', top: 6, right: 6 }}>
                                <Button
                                  type="text" size="small"
                                  danger
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await folderApi.delete(f.id);
                                    setFolders(prev => prev.filter(x => x.id !== f.id));
                                    messageApi.success('Đã xóa thư mục');
                                  }}
                                >
                                  ✕
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Bảng tài liệu */}
                    <Card className="glass-panel" title={`Tài liệu${docSearchQuery ? ` — Kết quả tìm kiếm "${docSearchQuery}"` : ''}`}>
                      <Table
                        dataSource={filteredDocs}
                        rowKey="id"
                        locale={{ emptyText: 'Chưa có tài liệu nào trong thư mục này' }}
                        columns={[
                          {
                            title: 'Tên tài liệu', dataIndex: 'name', key: 'name',
                            render: (name: string, record: any) => {
                              const { color, label } = fileTypeIcon(record.fileType);
                              return (
                                <Space>
                                  <Tag color={color} style={{ minWidth: 44, textAlign: 'center' }}>{label}</Tag>
                                  <span>{name}</span>
                                </Space>
                              );
                            }
                          },
                          { title: 'Kích thước', dataIndex: 'fileSize', key: 'fileSize', width: 100 },
                          { title: 'Người tải', dataIndex: 'uploadedBy', key: 'uploadedBy', width: 140, render: (id: string) => staff.find(s => s.id === id)?.name || id },
                          { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 110 },
                          {
                            title: 'Vị trí',
                            key: 'folder',
                            width: 130,
                            render: (_: any, record: any) => {
                              const folder = folders.find(f => f.id === record.folderId);
                              return folder ? <Tag color="blue">📁 {folder.name}</Tag> : <Tag>📄 Gốc</Tag>;
                            }
                          },
                          {
                            title: 'Thao tác', key: 'action', width: 120,
                            render: (_: any, record: any) => (
                              <Space>
                                <Button type="link" size="small" onClick={() => messageApi.success(`Tải xuống: ${record.name}`)}>⬇ Tải</Button>
                                <Button type="link" size="small" danger onClick={async () => {
                                  await documentApi.delete(record.id);
                                  setDocuments(prev => prev.filter(d => d.id !== record.id));
                                  messageApi.success('Đã xóa tài liệu');
                                }}>Xóa</Button>
                              </Space>
                            )
                          }
                        ]}
                      />
                    </Card>
                  </div>
                );
              })()}

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
                      { 
                        title: 'Tên hợp đồng', 
                        dataIndex: 'title', 
                        key: 'title', 
                        render: (text, record) => (
                          <Space>
                            <a>{text}</a>
                            {record.attachmentName && (
                              <Tooltip title={`Đính kèm: ${record.attachmentName}`}>
                                <Button 
                                  type="text" 
                                  size="small" 
                                  style={{ padding: 0, height: 'auto' }}
                                  icon={<span style={{ cursor: 'pointer', fontSize: 13 }}>📎</span>} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    messageApi.success(`Tải file đính kèm: ${record.attachmentName}`);
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Space>
                        ) 
                      },
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
                        key: 'company',
                        label: '🏢 Thông tin doanh nghiệp',
                        children: (
                          <Card title="Cấu hình thông tin Doanh nghiệp & Logo" className="glass-panel">
                            <Form
                              form={companyForm}
                              layout="vertical"
                              initialValues={{
                                name: companyName,
                                logo: companyLogo,
                                address: companyAddress,
                                phone: companyPhone,
                                email: companyEmail,
                                taxId: companyTaxId
                              }}
                              onFinish={(values) => {
                                setCompanyName(values.name);
                                setCompanyLogo(values.logo);
                                if (values.address) setCompanyAddress(values.address);
                                if (values.phone) setCompanyPhone(values.phone);
                                if (values.email) setCompanyEmail(values.email);
                                if (values.taxId) setCompanyTaxId(values.taxId);

                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('app_company_name', values.name);
                                  localStorage.setItem('app_company_logo', values.logo);
                                  localStorage.setItem('app_company_address', values.address || '');
                                  localStorage.setItem('app_company_phone', values.phone || '');
                                  localStorage.setItem('app_company_email', values.email || '');
                                  localStorage.setItem('app_company_tax', values.taxId || '');
                                }
                                messageApi.success('Đã cập nhật tên và logo doanh nghiệp thành công!');
                              }}
                            >
                              <Row gutter={16}>
                                <Col xs={24} md={12}>
                                  <Form.Item name="name" label="Tên doanh nghiệp / Công ty Luật" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
                                    <Input placeholder="Ví dụ: CÔNG TY LUẬT NAM VIỆT" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item name="logo" label="Logo / Biểu tượng thương hiệu" rules={[{ required: true, message: 'Vui lòng chọn logo hoặc nhập biểu tượng' }]}>
                                    <Input placeholder="Nhập Emoji (vd: ⚖️, 🏛️, 🏢) hoặc đường dẫn/base64" />
                                  </Form.Item>
                                </Col>
                                
                                <Col span={24}>
                                  <div style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: 'rgba(22,119,255,0.05)', border: '1px solid rgba(22,119,255,0.2)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <Text strong>Logo xem trước:</Text>
                                      {companyLogo.startsWith('data:') || companyLogo.startsWith('http') || companyLogo.startsWith('/') ? (
                                        <img src={companyLogo} alt="Logo Preview" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, border: '1px solid #d9d9d9' }} />
                                      ) : (
                                        <span style={{ fontSize: 32 }}>{companyLogo}</span>
                                      )}
                                    </div>
                                    <Divider type="vertical" style={{ height: 32 }} />
                                    <Upload
                                      accept="image/*"
                                      showUploadList={false}
                                      beforeUpload={(file) => {
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                          const base64Url = e.target?.result as string;
                                          companyForm.setFieldsValue({ logo: base64Url });
                                          setCompanyLogo(base64Url);
                                          messageApi.success('Đã tải ảnh logo từ máy tính lên preview!');
                                        };
                                        reader.readAsDataURL(file);
                                        return false;
                                      }}
                                    >
                                      <Button icon={<PaperClipOutlined />}>Chọn tệp logo từ máy (.png, .jpg)</Button>
                                    </Upload>
                                  </div>
                                </Col>

                                <Col xs={24} md={12}>
                                  <Form.Item name="address" label="Địa chỉ trụ sở chính">
                                    <Input placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item name="phone" label="Số điện thoại hotline">
                                    <Input placeholder="028 1234 5678" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item name="email" label="Email doanh nghiệp">
                                    <Input placeholder="contact@lawfirm.com" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item name="taxId" label="Mã số thuế / Số ĐKKD">
                                    <Input placeholder="0312345678" />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                                Lưu thay đổi Doanh nghiệp
                              </Button>
                            </Form>
                          </Card>
                        )
                      },
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
          destroyOnHidden
          onCancel={() => { 
            setDetailModal({ visible: false, type: 'customer', data: null }); 
            setSelectedFile(null); 
            setCurrentAttachmentName(null); 
            editForm.resetFields(); 
          }}
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
                    key={detailModal.data?.id}
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
                      status: detailModal.data.status,
                      contractNumber: detailModal.data.contractNumber,
                      endDate: detailModal.data.endDate,
                      notes: detailModal.data.notes
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
                          <Select options={[{ value: 'Mới tiếp nhận', label: 'Mới tiếp nhận' }, { value: 'Đang giải quyết', label: 'Đang giải quyết' }, { value: 'Đang xử lý', label: 'Đang xử lý' }, { value: 'Chờ bổ sung', label: 'Chờ bổ sung' }, { value: 'Hoàn thành', label: 'Hoàn thành' }, { value: 'Đóng hồ sơ', label: 'Đóng hồ sơ' }]} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="contractNumber" label="Số hợp đồng">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="endDate" label="Ngày kết thúc">
                          <Input placeholder="YYYY-MM-DD (để trống nếu chưa kết thúc)" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="notes" label="Lưu ý quan trọng">
                          <Input.TextArea rows={2} />
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
                    key={detailModal.data?.id}
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
                      status: detailModal.data.status,
                      contractNumber: detailModal.data.contractNumber,
                      advancePayment: detailModal.data.advancePayment,
                      endDate: detailModal.data.endDate,
                      notes: detailModal.data.notes
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
                          <Select options={[{ value: 'Mới tiếp nhận', label: 'Mới tiếp nhận' }, { value: 'Đang giải quyết', label: 'Đang giải quyết' }, { value: 'Đang xử lý', label: 'Đang xử lý' }, { value: 'Đang thụ lý', label: 'Đang thụ lý' }, { value: 'Tạm đình chỉ', label: 'Tạm đình chỉ' }, { value: 'Hoàn thành', label: 'Hoàn thành' }, { value: 'Đóng hồ sơ', label: 'Đóng hồ sơ' }]} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="contractNumber" label="Số hợp đồng">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="advancePayment" label="Số tiền tạm ứng (VND)">
                          <InputNumber className="w-full" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v!.replace(/,/g, '') as unknown as number} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="endDate" label="Ngày kết thúc">
                          <Input placeholder="YYYY-MM-DD (để trống nếu chưa kết thúc)" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="notes" label="Lưu ý hồ sơ">
                          <Input.TextArea rows={2} />
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
                      title: detailModal.data?.title,
                      type: detailModal.data?.type,
                      scheduleDate: detailModal.data?.dateTime ? dayjs(detailModal.data.dateTime) : null,
                      scheduleTime: detailModal.data?.dateTime ? dayjs(detailModal.data.dateTime).format('HH:mm') : null,
                      staffIds: detailModal.data?.staffIds,
                      customerId: detailModal.data?.customerId,
                      notes: detailModal.data?.notes
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã lịch hẹn">
                          <Input value={detailModal.data?.id} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="type" label="Loại lịch" rules={[{ required: true, message: 'Chọn loại lịch' }]}>
                          <Select options={[{ value: 'Hẹn khách', label: 'Hẹn khách' }, { value: 'Họp nội bộ', label: 'Họp nội bộ' }, { value: 'Lịch tòa', label: 'Lịch tòa' }]} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="scheduleDate" label="Ngày" rules={[{ required: true, message: 'Chọn ngày' }]}>
                          <DatePicker className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="scheduleTime" label="Giờ" rules={[{ required: true, message: 'Chọn giờ' }]}>
                          <Select showSearch options={timeOptions} className="w-full" placeholder="Chọn giờ" />
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
                      title: detailModal.data?.title,
                      customerId: detailModal.data?.customerId,
                      value: detailModal.data?.value,
                      signDate: detailModal.data?.signDate,
                      expireDate: detailModal.data?.expireDate,
                      managerId: detailModal.data?.managerId,
                      status: detailModal.data?.status,
                      content: detailModal.data?.content,
                      attachmentName: detailModal.data?.attachmentName,
                      attachmentUrl: detailModal.data?.attachmentUrl
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Mã hợp đồng">
                          <Input value={detailModal.data?.id} disabled />
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
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="_contractFileEdit" label="File đính kèm (Hợp đồng scan/ký kết)">
                          {isMobile ? (
                            <div className="space-y-2">
                              <Upload
                                maxCount={1}
                                showUploadList={false}
                                beforeUpload={(file) => {
                                  setSelectedFile(file);
                                  editForm.setFieldsValue({
                                    attachmentName: file.name,
                                    attachmentUrl: `/uploads/${file.name}`
                                  });
                                  setCurrentAttachmentName(file.name);
                                  return false;
                                }}
                              >
                                <Button 
                                  type="dashed" 
                                  icon={<span>📸</span>} 
                                  block 
                                  size="large"
                                  style={{ height: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <span style={{ fontWeight: 500 }}>Thay đổi / Chụp lại hợp đồng</span>
                                </Button>
                              </Upload>
                              {(selectedFile || currentAttachmentName) && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                                  <span style={{ fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                    📎 {selectedFile ? selectedFile.name : currentAttachmentName}
                                  </span>
                                  <Button type="text" danger size="small" onClick={() => { setSelectedFile(null); editForm.setFieldsValue({ attachmentName: '', attachmentUrl: '' }); setCurrentAttachmentName(null); }}>Xóa</Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload.Dragger
                                maxCount={1}
                                beforeUpload={(file) => {
                                  setSelectedFile(file);
                                  editForm.setFieldsValue({
                                    attachmentName: file.name,
                                    attachmentUrl: `/uploads/${file.name}`
                                  });
                                  setCurrentAttachmentName(file.name);
                                  return false;
                                }}
                                onRemove={() => {
                                  setSelectedFile(null);
                                  editForm.setFieldsValue({ attachmentName: '', attachmentUrl: '' });
                                  setCurrentAttachmentName(null);
                                }}
                              >
                                <p style={{ fontSize: 24, margin: '4px 0' }}>📄</p>
                                <p style={{ fontWeight: 500, fontSize: 13 }}>Kéo thả file hợp đồng mới vào đây</p>
                                <p style={{ opacity: 0.5, fontSize: 11 }}>hoặc click để chọn file thay thế</p>
                              </Upload.Dragger>
                              {(selectedFile || currentAttachmentName) && !selectedFile && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
                                  <span style={{ fontSize: 13 }}>📄 File hiện tại: <strong>{currentAttachmentName}</strong></span>
                                  <Button type="link" size="small" onClick={() => messageApi.success(`Tải file: ${currentAttachmentName}`)}>Tải xuống</Button>
                                </div>
                              )}
                            </div>
                          )}
                        </Form.Item>
                        <Form.Item name="attachmentName" hidden><Input /></Form.Item>
                        <Form.Item name="attachmentUrl" hidden><Input /></Form.Item>
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
          title={`Tạo mới ${createModal.type === 'customer' ? 'Khách hàng' : createModal.type === 'profile' ? 'Hồ sơ' : createModal.type === 'lawsuit' ? 'Vụ án' : createModal.type === 'task' ? 'Công việc' : createModal.type === 'schedule' ? 'Lịch hẹn' : createModal.type === 'revenue' ? 'Doanh thu' : createModal.type === 'expense' ? 'Chi phí' : createModal.type === 'contract' ? 'Hợp đồng' : createModal.type === 'leave' ? 'Đơn nghỉ phép' : createModal.type === 'staff' ? 'Nhân viên' : createModal.type === 'folder' ? 'Thư mục' : createModal.type === 'document' ? 'Tài liệu' : 'Chấm công'}`}
          open={createModal.visible}
          onCancel={() => { setCreateModal({ visible: false, type: '' }); setSelectedFile(null); form.resetFields(); }}
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
                <Form.Item name="contractNumber" label="Số hợp đồng">
                  <Input placeholder="HDDV-01/2026" />
                </Form.Item>
                <Form.Item name="serviceType" label="Loại dịch vụ" rules={[{ required: true }]}>
                  <Select options={[{ value: 'Đất đai', label: 'Đất đai' }, { value: 'Sổ đỏ', label: 'Sổ đỏ' }, { value: 'Khai sinh', label: 'Khai sinh' }, { value: 'Hộ tịch', label: 'Hộ tịch' }, { value: 'Giấy phép', label: 'Giấy phép' }, { value: 'Doanh nghiệp', label: 'Doanh nghiệp' }, { value: 'Khác', label: 'Khác' }]} />
                </Form.Item>
                <Form.Item name="managerId" label="Người phụ trách" rules={[{ required: true }]}>
                  <Select options={staff.map(s => ({ value: s.id, label: `${s.name} (${departments.find(d => d.id === s.departmentId)?.name || ''})` }))} />
                </Form.Item>
                <Form.Item name="deadline" label="Hạn xử lý" rules={[{ required: true }]}>
                  <DatePicker className="w-full" />
                </Form.Item>
                <Form.Item name="price" label="Giá trị dịch vụ (VND)" rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') as any} parser={(v) => (v ? v.replace(/\$\s?|(,*)/g, '') : '') as any} />
                </Form.Item>
                <Form.Item name="status" label="Tình trạng" initialValue="Mới tiếp nhận">
                  <Select options={[{ value: 'Mới tiếp nhận', label: 'Mới tiếp nhận' }, { value: 'Đang giải quyết', label: 'Đang giải quyết' }, { value: 'Đang xử lý', label: 'Đang xử lý' }, { value: 'Chờ bổ sung', label: 'Chờ bổ sung' }, { value: 'Hoàn thành', label: 'Hoàn thành' }]} />
                </Form.Item>
                <Form.Item name="endDate" label="Ngày kết thúc (Không bắt buộc)">
                  <DatePicker className="w-full" placeholder="Chọn ngày kết thúc (nếu hồ sơ đã xong)" />
                </Form.Item>
                <Form.Item name="notes" label="Lưu ý">
                  <Input.TextArea rows={2} placeholder="Ghi chú quan trọng cho quản lý..." />
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
                <Form.Item name="contractNumber" label="Số hợp đồng">
                  <Input placeholder="HDTT-02/2026" />
                </Form.Item>
                <Form.Item name="lawsuitType" label="Loại vụ án" rules={[{ required: true }]}>
                  <Select options={[{ value: 'Dân sự', label: 'Dân sự' }, { value: 'Hình sự', label: 'Hình sự' }, { value: 'Hôn nhân gia đình', label: 'Hôn nhân gia đình' }, { value: 'Đất đai', label: 'Đất đai' }, { value: 'Lao động', label: 'Lao động' }, { value: 'Kinh doanh thương mại', label: 'Kinh doanh thương mại' }, { value: 'Khác', label: 'Khác' }]} />
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
                <Form.Item name="advancePayment" label="Tạm ứng (VND)">
                  <InputNumber className="w-full" min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') as any} parser={(v) => (v ? v.replace(/\$\s?|(,*)/g, '') : '') as any} />
                </Form.Item>
                <Form.Item name="status" label="Tình trạng" initialValue="Mới tiếp nhận">
                  <Select options={[{ value: 'Mới tiếp nhận', label: 'Mới tiếp nhận' }, { value: 'Đang giải quyết', label: 'Đang giải quyết' }, { value: 'Đang thụ lý', label: 'Đang thụ lý' }, { value: 'Đang chuẩn bị xét xử', label: 'Đang chuẩn bị xét xử' }, { value: 'Hoàn thành', label: 'Hoàn thành' }]} />
                </Form.Item>
                <Form.Item name="endDate" label="Ngày kết thúc (Không bắt buộc)">
                  <DatePicker className="w-full" placeholder="Chọn ngày kết thúc (nếu vụ án đã xong)" />
                </Form.Item>
                <Form.Item name="notes" label="Lưu ý hồ sơ">
                  <Input.TextArea rows={2} placeholder="Ghi chú lưu ý về hồ sơ, nhân viên đang xử lý..." />
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
                <Form.Item name="_contractFileUpload" label="File đính kèm (Hợp đồng scan/ký kết)">
                  {isMobile ? (
                    <div className="space-y-2">
                      <Upload
                        maxCount={1}
                        showUploadList={false}
                        beforeUpload={(file) => {
                          setSelectedFile(file);
                          form.setFieldsValue({
                            attachmentName: file.name,
                            attachmentUrl: `/uploads/${file.name}`
                          });
                          return false;
                        }}
                      >
                        <Button 
                          type="dashed" 
                          icon={<span>📸</span>} 
                          block 
                          size="large"
                          style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <span style={{ fontWeight: 500 }}>Chụp ảnh hợp đồng / Chọn tệp</span>
                          <span style={{ fontSize: 10, opacity: 0.5 }}>Hỗ trợ PDF, DOCX, Ảnh chụp...</span>
                        </Button>
                      </Upload>
                      {selectedFile && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, marginTop: 8 }}>
                          <span style={{ fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                            📎 {selectedFile.name}
                          </span>
                          <Button type="text" danger size="small" onClick={() => { setSelectedFile(null); form.setFieldsValue({ attachmentName: '', attachmentUrl: '' }); }}>Xóa</Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Upload.Dragger
                      maxCount={1}
                      beforeUpload={(file) => {
                        setSelectedFile(file);
                        form.setFieldsValue({
                          attachmentName: file.name,
                          attachmentUrl: `/uploads/${file.name}`
                        });
                        return false;
                      }}
                      onRemove={() => {
                        setSelectedFile(null);
                        form.setFieldsValue({ attachmentName: '', attachmentUrl: '' });
                      }}
                    >
                      <p style={{ fontSize: 24, margin: '4px 0' }}>📄</p>
                      <p style={{ fontWeight: 500, fontSize: 13 }}>Kéo thả file hợp đồng vào đây</p>
                      <p style={{ opacity: 0.5, fontSize: 11 }}>hoặc click để chọn từ máy tính</p>
                    </Upload.Dragger>
                  )}
                </Form.Item>
                <Form.Item name="attachmentName" hidden><Input /></Form.Item>
                <Form.Item name="attachmentUrl" hidden><Input /></Form.Item>
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

            {createModal.type === 'folder' && (
              <>
                <Form.Item name="name" label="Tên thư mục" rules={[{ required: true, message: 'Nhập tên thư mục' }]}>
                  <Input placeholder="VD: Hồ sơ khách hàng 2026" />
                </Form.Item>
                <Form.Item name="parentId" label="Thư mục cha" initialValue={currentFolderId}>
                  <Select
                    allowClear
                    placeholder="Không chọn = lưu vào gốc"
                    options={[
                      { value: '', label: '🏠 Tầng gốc (Root)' },
                      ...folders.map(f => ({ value: f.id, label: `📁 ${f.name}` }))
                    ]}
                  />
                </Form.Item>
                <Form.Item name="createdBy" label="Người tạo" initialValue="NV-001">
                  <Select options={staff.map(s => ({ value: s.id, label: s.name }))} />
                </Form.Item>
              </>
            )}

            {createModal.type === 'document' && (
              <>
                {/* Vùng chọn file responsive */}
                <Form.Item
                  name="_fileUpload"
                  label="Chọn file tài liệu"
                  rules={[{ required: !selectedFile, message: 'Vui lòng chọn một file' }]}
                >
                  {isMobile ? (
                    <div className="space-y-2">
                      <Upload
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        maxCount={1}
                        showUploadList={false}
                        beforeUpload={(file) => {
                          setSelectedFile(file);
                          const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
                          const validTypes = ['pdf','doc','docx','xls','xlsx','png','jpg'];
                          const fileType = validTypes.includes(ext) ? ext : 'pdf';
                          const sizeMB = (file.size / 1024 / 1024).toFixed(1);
                          form.setFieldsValue({
                            name: file.name,
                            fileType,
                            fileSize: `${sizeMB} MB`,
                            fileUrl: `/uploads/${file.name}`,
                          });
                          return false; // ngăn upload thực (demo)
                        }}
                      >
                        <Button 
                          type="dashed" 
                          icon={<span style={{ marginRight: 6 }}>📸</span>} 
                          block 
                          size="large"
                          style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <span style={{ fontWeight: 500 }}>Chụp ảnh tài liệu / Chọn file</span>
                          <span style={{ fontSize: 10, opacity: 0.5 }}>Hỗ trợ chụp trực tiếp bằng Camera hoặc chọn tệp</span>
                        </Button>
                      </Upload>
                      
                      {selectedFile && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '8px 12px', 
                          background: 'rgba(255,255,255,0.06)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: 8,
                          marginTop: 8
                        }}>
                          <span style={{ fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                            📎 {selectedFile.name}
                          </span>
                          <Button 
                            type="text" 
                            danger 
                            size="small" 
                            onClick={() => {
                              setSelectedFile(null);
                              form.setFieldsValue({ name: '', fileSize: '', fileUrl: '' });
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Upload.Dragger
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      maxCount={1}
                      beforeUpload={(file) => {
                        setSelectedFile(file);
                        // Tự động điền thông tin vào form
                        const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
                        const validTypes = ['pdf','doc','docx','xls','xlsx','png','jpg'];
                        const fileType = validTypes.includes(ext) ? ext : 'pdf';
                        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
                        form.setFieldsValue({
                          name: file.name,
                          fileType,
                          fileSize: `${sizeMB} MB`,
                          fileUrl: `/uploads/${file.name}`,
                        });
                        return false; // ngăn upload thực (demo)
                      }}
                      onRemove={() => {
                        setSelectedFile(null);
                        form.setFieldsValue({ name: '', fileSize: '', fileUrl: '' });
                      }}
                    >
                      <p style={{ fontSize: 32, margin: '8px 0' }}>📂</p>
                      <p style={{ fontWeight: 500 }}>Kéo thả file vào đây</p>
                      <p style={{ opacity: 0.5, fontSize: 12 }}>hoặc nhấn để chọn file từ máy tính (PDF, DOCX, XLSX, PNG...)</p>
                    </Upload.Dragger>
                  )}
                </Form.Item>

                <Form.Item name="name" label="Tên tài liệu" rules={[{ required: true, message: 'Vui lòng chọn file hoặc nhập tên' }]}>
                  <Input placeholder="Tự động điền khi chọn file" />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="fileType" label="Định dạng" initialValue="pdf">
                      <Select options={[
                        { value: 'pdf', label: 'PDF' },
                        { value: 'docx', label: 'DOCX' },
                        { value: 'doc', label: 'DOC' },
                        { value: 'xlsx', label: 'XLSX' },
                        { value: 'xls', label: 'XLS' },
                        { value: 'png', label: 'PNG' },
                        { value: 'jpg', label: 'JPG' },
                      ]} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="fileSize" label="Dung lượng" initialValue="">
                      <Input placeholder="Tự động điền" readOnly />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="folderId" label="Lưu vào thư mục" initialValue={currentFolderId || ''}>
                  <Select
                    allowClear
                    placeholder="Không chọn = lưu vào gốc"
                    options={[
                      { value: '', label: '🏠 Tầng gốc (Root)' },
                      ...folders.map(f => ({ value: f.id, label: `📁 ${f.name}` }))
                    ]}
                  />
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
                <Form.Item name="uploadedBy" label="Người tải lên" rules={[{ required: true, message: 'Chọn người tải' }]}>
                  <Select options={staff.map(s => ({ value: s.id, label: s.name }))} />
                </Form.Item>
                <Form.Item name="fileUrl" hidden initialValue="/uploads/file.pdf">
                  <Input />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        {/* Modal tạo Công văn */}
        <Modal
          title="Thêm công văn đến/đi mới"
          open={dispatchModalOpen}
          onCancel={() => { setDispatchModalOpen(false); dispatchForm.resetFields(); }}
          onOk={() => {
            dispatchForm.validateFields().then(values => {
              const newDispatch = {
                id: `CV-${Date.now()}`,
                number: values.number,
                type: values.type,
                content: values.content,
                unit: values.unit,
                date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                handler: values.handler
              };
              setDispatches([newDispatch, ...dispatches]);
              message.success('Đã thêm công văn mới thành công!');
              setDispatchModalOpen(false);
              dispatchForm.resetFields();
            });
          }}
        >
          <Form form={dispatchForm} layout="vertical">
            <Form.Item name="number" label="Số công văn" rules={[{ required: true, message: 'Nhập số công văn' }]}>
              <Input placeholder="102/2026/CV-STP" />
            </Form.Item>
            <Form.Item name="type" label="Loại công văn" initialValue="Công văn đến" rules={[{ required: true }]}>
              <Select options={[{ value: 'Công văn đến', label: 'Công văn đến' }, { value: 'Công văn đi', label: 'Công văn đi' }]} />
            </Form.Item>
            <Form.Item name="content" label="Nội dung trích yếu" rules={[{ required: true, message: 'Nhập nội dung' }]}>
              <Input.TextArea rows={2} placeholder="Trích yếu nội dung công văn..." />
            </Form.Item>
            <Form.Item name="unit" label="Đơn vị gửi/nhận">
              <Input placeholder="Sở Tư Pháp / TAND Quận 1 / Khách hàng..." />
            </Form.Item>
            <Form.Item name="date" label="Ngày phát hành / nhận" initialValue={dayjs()}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="handler" label="Người xử lý" initialValue="Nguyễn Văn Trưởng" rules={[{ required: true }]}>
              <Select options={staff.map(s => ({ value: s.name, label: s.name }))} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo Kỷ luật */}
        <Modal
          title="Thêm quyết định kỷ luật lao động"
          open={disciplineModalOpen}
          onCancel={() => { setDisciplineModalOpen(false); disciplineForm.resetFields(); }}
          onOk={() => {
            disciplineForm.validateFields().then(values => {
              const newDisc = {
                id: `KL-${Date.now()}`,
                staffName: values.staffName,
                type: values.type,
                reason: values.reason,
                date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                notes: values.notes
              };
              setDisciplines([newDisc, ...disciplines]);
              message.success('Đã ghi nhận quyết định kỷ luật!');
              setDisciplineModalOpen(false);
              disciplineForm.resetFields();
            });
          }}
        >
          <Form form={disciplineForm} layout="vertical">
            <Form.Item name="staffName" label="Nhân viên bị kỷ luật" rules={[{ required: true, message: 'Chọn nhân viên' }]}>
              <Select options={staff.map(s => ({ value: s.name, label: s.name }))} />
            </Form.Item>
            <Form.Item name="type" label="Hình thức kỷ luật" initialValue="Nhắc nhở" rules={[{ required: true }]}>
              <Select options={[{ value: 'Nhắc nhở', label: 'Nhắc nhở' }, { value: 'Khiển trách', label: 'Khiển trách' }, { value: 'Cảnh cáo', label: 'Cảnh cáo' }, { value: 'Phạt tiền', label: 'Phạt tiền' }, { value: 'Sa thải', label: 'Sa thải' }]} />
            </Form.Item>
            <Form.Item name="reason" label="Lý do kỷ luật" rules={[{ required: true, message: 'Nhập lý do' }]}>
              <Input.TextArea rows={2} placeholder="Nêu rõ lý do kỷ luật..." />
            </Form.Item>
            <Form.Item name="date" label="Ngày quyết định" initialValue={dayjs()}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <Input placeholder="Ghi chú thêm..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo Khen thưởng */}
        <Modal
          title="Thêm quyết định khen thưởng"
          open={rewardModalOpen}
          onCancel={() => { setRewardModalOpen(false); rewardForm.resetFields(); }}
          onOk={() => {
            rewardForm.validateFields().then(values => {
              const newRew = {
                id: `KT-${Date.now()}`,
                staffName: values.staffName,
                type: values.type,
                reason: values.reason,
                bonus: values.bonus || 0,
                date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                notes: values.notes
              };
              setRewards([newRew, ...rewards]);
              message.success('Đã ghi nhận khen thưởng thành công!');
              setRewardModalOpen(false);
              rewardForm.resetFields();
            });
          }}
        >
          <Form form={rewardForm} layout="vertical">
            <Form.Item name="staffName" label="Nhân viên khen thưởng" rules={[{ required: true, message: 'Chọn nhân viên' }]}>
              <Select options={staff.map(s => ({ value: s.name, label: s.name }))} />
            </Form.Item>
            <Form.Item name="type" label="Hình thức khen thưởng" initialValue="Bằng khen" rules={[{ required: true }]}>
              <Select options={[{ value: 'Bằng khen', label: 'Bằng khen' }, { value: 'Tiền thưởng', label: 'Tiền thưởng' }, { value: 'Nhân viên của tháng', label: 'Nhân viên của tháng' }, { value: 'Khác', label: 'Khác' }]} />
            </Form.Item>
            <Form.Item name="reason" label="Lý do khen thưởng" rules={[{ required: true, message: 'Nhập lý do' }]}>
              <Input.TextArea rows={2} placeholder="Nêu lý do khen thưởng..." />
            </Form.Item>
            <Form.Item name="bonus" label="Số tiền thưởng (VND)">
              <InputNumber className="w-full" min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') as any} parser={(v) => (v ? v.replace(/\$\s?|(,*)/g, '') : '') as any} />
            </Form.Item>
            <Form.Item name="date" label="Ngày quyết định" initialValue={dayjs()}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <Input placeholder="Ghi chú thêm..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
    </>
  );
}
