import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ChevronDown, 
  PhoneCall, 
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, role, switchDemoRole } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const demoRoles = [
    { label: 'System Admin', email: 'admin@hospital.com', pass: 'admin123', role: 'admin', desc: 'Full System Control & RBAC' },
    { label: 'Doctor (Dr. Sarah)', email: 'doctor@hospital.com', pass: 'doctor123', role: 'doctor', desc: 'OPD Queue, EMR, Digital Prescriptions' },
    { label: 'Receptionist (Maria)', email: 'receptionist@hospital.com', pass: 'reception123', role: 'receptionist', desc: 'Patient Reg, OPD Tokens, IPD Beds' },
    { label: 'Pharmacist (Alex)', email: 'pharmacist@hospital.com', pass: 'pharma123', role: 'pharmacist', desc: 'Inventory, Stock Deductions, POS' },
    { label: 'Lab Technician (David)', email: 'labtech@hospital.com', pass: 'lab123', role: 'lab_technician', desc: 'Test Orders, Result Publishing' },
    { label: 'Accountant (Fatima)', email: 'accountant@hospital.com', pass: 'account123', role: 'accountant', desc: 'Consolidated Billing & Payments' },
    { label: 'Patient (John Doe)', email: 'patient@hospital.com', pass: 'patient123', role: 'patient', desc: 'Appointments, My EMR, Invoices' },
  ];

  const handleRoleSwitch = async (email, pass) => {
    try {
      setSwitching(true);
      await switchDemoRole(email, pass);
      setShowRoleMenu(false);
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentTime}</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CareSync Hospital Central Server • Active (Prisma ORM)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            disabled={switching}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition shadow-sm"
            title="Switch user role instantly"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Role Switcher:</span>
            <span className="font-bold uppercase">{role?.replace('_', ' ')}</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Switch Role (Demo 7 Classes)
              </div>
              <div className="max-h-80 overflow-y-auto">
                {demoRoles.map((r) => {
                  const isCurrent = role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSwitch(r.email, r.pass)}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-start gap-2.5 transition ${
                        isCurrent ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCurrent ? (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                          <span>{r.label}</span>
                          <span className="text-[10px] text-slate-400">{r.email.split('@')[0]}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 font-semibold">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Emergency: 1066</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">{user?.name}</span>
            <span className="text-[10px] text-slate-500 block leading-tight">{user?.department || user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

