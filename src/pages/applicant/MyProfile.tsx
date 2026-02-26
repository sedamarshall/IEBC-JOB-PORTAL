import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Education, Experience, Referee, Document, County, Constituency, Ward } from '../../types';
import { User as UserIcon, Mail, Phone, MapPin, GraduationCap, Briefcase, Users, Loader2, CheckCircle, Trash2, Plus, X, FileText, Upload, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MyProfile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<(User & { education: Education[], experience: Experience[], referees: Referee[], documents: Document[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [counties, setCounties] = useState<County[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  const [selectedIds, setSelectedIds] = useState({
    county: '',
    constituency: ''
  });
  
  const [loadingLocations, setLoadingLocations] = useState({
    counties: false,
    constituencies: false,
    wards: false
  });

  // Modals state
  const [showEduModal, setShowEduModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Form states
  const [eduForm, setEduForm] = useState({ institution: '', qualification: '', start_date: '', end_date: '' });
  const [expForm, setExpForm] = useState({ company: '', position: '', start_date: '', end_date: '', description: '' });
  const [refForm, setRefForm] = useState({ name: '', organization: '', phone: '', email: '' });
  const [docForm, setDocForm] = useState({ name: '', type: 'CV' });

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        // Fetch documents separately
        const docsRes = await fetch(`/api/documents/${user?.id}`);
        const documents = docsRes.ok ? await docsRes.json() : [];
        setProfileData({ ...data, documents });
        
        // After profile is loaded, we need to find the IDs for the names
        // This will be handled in a separate useEffect that watches profileData
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounties();
  }, []);

  const fetchCounties = async () => {
    setLoadingLocations(prev => ({ ...prev, counties: true }));
    try {
      const res = await fetch('/api/counties');
      if (res.ok) setCounties(await res.json());
    } catch (err) {
      console.error('Error fetching counties:', err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, counties: false }));
    }
  };

  const fetchConstituencies = async (countyId: string) => {
    setLoadingLocations(prev => ({ ...prev, constituencies: true }));
    try {
      const res = await fetch(`/api/constituencies?county_id=${countyId}`);
      if (res.ok) setConstituencies(await res.json());
    } catch (err) {
      console.error('Error fetching constituencies:', err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, constituencies: false }));
    }
  };

  const fetchWards = async (constituencyId: string) => {
    setLoadingLocations(prev => ({ ...prev, wards: true }));
    try {
      const res = await fetch(`/api/wards?constituency_id=${constituencyId}`);
      if (res.ok) setWards(await res.json());
    } catch (err) {
      console.error('Error fetching wards:', err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, wards: false }));
    }
  };

  // Effect to handle initial location IDs based on profile names
  useEffect(() => {
    if (profileData && counties.length > 0 && !selectedIds.county) {
      if (profileData.county_id) {
        setSelectedIds(prev => ({ ...prev, county: profileData.county_id.toString() }));
        fetchConstituencies(profileData.county_id.toString());
      }
    }
  }, [profileData, counties]);

  useEffect(() => {
    if (profileData && constituencies.length > 0 && !selectedIds.constituency) {
      if (profileData.constituency_id) {
        setSelectedIds(prev => ({ ...prev, constituency: profileData.constituency_id.toString() }));
        fetchWards(profileData.constituency_id.toString());
      }
    }
  }, [profileData, constituencies]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eduForm, user_id: user?.id }),
      });
      if (response.ok) {
        setShowEduModal(false);
        setEduForm({ institution: '', qualification: '', start_date: '', end_date: '' });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error adding education:', error);
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`/api/education/${id}`, { method: 'DELETE' });
      if (response.ok) fetchProfile();
    } catch (error) {
      console.error('Error deleting education:', error);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expForm, user_id: user?.id }),
      });
      if (response.ok) {
        setShowExpModal(false);
        setExpForm({ company: '', position: '', start_date: '', end_date: '', description: '' });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error adding experience:', error);
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
      if (response.ok) fetchProfile();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const handleAddReferee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/referees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...refForm, user_id: user?.id }),
      });
      if (response.ok) {
        setShowRefModal(false);
        setRefForm({ name: '', organization: '', phone: '', email: '' });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error adding referee:', error);
    }
  };

  const handleDeleteReferee = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`/api/referees/${id}`, { method: 'DELETE' });
      if (response.ok) fetchProfile();
    } catch (error) {
      console.error('Error deleting referee:', error);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...docForm, 
          user_id: user?.id,
          size: Math.floor(Math.random() * 5000) + 1000, // Mock size
          url: '#' // Mock URL
        }),
      });
      if (response.ok) {
        setShowDocModal(false);
        setDocForm({ name: '', type: 'CV' });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (response.ok) fetchProfile();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm">
            {profileData?.first_name?.[0]}{profileData?.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark">{profileData?.first_name} {profileData?.last_name}</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Mail size={14} /> {profileData?.email}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Profile Complete</span>
              <span className="text-xs text-gray-400">Member since {new Date(profileData?.created_at || '').toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleUpdateProfile}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Profile Changes'}
        </button>
      </div>

      {showSuccess && (
        <div className="bg-success/10 border border-success/20 text-success p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={20} />
          <p className="text-sm font-medium">Profile updated successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-gray">
              <UserIcon size={20} className="text-primary" />
              <h2 className="font-bold text-dark">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">First Name</label>
                <input 
                  type="text" 
                  value={profileData?.first_name || ''} 
                  onChange={(e) => setProfileData(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                  className="w-full text-sm font-medium text-dark bg-gray-50 border border-border-gray rounded p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={profileData?.last_name || ''} 
                  onChange={(e) => setProfileData(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                  className="w-full text-sm font-medium text-dark bg-gray-50 border border-border-gray rounded p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={profileData?.phone || ''} 
                  onChange={(e) => setProfileData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  className="w-full text-sm font-medium text-dark bg-gray-50 border border-border-gray rounded p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ID / Passport Number</label>
                <p className="text-sm font-medium text-dark p-2 bg-gray-100 rounded border border-border-gray cursor-not-allowed">
                  {profileData?.doc_number}
                </p>
              </div>
            </div>
          </section>

          {/* Education */}
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-gray">
              <div className="flex items-center gap-3">
                <GraduationCap size={20} className="text-primary" />
                <h2 className="font-bold text-dark">Education History</h2>
              </div>
              <button 
                onClick={() => setShowEduModal(true)}
                className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Education
              </button>
            </div>
            <div className="space-y-4">
              {profileData?.education.map((edu) => (
                <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-border-gray flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-dark text-sm">{edu.qualification}</h3>
                    <p className="text-xs text-gray-600 mt-1">{edu.institution}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{edu.start_date} - {edu.end_date}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-gray-400 hover:text-danger transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {profileData?.education.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">No education records added yet.</p>
              )}
            </div>
          </section>

          {/* Work Experience */}
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-gray">
              <div className="flex items-center gap-3">
                <Briefcase size={20} className="text-primary" />
                <h2 className="font-bold text-dark">Work Experience</h2>
              </div>
              <button 
                onClick={() => setShowExpModal(true)}
                className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {profileData?.experience.map((exp) => (
                <div key={exp.id} className="p-4 bg-gray-50 rounded-lg border border-border-gray flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-dark text-sm">{exp.position}</h3>
                    <p className="text-xs text-gray-600 mt-1">{exp.company}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{exp.start_date} - {exp.end_date}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="text-gray-400 hover:text-danger transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {profileData?.experience.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">No work experience added yet.</p>
              )}
            </div>
          </section>

          {/* Documents */}
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-gray">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-primary" />
                <h2 className="font-bold text-dark">Supporting Documents</h2>
              </div>
              <button 
                onClick={() => setShowDocModal(true)}
                className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
              >
                <Upload size={14} /> Upload Document
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData?.documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-gray-50 rounded-lg border border-border-gray flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded border border-border-gray flex items-center justify-center text-primary">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark text-xs truncate">{doc.name}</h3>
                    <p className="text-[10px] text-gray-500">{doc.type} • {(doc.size / 1024).toFixed(1)} MB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-primary transition-colors">
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-gray-400 hover:text-danger transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {profileData?.documents.length === 0 && (
                <div className="md:col-span-2 text-sm text-gray-500 italic text-center py-4">No documents uploaded yet.</div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Location Details */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-gray">
              <MapPin size={20} className="text-primary" />
              <h2 className="font-bold text-dark">Location</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">County</label>
                <select 
                  value={selectedIds.county} 
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedIds({ county: id, constituency: '' });
                    setConstituencies([]);
                    setWards([]);
                    setProfileData(prev => prev ? { ...prev, county_id: Number(id), constituency_id: null, ward_id: null } : null);
                    if (id) fetchConstituencies(id);
                  }}
                  className="w-full text-sm font-medium text-dark bg-gray-50 border border-border-gray rounded p-2"
                >
                  <option value="">Select County</option>
                  {counties.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {loadingLocations.counties && <p className="text-[10px] text-primary mt-1 animate-pulse">Loading counties...</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Constituency</label>
                <select 
                  value={selectedIds.constituency} 
                  disabled={!selectedIds.county || loadingLocations.constituencies}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedIds(prev => ({ ...prev, constituency: id }));
                    setWards([]);
                    setProfileData(prev => prev ? { ...prev, constituency_id: Number(id), ward_id: null } : null);
                    if (id) fetchWards(id);
                  }}
                  className="w-full text-sm font-medium text-dark bg-gray-50 border border-border-gray rounded p-2 disabled:opacity-50"
                >
                  <option value="">Select Constituency</option>
                  {constituencies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {loadingLocations.constituencies && <p className="text-[10px] text-primary mt-1 animate-pulse">Loading constituencies...</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ward</label>
                <select 
                  value={profileData?.ward_id || ''} 
                  disabled={!selectedIds.constituency || loadingLocations.wards}
                  onChange={(e) => {
                    const id = e.target.value;
                    setProfileData(prev => prev ? { ...prev, ward_id: Number(id) } : null);
                  }}
                  className="w-full text-sm font-medium text-dark bg-gray-50 border border-border-gray rounded p-2 disabled:opacity-50"
                >
                  <option value="">Select Ward</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {loadingLocations.wards && <p className="text-[10px] text-primary mt-1 animate-pulse">Loading wards...</p>}
              </div>
            </div>
          </section>

          {/* Referees */}
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-gray">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-primary" />
                <h2 className="font-bold text-dark">Referees</h2>
              </div>
              <button 
                onClick={() => setShowRefModal(true)}
                className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {profileData?.referees.map((ref) => (
                <div key={ref.id} className="p-3 bg-gray-50 rounded-lg border border-border-gray flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-dark text-xs">{ref.name}</h3>
                    <p className="text-[10px] text-gray-500">{ref.organization}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><Phone size={10} /> {ref.phone}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteReferee(ref.id)}
                    className="text-gray-400 hover:text-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {profileData?.referees.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-2">No referees added.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Education Modal */}
      <AnimatePresence>
        {showEduModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark">Add Education</h3>
                <button onClick={() => setShowEduModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddEducation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Qualification</label>
                  <input type="text" required value={eduForm.qualification} onChange={e => setEduForm({...eduForm, qualification: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" placeholder="e.g. Bachelor of Science in IT" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Institution</label>
                  <input type="text" required value={eduForm.institution} onChange={e => setEduForm({...eduForm, institution: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Start Date</label>
                    <input type="date" required value={eduForm.start_date} onChange={e => setEduForm({...eduForm, start_date: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">End Date</label>
                    <input type="date" required value={eduForm.end_date} onChange={e => setEduForm({...eduForm, end_date: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary mt-4">Add Education</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Experience Modal */}
        {showExpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark">Add Experience</h3>
                <button onClick={() => setShowExpModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddExperience} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Position</label>
                  <input type="text" required value={expForm.position} onChange={e => setExpForm({...expForm, position: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Company</label>
                  <input type="text" required value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Start Date</label>
                    <input type="date" required value={expForm.start_date} onChange={e => setExpForm({...expForm, start_date: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">End Date</label>
                    <input type="date" required value={expForm.end_date} onChange={e => setExpForm({...expForm, end_date: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary mt-4">Add Experience</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Referee Modal */}
        {showRefModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark">Add Referee</h3>
                <button onClick={() => setShowRefModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddReferee} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                  <input type="text" required value={refForm.name} onChange={e => setRefForm({...refForm, name: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Organization</label>
                  <input type="text" required value={refForm.organization} onChange={e => setRefForm({...refForm, organization: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                  <input type="tel" required value={refForm.phone} onChange={e => setRefForm({...refForm, phone: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                  <input type="email" required value={refForm.email} onChange={e => setRefForm({...refForm, email: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" />
                </div>
                <button type="submit" className="w-full btn-primary mt-4">Add Referee</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Document Modal */}
        {showDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark">Upload Document</h3>
                <button onClick={() => setShowDocModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddDocument} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Document Name</label>
                  <input type="text" required value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2" placeholder="e.g. Updated CV 2024" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Document Type</label>
                  <select value={docForm.type} onChange={e => setDocForm({...docForm, type: e.target.value})} className="w-full text-sm border border-border-gray rounded p-2">
                    <option value="CV">Curriculum Vitae (CV)</option>
                    <option value="Certificate">Academic Certificate</option>
                    <option value="ID">ID / Passport Copy</option>
                    <option value="Other">Other Supporting Document</option>
                  </select>
                </div>
                <div className="border-2 border-dashed border-border-gray rounded-xl p-8 text-center">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Click to select or drag and drop file</p>
                  <p className="text-[10px] text-gray-400 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                </div>
                <button type="submit" className="w-full btn-primary mt-4">Upload & Save</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProfile;
