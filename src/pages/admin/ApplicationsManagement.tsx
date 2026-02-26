import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Loader2, CheckCircle, XCircle, Clock, Eye, Download, X } from 'lucide-react';
import { Application } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const ApplicationsManagement: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        setApplications(await response.json());
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setApplications(applications.map(app => app.id === id ? { ...app, status: status as any } : app));
        if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, status: status as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.ref_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Applications Management</h1>
          <p className="text-gray-500">Review and process job applications.</p>
        </div>
        <button className="btn-outline flex items-center gap-2 self-start text-xs">
          <Download size={16} /> Export All (CSV)
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, job, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm bg-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full md:w-40 px-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-border-gray">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">County</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Applied</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-dark text-sm">{app.first_name} {app.last_name}</p>
                      <p className="text-xs text-gray-500">ID: {app.doc_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-dark font-medium">{app.job_title}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{app.ref_number}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{app.county}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`badge-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Review Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border-gray flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-dark">Review Application</h2>
                  <p className="text-xs text-gray-500 mt-1">Ref: {selectedApp.ref_number}</p>
                </div>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-dark">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-border-gray pb-2">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="text-sm font-semibold text-dark">{selectedApp.first_name} {selectedApp.last_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">ID Number</p>
                          <p className="text-sm font-semibold text-dark">{selectedApp.doc_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">County</p>
                          <p className="text-sm font-semibold text-dark">{selectedApp.county}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Applied On</p>
                          <p className="text-sm font-semibold text-dark">{new Date(selectedApp.applied_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-border-gray pb-2">Job Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-bold text-dark">{selectedApp.job_title}</p>
                        <p className="text-xs text-gray-600 mt-1">{selectedApp.department}</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-border-gray pb-2">Admin Remarks</h3>
                      <textarea 
                        rows={3}
                        placeholder="Add internal notes about this application..."
                        className="w-full text-sm border border-border-gray rounded-lg p-3 focus:ring-primary focus:border-primary"
                      ></textarea>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card p-6">
                      <h3 className="text-sm font-bold text-dark mb-4">Application Status</h3>
                      <div className="flex flex-col gap-3">
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${
                          selectedApp.status === 'Pending' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-gray-50 text-gray-400'
                        }`}>
                          <Clock size={20} />
                          <span className="font-bold text-sm">Pending</span>
                        </div>
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${
                          selectedApp.status === 'Shortlisted' ? 'bg-success/10 text-success border border-success/20' : 'bg-gray-50 text-gray-400'
                        }`}>
                          <CheckCircle size={20} />
                          <span className="font-bold text-sm">Shortlisted</span>
                        </div>
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${
                          selectedApp.status === 'Rejected' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-gray-50 text-gray-400'
                        }`}>
                          <XCircle size={20} />
                          <span className="font-bold text-sm">Rejected</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button 
                        onClick={() => handleUpdateStatus(selectedApp.id, 'Shortlisted')}
                        disabled={isUpdating || selectedApp.status === 'Shortlisted'}
                        className="w-full btn-primary bg-success hover:bg-success/90 flex items-center justify-center gap-2"
                      >
                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Shortlist Applicant'}
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                        disabled={isUpdating || selectedApp.status === 'Rejected'}
                        className="w-full btn-primary bg-danger hover:bg-danger/90 flex items-center justify-center gap-2"
                      >
                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Reject Application'}
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedApp.id, 'Pending')}
                        disabled={isUpdating || selectedApp.status === 'Pending'}
                        className="w-full btn-outline flex items-center justify-center gap-2"
                      >
                        Mark as Pending
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationsManagement;
