import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, Users, Calendar, Filter, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Reports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/reports/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching report stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#9dd167', '#2f2f2f', '#e6e6e6', '#3b82f6', '#f59e0b'];

  const reportTypes = [
    { title: 'Shortlisted Applicants', description: 'Download the list of all shortlisted candidates per job.', icon: Users, color: 'bg-success' },
    { title: 'Application Summary', description: 'General summary of applications received across all departments.', icon: BarChart3, color: 'bg-primary' },
    { title: 'County Distribution', description: 'Report on applicant distribution by county and constituency.', icon: Calendar, color: 'bg-warning' },
    { title: 'Gender & PWD Report', description: 'Diversity report including gender parity and PWD representation.', icon: FileText, color: 'bg-blue-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-dark">Reports & Analytics</h1>
        <p className="text-gray-500">Visualize recruitment data and generate exports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* County Distribution Chart */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-dark mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            Top 5 Counties by Applicants
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.countyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="county" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="count" fill="#9dd167" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Chart */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-dark mb-6 flex items-center gap-2">
            <PieChartIcon size={18} className="text-primary" />
            Application Status Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {stats?.statusStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Filter size={20} className="text-primary" />
          <h2 className="font-bold text-dark">Export Custom Reports</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Job Position</label>
            <select className="w-full text-sm border border-border-gray rounded-lg p-2 bg-white">
              <option>All Positions</option>
              <option>Voter Registration Clerk</option>
              <option>ICT Clerk</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">County</label>
            <select className="w-full text-sm border border-border-gray rounded-lg p-2 bg-white">
              <option>All Counties</option>
              <option>Nairobi</option>
              <option>Mombasa</option>
              <option>Kisumu</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date Range</label>
            <div className="flex items-center gap-2">
              <input type="date" className="w-full text-sm border border-border-gray rounded-lg p-2 bg-white" />
              <span className="text-gray-400">-</span>
              <input type="date" className="w-full text-sm border border-border-gray rounded-lg p-2 bg-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, i) => (
          <div key={i} className="glass-card p-6 flex items-start gap-6 hover:shadow-md transition-shadow group">
            <div className={`w-14 h-14 ${report.color} rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
              <report.icon size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-dark mb-2 group-hover:text-primary transition-colors">{report.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{report.description}</p>
              <div className="flex gap-2">
                <button className="flex-1 btn-primary text-xs flex items-center justify-center gap-2">
                  <Download size={14} /> PDF
                </button>
                <button className="flex-1 btn-outline text-xs flex items-center justify-center gap-2">
                  <Download size={14} /> Excel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
