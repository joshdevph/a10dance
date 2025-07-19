// src/components/Dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AttendanceTab from './tabs/AttendanceTab';
import QuizTab from './tabs/QuizTab';
import ExamTab from './tabs/ExamTab';
import QrScannerTab from './tabs/QrScannerTab';
import MyQrTab from './tabs/MyQrTab';
import { LogOut, Menu, X } from 'lucide-react'; // Added X for close icon

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'quiz' | 'exam' | 'qrscanner' | 'myqr'>('attendance');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  const isAdmin = user?.isAdmin || user?.email === 'joshuadignadice24@gmail.com';
  const tabs: Array<'attendance' | 'quiz' | 'exam' | 'qrscanner' | 'myqr'> = isAdmin
    ? ['attendance', 'quiz', 'exam', 'qrscanner', 'myqr']
    : ['myqr'];

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (!isAdmin && activeTab !== 'myqr') setActiveTab('myqr');
  }, [user, authLoading, isAdmin, activeTab, navigate]);

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-xl">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b bg-white relative z-10">
        {/* Desktop Tabs */}
        <div className="hidden sm:flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-lg text-base font-medium transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'qrscanner'
                ? 'QR Scanner'
                : tab === 'myqr'
                ? 'My QR'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="text-gray-600 hover:text-blue-600 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Logout Icon */}
        <button
          onClick={logout}
          title="Logout"
          className="text-gray-500 hover:text-red-500 transition"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Mobile Dropdown with animation */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-2 bg-white border-b flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
              }`}
              onClick={() => {
                setActiveTab(tab);
                setMenuOpen(false);
              }}
            >
              {tab === 'qrscanner'
                ? 'QR Scanner'
                : tab === 'myqr'
                ? 'My QR'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow px-4 py-6 overflow-auto">
        {activeTab === 'attendance' && isAdmin && <AttendanceTab />}
        {activeTab === 'quiz' && isAdmin && <QuizTab />}
        {activeTab === 'exam' && isAdmin && <ExamTab />}
        {activeTab === 'qrscanner' && isAdmin && <QrScannerTab />}
        {activeTab === 'myqr' && <MyQrTab />}
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-gray-400 text-xs border-t">
        Powered by Appwrite + Vite + React
      </footer>
    </div>
  );
};

export default Dashboard;
