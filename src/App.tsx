import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicantDashboard from './pages/applicant/Dashboard';
import AvailableJobs from './pages/applicant/AvailableJobs';
import MyApplications from './pages/applicant/MyApplications';
import MyProfile from './pages/applicant/MyProfile';
import Notifications from './pages/applicant/Notifications';
import AdminDashboard from './pages/admin/Dashboard';
import JobManagement from './pages/admin/JobManagement';
import ApplicationsManagement from './pages/admin/ApplicationsManagement';
import ApplicantsManagement from './pages/admin/ApplicantsManagement';
import AdminSettings from './pages/admin/Settings';
import Reports from './pages/admin/Reports';
import { AuthProvider } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  // Set default tab based on role
  React.useEffect(() => {
    if (user) {
      setActiveTab(user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return isRegistering ? (
      <Register onToggle={() => setIsRegistering(false)} />
    ) : (
      <Login onToggle={() => setIsRegistering(true)} />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      // Applicant Tabs
      case 'dashboard': return <ApplicantDashboard setActiveTab={setActiveTab} />;
      case 'jobs': return <AvailableJobs />;
      case 'applications': return <MyApplications />;
      case 'profile': return <MyProfile />;
      case 'notifications': return <Notifications />;
      
      // Admin Tabs
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-jobs': return <JobManagement />;
      case 'admin-applications': return <ApplicationsManagement />;
      case 'admin-applicants': return <ApplicantsManagement />;
      case 'admin-reports': return <Reports />;
      case 'admin-settings': return <AdminSettings />;
      
      default: return <div className="p-8">Page under construction: {activeTab}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
