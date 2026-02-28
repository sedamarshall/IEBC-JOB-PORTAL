import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, X, CheckCircle, Facebook, Instagram, Twitter, Phone, MessageSquare } from 'lucide-react';
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
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left Section - Image & Branding */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1920" 
          alt="Professional" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Curved Overlay */}
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
        <div 
          className="absolute inset-y-0 left-0 w-full bg-primary" 
          style={{ 
            clipPath: 'ellipse(80% 100% at 0% 50%)',
            opacity: 0.9
          }}
        ></div>

        {/* Content on Left */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/80 transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-white/80 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white/80 transition-colors"><Twitter size={20} /></a>
          </div>

          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-light mb-2">Welcome to</h3>
              <h1 className="text-6xl font-bold mb-6 leading-tight">Online Portal</h1>
              <p className="text-xl text-white/90 font-light">
                Your gateway to professional opportunities and career growth. We are on your side!
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-white/70">
            <p className="flex items-center gap-2">
              <Phone size={14} /> Need help? Contact our customer care
            </p>
            <p>customercare@portal.go.ke | +254 20 322 1000</p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center p-8 bg-gray-50/50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(5,48,109,0.1)] p-10 border border-gray-100">
            <div className="flex justify-center mb-8">
              <img 
                src="https://jobs.iebc.or.ke/logo.png" 
                alt="Logo" 
                className="h-16 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary">Login to Online Portal</h2>
              <p className="text-gray-400 text-sm mt-1">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl text-xs text-center font-medium"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Enter username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enter password</label>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Login'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <button onClick={onToggle} className="text-primary font-bold hover:underline">
                  Register here
                </button>
              </p>
            </div>
          </div>

          {/* App Download Section */}
          <div className="mt-10 bg-dark rounded-3xl p-6 text-white flex items-center justify-between shadow-xl">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Online Portal App</p>
              <p className="text-xs font-medium">For ultimate convenience!</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors border border-white/10">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[8px]">G</div>
                <div className="text-left">
                  <p className="text-[8px] leading-none opacity-60">Get it on</p>
                  <p className="text-[10px] font-bold leading-none mt-0.5">Google Play</p>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors border border-white/10">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[8px]">A</div>
                <div className="text-left">
                  <p className="text-[8px] leading-none opacity-60">Download on</p>
                  <p className="text-[10px] font-bold leading-none mt-0.5">App Store</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-primary">Reset Password</h3>
                <button 
                  onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {!forgotSuccess ? (
                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm outline-none"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isForgotLoading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-dark mb-2">Check your email</h4>
                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    We've sent a password reset link to <br/><strong className="text-primary">{forgotEmail}</strong>.
                  </p>
                  <button 
                    onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all"
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
