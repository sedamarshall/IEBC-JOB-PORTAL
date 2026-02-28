import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, X, CheckCircle, Facebook, Instagram, Twitter, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onToggle: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const user = await response.json();
        login(user);
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    // Simulate API call
    setTimeout(() => {
      setForgotSuccess(true);
      setIsForgotLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative bg-white font-sans overflow-hidden">
      {/* Full-width Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=90&w=1920" 
          alt="Professional Environment" 
          className="w-full h-full object-cover brightness-110 contrast-105"
        />
        
        {/* Global Overlays */}
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]"></div>
        <div 
          className="absolute inset-y-0 left-0 w-[60%] lg:w-[45%] bg-primary" 
          style={{ 
            clipPath: 'ellipse(65% 100% at 0% 50%)',
            opacity: 0.85
          }}
        ></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Section - Branding Content */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white">
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70 transition-colors"><Facebook size={18} /></a>
            <a href="#" className="hover:text-white/70 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="hover:text-white/70 transition-colors"><Twitter size={18} /></a>
          </div>

          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h3 className="text-xl font-light mb-1 opacity-90">Welcome to</h3>
              <h1 className="text-5xl font-bold mb-5 leading-tight tracking-tight">Online Portal</h1>
              <p className="text-lg text-white/85 font-light leading-relaxed max-w-md">
                Your gateway to professional opportunities and career growth. We are on your side!
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-white/60">
            <p className="flex items-center gap-2 font-medium">
              <Phone size={12} /> Need help? Contact our customer care
            </p>
            <p>customercare@portal.go.ke | +254 20 322 1000</p>
          </div>
        </div>

        {/* Right Section - Floating Login Card */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-[400px] relative z-20"
          >
            {/* The Floating Card with heavy, realistic shadow */}
            <div className="bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.35)] p-8 border border-white/20 backdrop-blur-sm">
              <div className="flex justify-center mb-6">
                <img 
                  src="https://jobs.iebc.or.ke/logo.png" 
                  alt="Logo" 
                  className="h-12 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-center mb-7">
                <h2 className="text-xl font-bold text-primary">Login to Online Portal</h2>
                <p className="text-gray-400 text-xs mt-1.5">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-danger/5 border border-danger/10 text-danger p-2.5 rounded-xl text-[11px] text-center font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm outline-none placeholder:text-gray-300"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setShowForgotModal(true)}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-11 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm outline-none placeholder:text-gray-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Login'}
                </button>
              </form>

              <div className="mt-7 text-center">
                <p className="text-xs text-gray-400">
                  Don't have an account?{' '}
                  <button onClick={onToggle} className="text-primary font-bold hover:underline">
                    Register here
                  </button>
                </p>
              </div>
            </div>

            {/* App Download Section - Floating as well */}
            <div className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white/30 flex items-center justify-between shadow-[0_15px_35px_rgba(0,0,0,0.15)]">
              <div className="flex-1">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Mobile App</p>
                <p className="text-[11px] text-gray-600 font-medium">Download for convenience</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors border border-gray-100">
                  <div className="w-4 h-4 bg-primary/10 text-primary rounded flex items-center justify-center text-[7px] font-bold">G</div>
                  <div className="text-left">
                    <p className="text-[7px] font-bold text-gray-500 leading-none">Google Play</p>
                  </div>
                </button>
                <button className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors border border-gray-100">
                  <div className="w-4 h-4 bg-primary/10 text-primary rounded flex items-center justify-center text-[7px] font-bold">A</div>
                  <div className="text-left">
                    <p className="text-[7px] font-bold text-gray-500 leading-none">App Store</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-primary">Reset Password</h3>
                <button 
                  onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              {!forgotSuccess ? (
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm outline-none"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {isForgotLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-dark mb-1.5">Check your email</h4>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    We've sent a password reset link to <br/><strong className="text-primary">{forgotEmail}</strong>.
                  </p>
                  <button 
                    onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/10 transition-all text-sm"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
