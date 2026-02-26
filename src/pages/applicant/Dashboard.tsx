import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, Bell, ArrowRight, User as UserIcon, Briefcase } from 'lucide-react';
import { Application } from '../../types';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const ApplicantDashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`/api/applications?user_id=${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchApplications();
  }, [user]);

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending Reviews', value: applications.filter(a => a.status === 'Pending').length, icon: Clock, color: 'bg-warning' },
    { label: 'Notifications', value: 1, icon: Bell, color: 'bg-primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark">Welcome, {user?.first_name}</h1>
        <p className="text-gray-500">Track your job applications and explore new opportunities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-dark">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border-gray flex justify-between items-center">
            <h2 className="font-bold text-dark">Recent Applications</h2>
            <button onClick={() => setActiveTab('applications')} className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-border-gray">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Loading applications...</div>
            ) : applications.length > 0 ? (
              applications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-dark text-sm">{app.job_title}</p>
                    <p className="text-xs text-gray-500 mt-1">Ref: {app.ref_number}</p>
                  </div>
                  <span className={`badge-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">You haven't applied for any jobs yet.</p>
                <button onClick={() => setActiveTab('jobs')} className="btn-primary mt-4 text-xs">Browse Available Jobs</button>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-dark mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => setActiveTab('profile')} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-primary shadow-sm">
                    <UserIcon size={18} />
                  </div>
                  <span className="text-sm font-medium text-dark">Complete Your Profile</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
              </button>
              <button onClick={() => setActiveTab('jobs')} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-primary shadow-sm">
                    <Briefcase size={18} />
                  </div>
                  <span className="text-sm font-medium text-dark">Search Open Positions</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Pro Tip</p>
            <p className="text-xs text-gray-600 leading-relaxed">Ensure your profile is 100% complete to increase your chances of being shortlisted for government positions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
