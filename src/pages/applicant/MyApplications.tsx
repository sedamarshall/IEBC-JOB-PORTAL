import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';
import { Application } from '../../types';

const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredApplications = applications.filter(app => 
    app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.ref_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="text-warning" />;
      case 'Shortlisted': return <CheckCircle size={16} className="text-success" />;
      case 'Rejected': return <XCircle size={16} className="text-danger" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">My Applications</h1>
          <p className="text-gray-500">Track the status of your submitted job applications.</p>
        </div>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by job or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-border-gray">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reference Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Applied</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-dark text-sm">{app.job_title}</p>
                      <p className="text-xs text-gray-500">{app.department}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {app.ref_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span className={`badge-${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary text-xs font-bold hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 glass-card">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-dark mb-1">No Applications Found</h3>
          <p className="text-gray-500">You haven't submitted any applications matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
