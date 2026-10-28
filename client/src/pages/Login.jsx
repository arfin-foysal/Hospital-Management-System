import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  Pill, 
  FlaskConical, 
  CreditCard, 
  User,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { role: 'Admin', email: 'admin@hospital.com', pass: 'admin123', icon: ShieldCheck, color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' },
  { role: 'Doctor', email: 'doctor@hospital.com', pass: 'doctor123', icon: Stethoscope, color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
  { role: 'Receptionist', email: 'receptionist@hospital.com', pass: 'reception123', icon: UserCheck, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  { role: 'Pharmacist', email: 'pharmacist@hospital.com', pass: 'pharma123', icon: Pill, color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
  { role: 'Lab Tech', email: 'labtech@hospital.com', pass: 'lab123', icon: FlaskConical, color: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' },
  { role: 'Accountant', email: 'accountant@hospital.com', pass: 'account123', icon: CreditCard, color: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200' },
  { role: 'Patient', email: 'patient@hospital.com', pass: 'patient123', icon: User, color: 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
    setLoading(true);
    try {
      await login(acc.email, acc.pass);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blurs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 mb-4">
          <Activity className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">CareSync HMS</h2>
        <p className="mt-2 text-sm text-slate-400">Enterprise Healthcare & Hospital Management System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hospital.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Accounts
              </span>
              <span className="text-xs text-blue-600 font-medium">Click to Login</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    disabled={loading}
                    className={`flex items-center p-2 rounded-lg border text-xs font-semibold transition-all text-left ${acc.color}`}
                  >
                    <Icon className="w-4 h-4 mr-1.5 shrink-0" />
                    <span className="truncate">{acc.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          CareSync Hospital Management System &bull; Powered by Express &amp; Prisma ORM
        </p>
      </div>
    </div>
  );
};

export default Login;

