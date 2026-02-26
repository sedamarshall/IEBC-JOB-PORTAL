import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, MapPin, Calendar, Search, Loader2, CheckCircle, AlertCircle, X, Eye, ArrowRight } from 'lucide-react';
import { Job, Application } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import JobApplicationWizard from '../../components/JobApplicationWizard';

const AvailableJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadyAppliedModal, setShowAlreadyAppliedModal] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState<Job | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [jobToApply, setJobToApply] = useState<Job | null>(null);
  const [refNumber, setRefNumber] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch(`/api/applications?user_id=${user?.id}`)
        ]);
        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (appsRes.ok) setApplications(await appsRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleApply = (job: Job) => {
    const alreadyApplied = applications.find(a => a.job_id === job.id);
    if (alreadyApplied) {
      setShowAlreadyAppliedModal(true);
      return;
    }
    setJobToApply(job);
    setShowWizard(true);
  };

  const handleApplicationSuccess = (ref: string) => {
    setRefNumber(ref);
    setShowWizard(false);
    setShowSuccessModal(true);
    // Refresh applications list
    fetch(`/api/applications?user_id=${user?.id}`)
      .then(res => res.json())
      .then(data => setApplications(data));
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Available Job Openings</h1>
          <p className="text-gray-500">Find and apply for open positions within the commission.</p>
        </div>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search jobs or departments..."
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
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const isApplied = applications.some(a => a.job_id === job.id);
            return (
              <motion.div
                layout
                key={job.id}
                className="glass-card flex flex-col h-full hover:shadow-md transition-shadow group"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Briefcase size={20} />
                    </div>
                    {isApplied && (
                      <span className="badge-shortlisted text-[10px]">Applied</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">{job.department}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-border-gray flex gap-2">
                  <button 
                    onClick={() => handleApply(job)}
                    disabled={isApplied}
                    className={`flex-1 text-xs font-bold py-2 rounded transition-all flex items-center justify-center gap-2 ${
                      isApplied 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary-dark text-white'
                    }`}
                  >
                    {isApplied ? 'Already Applied' : <>Apply Now <ArrowRight size={14} /></>}
                  </button>
                  <button 
                    onClick={() => setSelectedJobDetails(job)}
                    className="flex-1 btn-outline text-xs py-2 flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 glass-card">
          <p className="text-gray-500">No jobs found matching your search.</p>
        </div>
      )}

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJobDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border-gray flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-dark">Job Details</h2>
                <button onClick={() => setSelectedJobDetails(null)} className="text-gray-400 hover:text-dark">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-dark">{selectedJobDetails.title}</h3>
                    <p className="text-gray-500">{selectedJobDetails.department}</p>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-primary" />
                        {selectedJobDetails.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-primary" />
                        Deadline: {new Date(selectedJobDetails.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-dark mb-2">Description & Requirements</h4>
                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedJobDetails.description || 'No detailed description provided for this position.'}
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Application Instructions</h4>
                    <p className="text-xs text-gray-600">
                      Please ensure your profile is fully updated before applying. Once you submit your application, you will receive a reference number for tracking.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-border-gray flex gap-3">
                <button 
                  onClick={() => setSelectedJobDetails(null)}
                  className="flex-1 btn-outline"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    const job = selectedJobDetails;
                    setSelectedJobDetails(null);
                    handleApply(job);
                  }}
                  disabled={applications.some(a => a.job_id === selectedJobDetails.id)}
                  className="flex-1 btn-primary"
                >
                  {applications.some(a => a.job_id === selectedJobDetails.id) ? 'Already Applied' : 'Apply for this Position'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Multi-step Application Wizard */}
        {showWizard && jobToApply && user && (
          <JobApplicationWizard 
            job={jobToApply} 
            user={user} 
            onClose={() => setShowWizard(false)}
            onSuccess={handleApplicationSuccess}
          />
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-success/20">
                <img 
                  src="/logo.png" 
                  alt="IEBC Logo" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const icon = document.createElement('div');
                      icon.className = 'text-success';
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-dark mb-2">Application Submitted!</h2>
              <p className="text-gray-500 mt-2 mb-6">
                Your application has been successfully received. You can track its progress in the "My Applications" section.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-border-gray mb-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Reference Number</p>
                <p className="text-xl font-mono font-bold text-primary tracking-wider">{refNumber}</p>
              </div>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full btn-primary py-3"
              >
                Great, thanks!
              </button>
            </motion.div>
          </div>
        )}

        {/* Already Applied Modal */}
        {showAlreadyAppliedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-dark">Already Applied</h2>
              <p className="text-gray-500 mt-2 mb-8">
                You have already submitted an application for this position. You can check the status of your application in the "My Applications" section.
              </p>
              <button 
                onClick={() => setShowAlreadyAppliedModal(false)}
                className="w-full btn-primary"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvailableJobs;
