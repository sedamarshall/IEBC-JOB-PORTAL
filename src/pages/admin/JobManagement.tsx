import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Edit2, Trash2, Loader2, X, Calendar, MapPin, Building2 } from 'lucide-react';
import { Job } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const JobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    location: '',
    deadline: '',
    status: 'Open'
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        setJobs(await response.json());
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        department: job.department,
        description: job.description || '',
        location: job.location,
        deadline: job.deadline,
        status: job.status
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        department: '',
        description: '',
        location: '',
        deadline: '',
        status: 'Open'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchJobs();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setJobs(jobs.filter(j => j.id !== id));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Job Management</h1>
          <p className="text-gray-500">Create and manage job openings for the portal.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={18} /> Create New Job
        </button>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search jobs..."
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-dark text-sm">{job.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(job.deadline).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        job.status === 'Open' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(job)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-gray-400 hover:text-danger transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Job Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="p-6 border-b border-border-gray flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-dark">
                  {editingJob ? 'Edit Job Opening' : 'Create New Job Opening'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Briefcase size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm"
                        placeholder="e.g. Senior ICT Officer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Building2 size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <MapPin size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        required
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="block w-full px-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="block w-full px-3 py-2 border border-border-gray rounded-lg focus:ring-primary focus:border-primary text-sm"
                      placeholder="Enter job responsibilities and requirements..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingJob ? 'Update Job' : 'Create Job')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobManagement;
