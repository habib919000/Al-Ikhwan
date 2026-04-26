import React, { useState, useEffect } from 'react';

// Layout & UI
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import { Modal } from './components/ui/Modal';

// Forms
import { MemberForm } from './components/forms/MemberForm';
import { PaymentForm } from './components/forms/PaymentForm';
import { ExpenseForm } from './components/forms/ExpenseForm';
import { EventForm } from './components/forms/EventForm';
import { AnnouncementForm } from './components/forms/AnnouncementForm';

// Pages
import { Dashboard } from './pages/Dashboard';
import { MemberManagement } from './pages/MemberManagement';
import { MemberProfile } from './pages/MemberProfile';
import { FinancialDashboard } from './pages/FinancialDashboard';
import { EventManagement } from './pages/EventManagement';
import { CommunicationCenter } from './pages/CommunicationCenter';
import { SettingsPage } from './pages/SettingsPage';
import { MemberDashboard } from './pages/MemberDashboard';

// Types & Lib
import { User, Member, DashboardStats, Event as EventType, Transaction } from './types';
import { apiFetch, getToken, removeToken } from './lib/api';
import Login from './Login';

// Globally replace fetch with authenticated apiFetch
window.fetch = apiFetch as any;

// Mock Data (Ideally moved to a context or service)
const MOCK_USER: User = {
  id: 'admin-1',
  email: 'admin@alikhwan.org',
  role: 'admin',
  name: 'Administrator'
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [totalMembers, setTotalMembers] = useState(0);
  const [memberPage, setMemberPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      
      const user = meData.user || meData.member || meData;
      if (meData.role) user.role = meData.role; // Ensure role is attached
      setCurrentUser(user);
      
      if (meData.role === 'member') {
        setMemberData(meData);
        setLoading(false);
        return;
      }

      const [statsRes, membersRes, eventsRes, transRes] = await Promise.all([
        fetch('/api/stats'),
        fetch(`/api/members?page=${memberPage}&limit=10`),
        fetch('/api/events'),
        fetch('/api/transactions')
      ]);
      setStats(await statsRes.json());
      
      const membersData = await membersRes.json();
      setMembers(membersData.data || []);
      setTotalMembers(membersData.total || 0);

      const eventsData = await eventsRes.json();
      setEvents(eventsData.data || eventsData);

      const transData = await transRes.json();
      setTransactions(transData.data || transData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, memberPage]);

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
  };

  const renderContent = () => {
    if (currentUser?.role === 'member') {
      return <MemberDashboard memberData={memberData} onRefresh={fetchData} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            onAddMember={() => setIsMemberModalOpen(true)}
            onRecordPayment={() => setIsPaymentModalOpen(true)}
            onScheduleEvent={() => setIsEventModalOpen(true)}
            onSendAnnouncement={() => setIsAnnouncementModalOpen(true)}
          />
        );
      case 'members':
        return (
          <MemberManagement 
            members={members} 
            totalMembers={totalMembers}
            currentPage={memberPage}
            onPageChange={setMemberPage}
            currentUser={MOCK_USER}
            onAddMember={() => setIsMemberModalOpen(true)} 
            onViewProfile={(id) => {
              setSelectedMemberId(id);
              setActiveTab('member-profile');
            }}
            onRefresh={fetchData}
          />
        );
      case 'member-profile':
        return (
          <MemberProfile 
            memberId={selectedMemberId!} 
            currentUser={MOCK_USER}
            onBack={() => setActiveTab('members')}
            onRecordPayment={() => setIsPaymentModalOpen(true)}
            onRefresh={fetchData}
          />
        );
      case 'finance':
        return (
          <FinancialDashboard 
            stats={stats} 
            transactions={transactions} 
            onRecordPayment={() => setIsPaymentModalOpen(true)} 
            onRecordExpense={() => setIsExpenseModalOpen(true)} 
          />
        );
      case 'events':
        return <EventManagement events={events} onAddEvent={() => setIsEventModalOpen(true)} />;
      case 'communication':
        return (
          <CommunicationCenter 
            announcements={stats?.announcements || []} 
            onSendAnnouncement={() => setIsAnnouncementModalOpen(true)} 
          />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <Dashboard 
            stats={stats} 
            onAddMember={() => setIsMemberModalOpen(true)}
            onRecordPayment={() => setIsPaymentModalOpen(true)}
            onScheduleEvent={() => setIsEventModalOpen(true)}
            onSendAnnouncement={() => setIsAnnouncementModalOpen(true)}
          />
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={(userData) => {
      setCurrentUser(userData);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser || MOCK_USER} 
        onLogout={handleLogout} 
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar 
          activeTab={activeTab} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : renderContent()}
        </div>

        <MobileNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onAddPayment={() => setIsPaymentModalOpen(true)} 
        />
      </main>

      {/* Global Modals */}
      {isMemberModalOpen && (
        <Modal title="Add New Member" onClose={() => setIsMemberModalOpen(false)}>
          <MemberForm 
            onSuccess={() => {
              setIsMemberModalOpen(false);
              fetchData();
            }} 
          />
        </Modal>
      )}

      {isPaymentModalOpen && (
        <Modal title="Record Payment" onClose={() => setIsPaymentModalOpen(false)}>
          <PaymentForm 
            members={members}
            onSuccess={() => {
              setIsPaymentModalOpen(false);
              fetchData();
            }} 
          />
        </Modal>
      )}

      {isExpenseModalOpen && (
        <Modal title="Record Expense" onClose={() => setIsExpenseModalOpen(false)}>
          <ExpenseForm 
            onSuccess={() => {
              setIsExpenseModalOpen(false);
              fetchData();
            }} 
          />
        </Modal>
      )}

      {isEventModalOpen && (
        <Modal title="Schedule New Event" onClose={() => setIsEventModalOpen(false)}>
          <EventForm 
            onSuccess={() => {
              setIsEventModalOpen(false);
              fetchData();
            }} 
          />
        </Modal>
      )}

      {isAnnouncementModalOpen && (
        <Modal title="Send Announcement" onClose={() => setIsAnnouncementModalOpen(false)}>
          <AnnouncementForm 
            onSuccess={() => {
              setIsAnnouncementModalOpen(false);
              fetchData();
            }} 
          />
        </Modal>
      )}
    </div>
  );
}
