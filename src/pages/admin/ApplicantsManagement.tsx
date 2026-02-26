import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, UserCheck, UserX, UserMinus, Eye, Download } from 'lucide-react';
import { User } from '../../types';

const ApplicantsManagement: React.FC = () => {
  const [applicants, setApplicants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setApplicants(data);
        }
      } catch (error) {
        console.error('Error fetching applicants:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicants();
  }, []);

  const filteredApplicants = applicants.filter(app => 
    app.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.doc_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Applicants Management</h1>
          <p className="text-gray-500">View and manage all registered job seekers.</p>
        </div>
        <button className="btn-outline flex items-center gap-2 self-start text-xs">
          <Download size={16} /> Export List (Excel)
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name or ID number..."
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
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-border-gray">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">County</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registered On</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                {filteredApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-dark text-sm">{app.first_name} {app.last_name}</p>
                      <p className="text-xs text-gray-500">{app.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{app.doc_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{app.county}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-2 text-gray-400 hover:text-primary transition-colors" title="View Profile">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-success transition-colors" title="Enable Account">
                        <UserCheck size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-danger transition-colors" title="Disable Account">
                        <UserX size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredApplicants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No applicants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsManagement;
