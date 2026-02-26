import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Globe, Mail, Shield, Bell, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    commission_name: '',
    contact_email: '',
    allow_registrations: 1,
    maintenance_mode: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">System Settings</h1>
          <p className="text-gray-500 text-sm">Configure global portal parameters and system behavior.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Settings
        </button>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/10 border border-success/20 text-success p-4 rounded-lg flex items-center gap-3"
        >
          <CheckCircle size={20} />
          <p className="text-sm font-medium">System settings updated successfully!</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* General Settings */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-gray">
              <Globe size={20} className="text-primary" />
              <h2 className="font-bold text-dark">General Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Commission Name</label>
                <input 
                  type="text" 
                  value={settings.commission_name}
                  onChange={(e) => setSettings({ ...settings, commission_name: e.target.value })}
                  className="w-full text-sm font-medium text-dark bg-gray-50 border border-border-gray rounded p-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contact Email</label>
                <input 
                  type="email" 
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full text-sm font-medium text-dark bg-gray-50 border border-border-gray rounded p-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </section>

          {/* System Flags */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-gray">
              <Shield size={20} className="text-primary" />
              <h2 className="font-bold text-dark">System Access Control</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-dark">Allow New Registrations</h3>
                  <p className="text-xs text-gray-500">Enable or disable the registration form for new applicants.</p>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, allow_registrations: settings.allow_registrations === 1 ? 0 : 1 })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.allow_registrations === 1 ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allow_registrations === 1 ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-dark">Maintenance Mode</h3>
                  <p className="text-xs text-gray-500">Restrict access to the portal for maintenance purposes.</p>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, maintenance_mode: settings.maintenance_mode === 1 ? 0 : 1 })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenance_mode === 1 ? 'bg-danger' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenance_mode === 1 ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Bell size={20} />
              <h3 className="font-bold">System Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Database</span>
                <span className="text-success font-bold">Connected</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">API Server</span>
                <span className="text-success font-bold">Online</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Storage</span>
                <span className="text-success font-bold">94% Free</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-primary/10">
              <p className="text-[10px] text-gray-400 text-center">
                Last system update: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-dark mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-xs p-2 hover:bg-gray-50 rounded transition-colors text-gray-600">Clear System Cache</button>
              <button className="w-full text-left text-xs p-2 hover:bg-gray-50 rounded transition-colors text-gray-600">Download System Logs</button>
              <button className="w-full text-left text-xs p-2 hover:bg-gray-50 rounded transition-colors text-danger font-bold">Reset System to Defaults</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
