export type UserRole = 'admin' | 'editor' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Member {
  id: string;
  name: string;
  membershipId: string;
  status: 'active' | 'inactive' | 'suspended';
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  dues: number;
  lastPayment?: string;
  joinedDate?: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  monthlyCollection: number;
  pendingDues: number;
  upcomingEvents: number;
  recentExpenses: number;
  recentActivity: ActivityItem[];
  announcements: Announcement[];
  chartData: ChartDataPoint[];
  totalBalance: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  desc: string;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  author?: string;
}

export interface ChartDataPoint {
  name: string;
  collection: number;
  expenses: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  status: 'published' | 'draft' | 'cancelled';
}

export interface Transaction {
  id: string;
  memberId?: string;
  name: string;
  amount: number;
  type: string;
  date: string;
  method: 'cash' | 'bank_transfer' | 'online';
  status: 'completed' | 'pending' | 'failed';
}
