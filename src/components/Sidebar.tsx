import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User as UserIcon, 
  Bell, 
  LogOut,
  Users,
  Settings,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const applicantItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Available Jobs', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const adminItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-jobs', label: 'Job Management', icon: Briefcase },
    { id: 'admin-applications', label: 'Applications', icon: FileText },
    { id: 'admin-applicants', label: 'Applicants', icon: Users },
    { id: 'admin-reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin-settings', label: 'System Settings', icon: Settings },
  ];

  const items = isAdmin ? adminItems : applicantItems;

  return (
    <div className="w-64 bg-white border-r border-border-gray h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-border-gray flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden">
          <img 
            src="/logo.png" 
            alt="IEBC Logo" 
            className="w-10 h-10 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl';
                fallback.innerText = 'IEBC';
                parent.appendChild(fallback);
              }
            }}
          />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight text-dark">Job Portal</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{isAdmin ? 'Administrator' : 'Applicant'}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-dark'
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border-gray">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
