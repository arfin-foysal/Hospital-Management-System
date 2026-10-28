import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BedDouble, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Receipt, 
  ShieldCheck, 
  FileText,
  LogOut,
  Activity,
  AlertOctagon,
  Droplet,
  Scissors,
  HeartPulse,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

const Sidebar = () => {
  const { user, role, logout, isAdmin, isDoctor, isReceptionist, isPharmacist, isLabTech, isAccountant, isPatient } = useAuth();
  const { t } = useLocale();

  const navItems = [
    {
      label: t('dashboard'),
      path: '/',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: t('patients'),
      path: '/patients',
      icon: Users,
      show: isAdmin || isReceptionist || isDoctor || isAccountant,
    },
    {
      label: t('appointments'),
      path: '/appointments',
      icon: Calendar,
      show: isAdmin || isReceptionist || isDoctor || isPatient,
    },
    {
      label: t('ipdBeds'),
      path: '/ipd-beds',
      icon: BedDouble,
      show: isAdmin || isReceptionist || isDoctor,
    },
    {
      label: t('emergency'),
      path: '/emergency',
      icon: AlertOctagon,
      show: isAdmin || isReceptionist || isDoctor,
    },
    {
      label: t('nursingStation'),
      path: '/nursing-station',
      icon: HeartPulse,
      show: isAdmin || isDoctor || isReceptionist,
    },
    {
      label: t('operationTheatre'),
      path: '/operation-theatre',
      icon: Scissors,
      show: isAdmin || isDoctor,
    },
    {
      label: t('doctorEmr'),
      path: '/emr-consultation',
      icon: Stethoscope,
      show: isAdmin || isDoctor,
    },
    {
      label: t('pharmacy'),
      path: '/pharmacy',
      icon: Pill,
      show: isAdmin || isPharmacist || isDoctor,
    },
    {
      label: t('laboratory'),
      path: '/laboratory',
      icon: FlaskConical,
      show: isAdmin || isLabTech || isDoctor || isPatient,
    },
    {
      label: t('bloodBank'),
      path: '/blood-bank',
      icon: Droplet,
      show: isAdmin || isLabTech || isDoctor,
    },
    {
      label: t('billing'),
      path: '/billing',
      icon: Receipt,
      show: isAdmin || isAccountant || isPatient,
    },
    {
      label: t('notifications'),
      path: '/notifications',
      icon: Bell,
      show: isAdmin,
    },
    {
      label: t('myRecords'),
      path: '/my-records',
      icon: FileText,
      show: isPatient,
    },
    {
      label: t('users'),
      path: '/users',
      icon: ShieldCheck,
      show: isAdmin,
    },
  ];

  const getRoleBadgeColor = (r) => {
    switch (r) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'doctor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'receptionist': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'pharmacist': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lab_technician': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'accountant': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'patient': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <span className="font-bold text-white tracking-wide text-lg block leading-none">CareSync</span>
          <span className="text-[11px] font-medium text-blue-400 tracking-wider uppercase">Hospital System</span>
        </div>
      </div>

      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Staff Member'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(role)}`}>
                {role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Operations
        </div>
        {navItems.filter(item => item.show).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

