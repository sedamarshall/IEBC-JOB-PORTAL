import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { County, Constituency, Ward } from '../types';

interface RegisterProps {
  onToggle: () => void;
}

const Register: React.FC<RegisterProps> = ({ onToggle }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    doc_type: 'National ID',
    doc_number: '',
    gender: '',
    dob: '',
    phone: '',
    country: 'Kenya',
    county_id: '',
    constituency_id: '',
    ward_id: '',
    pwd: 'No'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'county') {
      setFormData({ ...formData, county_id: value, constituency_id: '', ward_id: '' });
      setSelectedIds({ county: value, constituency: '' });
      setConstituencies([]);
      setWards([]);
      if (value) fetchConstituencies(value);
    } else if (name === 'constituency') {
      setFormData({ ...formData, constituency_id: value, ward_id: '' });
      setSelectedIds(prev => ({ ...prev, constituency: value }));
      setWards([]);
      if (value) fetchWards(value);
    } else if (name === 'ward') {
      setFormData({ ...formData, ward_id: value });
    } else {
      setFormData({ ...formData, [name]: value });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStep(3); // Success step
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-lg p-2 border border-gray-100">
            <img 
              src="https://jobs.iebc.or.ke/logo.png" 
              alt="IEBC Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-bold text-dark">Create Your Account</h1>
          <p className="text-gray-500 mt-2">Join the national recruitment portal</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>Account Info</span>
            <span className={`text-xs font-bold uppercase ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>Personal Details</span>
            <span className={`text-xs font-bold uppercase ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="glass-card p-8">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-border-gray rounded-md focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-border-gray rounded-md focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-border-gray rounded-md focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <button type="button" onClick={onToggle} className="text-sm text-gray-500 hover:underline">
                  Already have an account? Sign in
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  Next Step <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded text-sm text-center">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                  <select name="doc_type" value={formData.doc_type} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm">
                    <option>National ID</option>
                    <option>Passport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID/Passport Number *</label>
                  <input type="text" name="doc_number" required value={formData.doc_number} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm" placeholder="+254..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                  <select 
                    name="county" 
                    required 
                    value={selectedIds.county} 
                    onChange={handleChange} 
                    className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm"
                  >
                    <option value="">Select County</option>
                    {counties.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {loadingLocations.counties && <p className="text-[10px] text-primary mt-1 animate-pulse">Loading counties...</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Constituency *</label>
                  <select 
                    name="constituency" 
                    required 
                    value={selectedIds.constituency} 
                    onChange={handleChange} 
                    disabled={!selectedIds.county || loadingLocations.constituencies}
                    className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Select Constituency</option>
                    {constituencies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {loadingLocations.constituencies && <p className="text-[10px] text-primary mt-1 animate-pulse">Loading constituencies...</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward *</label>
                  <select 
                    name="ward" 
                    required 
                    value={formData.ward_id} 
                    onChange={handleChange} 
                    disabled={!selectedIds.constituency || loadingLocations.wards}
                    className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  {loadingLocations.wards && <p className="text-[10px] text-primary mt-1 animate-pulse">Loading wards...</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Are you a PWD? *</label>
                  <select name="pwd" value={formData.pwd} onChange={handleChange} className="block w-full px-3 py-2 border border-border-gray rounded-md text-sm">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex items-center gap-2">
                  <ArrowLeft size={18} /> Back
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 text-success rounded-full mb-6">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-2xl font-bold text-dark mb-2">Registration Successful!</h2>
              <p className="text-gray-500 mb-8">Your account has been created. You can now sign in to start your application.</p>
              <button onClick={onToggle} className="btn-primary px-8">
                Sign In Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
