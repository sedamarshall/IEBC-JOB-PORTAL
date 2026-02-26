import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, Clock, CheckCircle, Loader2, TrendingUp, Users, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Failed to fetch statistics');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('An error occurred while fetching statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-gray-500 animate-pulse">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-card p-8 text-center max-w-lg mx-auto mt-12">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={32} />
        </div>
        <h2 className="text-xl font-bold text-dark mb-2">Unable to load dashboard</h2>
        <p className="text-gray-500 mb-6">{error || 'Something went wrong while loading the statistics.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary px-6"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const COLORS = ['#9dd167', '#f5c542', '#ff6b6b', '#4a90e2', '#8b572a'];

  const statCards = [
    { label: 'Total Jobs Posted', value: stats.totalJobs || 0, icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Total Applications', value: stats.totalApplications || 0, icon: FileText, color: 'bg-primary' },
    { label: 'Pending Reviews', value: stats.pendingReviews || 0, icon: Clock, color: 'bg-warning' },
    { label: 'Shortlisted', value: stats.shortlisted || 0, icon: CheckCircle, color: 'bg-success' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark">Administrator Dashboard</h1>
        <p className="text-gray-500">Overview of the recruitment portal activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
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
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="font-bold text-dark">Applications per Job</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.appsPerJob}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="title" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f6f8f9' }}
                />
                <Bar dataKey="count" fill="#9dd167" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={20} className="text-primary" />
            <h2 className="font-bold text-dark">Applications by County</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.appsPerCounty}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="county"
                >
                  {stats.appsPerCounty.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users size={20} className="text-primary" />
          <h2 className="font-bold text-dark">System Activity</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <p className="text-sm text-dark">System is operational</p>
            </div>
            <span className="text-xs text-gray-400">Last updated: Just now</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <p className="text-sm text-dark">Database backups are up to date</p>
            </div>
            <span className="text-xs text-gray-400">Last updated: 2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
