import React, { useState, useEffect } from 'react';
import { Job, User, Education, Experience, Referee } from '../types';
import { 
  User as UserIcon, 
  GraduationCap, 
  Briefcase, 
  Users, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WizardProps {
  job: Job;
  user: User;
  onClose: () => void;
  onSuccess: (refNumber: string) => void;
}

const JobApplicationWizard: React.FC<WizardProps> = ({ job, user, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<(User & {
    education: Education[];
    experience: Experience[];
    referees: Referee[];
  }) | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching profile for wizard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const steps = [
    { id: 1, label: 'Personal', icon: UserIcon },
    { id: 2, label: 'Education', icon: GraduationCap },
    { id: 3, label: 'Experience', icon: Briefcase },
    { id: 4, label: 'Referees', icon: Users },
    { id: 5, label: 'Review', icon: CheckCircle },
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, job_id: job.id }),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.ref_number);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-gray-500 font-medium">Preparing your application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-border-gray bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-dark">Job Application</h2>
            <p className="text-xs text-gray-500 mt-1">Applying for: <span className="text-primary font-bold">{job.title}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-dark transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6 bg-white border-b border-border-gray">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            {steps.map((s) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step >= s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <s.icon size={18} />
                </div>
                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                  step >= s.id ? 'text-primary' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <UserIcon className="text-primary" size={24} />
                    <h3 className="text-lg font-bold text-dark">Personal Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Full Name" value={`${profileData?.first_name} ${profileData?.last_name}`} />
                    <DetailItem label="Email Address" value={profileData?.email || ''} />
                    <DetailItem label="Phone Number" value={profileData?.phone || ''} />
                    <DetailItem label="ID/Passport" value={profileData?.doc_number || ''} />
                    <DetailItem label="County" value={profileData?.county || ''} />
                    <DetailItem label="Constituency" value={profileData?.constituency || ''} />
                    <DetailItem label="Ward" value={profileData?.ward || ''} />
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
                    <AlertCircle className="text-primary flex-shrink-0" size={20} />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      These details are pulled from your profile. If any information is incorrect, please update your profile before submitting this application.
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <GraduationCap className="text-primary" size={24} />
                    <h3 className="text-lg font-bold text-dark">Education History</h3>
                  </div>
                  {profileData?.education.length === 0 ? (
                    <EmptyState message="No education records found in your profile." />
                  ) : (
                    <div className="space-y-4">
                      {profileData?.education.map((edu) => (
                        <div key={edu.id} className="p-4 bg-gray-50 rounded-xl border border-border-gray">
                          <h4 className="font-bold text-dark text-sm">{edu.qualification}</h4>
                          <p className="text-xs text-gray-500 mt-1">{edu.institution}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{edu.start_date} - {edu.end_date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="text-primary" size={24} />
                    <h3 className="text-lg font-bold text-dark">Work Experience</h3>
                  </div>
                  {profileData?.experience.length === 0 ? (
                    <EmptyState message="No work experience found in your profile." />
                  ) : (
                    <div className="space-y-4">
                      {profileData?.experience.map((exp) => (
                        <div key={exp.id} className="p-4 bg-gray-50 rounded-xl border border-border-gray">
                          <h4 className="font-bold text-dark text-sm">{exp.position}</h4>
                          <p className="text-xs text-gray-500 mt-1">{exp.company}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{exp.start_date} - {exp.end_date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="text-primary" size={24} />
                    <h3 className="text-lg font-bold text-dark">Referees</h3>
                  </div>
                  {profileData?.referees.length === 0 ? (
                    <EmptyState message="No referees found in your profile." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData?.referees.map((ref) => (
                        <div key={ref.id} className="p-4 bg-gray-50 rounded-xl border border-border-gray">
                          <h4 className="font-bold text-dark text-sm">{ref.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{ref.organization}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{ref.phone} • {ref.email}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-primary" size={24} />
                    <h3 className="text-lg font-bold text-dark">Review & Submit</h3>
                  </div>
                  
                  <div className="glass-card p-6 border-primary/20 bg-primary/5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Position Details</h4>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <h5 className="font-bold text-dark">{job.title}</h5>
                        <p className="text-xs text-gray-500">{job.department}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Declaration</h4>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1">
                        <input type="checkbox" id="declaration" className="rounded border-gray-300 text-primary focus:ring-primary" />
                      </div>
                      <label htmlFor="declaration" className="text-xs text-gray-600 leading-relaxed">
                        I hereby declare that the information provided in this application is true and complete to the best of my knowledge. I understand that any false statements or omissions may disqualify me from employment or result in dismissal if already employed.
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-gray bg-gray-50 flex justify-between items-center">
          <button 
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${
              step === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-dark'
            }`}
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          {step < 5 ? (
            <button 
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 px-8"
            >
              Next Step <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 px-10"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              Submit Application
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
    <p className="text-sm font-medium text-dark">{value || 'Not provided'}</p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
    <FileText className="mx-auto text-gray-300 mb-3" size={32} />
    <p className="text-sm text-gray-500 italic">{message}</p>
    <p className="text-[10px] text-gray-400 mt-1">You can add this in your profile section.</p>
  </div>
);

export default JobApplicationWizard;
