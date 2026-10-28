import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  BedDouble, 
  AlertTriangle, 
  FlaskConical, 
  DollarSign, 
  Clock, 
  Plus, 
  ArrowRight,
  Stethoscope,
  Pill,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, role, isAdmin, isDoctor, isReceptionist, isPharmacist, isAccountant } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opdQueue, setOpdQueue] = useState([]);
  const [updatingToken, setUpdatingToken] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resSummary, resQueue] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/appointments/queue')
      ]);
      setSummary(resSummary.data.data);
      setOpdQueue(resQueue.data.queue || []);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (appointmentId, currentStatus) => {
    try {
      setUpdatingToken(appointmentId);
      let nextStatus = 'In-Queue';
      if (currentStatus === 'Scheduled') nextStatus = 'In-Queue';
      else if (currentStatus === 'In-Queue') nextStatus = 'In-Consultation';
      else if (currentStatus === 'In-Consultation') nextStatus = 'Completed';

      await api.patch(`/appointments/${appointmentId}/status`, { status: nextStatus });
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingToken(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600 font-medium">Loading hospital operations overview...</span>
      </div>
    );
  }

  const s = summary || {};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold uppercase tracking-wider">
                {role?.replace('_', ' ')} Console
              </span>
              <span className="text-xs text-blue-200">
                • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2">Welcome back, {user?.name}</h1>
            <p className="text-blue-200 text-sm mt-1 max-w-xl">
              CareSync Hospital operational pulse is normal. Review today's OPD token flow, real-time bed allocations, and clinical alerts below.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(isAdmin || isReceptionist) && (
              <Link
                to="/patients"
                className="bg-white text-blue-800 hover:bg-blue-50 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Patient</span>
              </Link>
            )}
            {(isAdmin || isDoctor) && (
              <Link
                to="/emr-consultation"
                className="bg-blue-500/40 hover:bg-blue-500/60 text-white border border-blue-400/40 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Consultation</span>
              </Link>
            )}
            {(isAdmin || isPharmacist) && (
              <Link
                to="/pharmacy"
                className="bg-blue-500/40 hover:bg-blue-500/60 text-white border border-blue-400/40 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Pill className="w-4 h-4" />
                <span>Dispense Medicine</span>
              </Link>
            )}
            {(isAdmin || isAccountant) && (
              <Link
                to="/billing"
                className="bg-blue-500/40 hover:bg-blue-500/60 text-white border border-blue-400/40 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>Consolidated Invoicing</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Patients"
          value={s.totalPatients || 0}
          subtitle="Hospital lifetime database"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Today's OPD Appointments"
          value={s.todayAppointments || 0}
          subtitle={`${s.pendingAppointments || 0} in active queue today`}
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="IPD Bed Availability"
          value={`${s.availableBeds || 0} / ${s.totalBeds || 0}`}
          subtitle={`${s.activeAdmissions || 0} Patients currently admitted`}
          icon={BedDouble}
          color={s.availableBeds > 3 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Today's Collections"
          value={`৳${(s.todayRevenue || 0).toLocaleString()}`}
          subtitle={`৳${(s.totalReceivable || 0).toLocaleString()} uncollected dues`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Live OPD Consultation Queue (Today)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time token management for outpatient chambers</p>
            </div>
            <Link
              to="/appointments"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {opdQueue.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No OPD appointments scheduled for today yet.
              </div>
            ) : (
              opdQueue.slice(0, 6).map((item) => {
                const isUpdating = updatingToken === item.id;
                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (item.status === 'In-Consultation') badgeClass = 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
                else if (item.status === 'In-Queue') badgeClass = 'bg-amber-100 text-amber-700 border-amber-200';
                else if (item.status === 'Completed') badgeClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';

                return (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center font-bold text-blue-700">
                        <span className="text-[9px] uppercase tracking-tighter text-blue-400 leading-none">Token</span>
                        <span className="text-sm leading-tight">#{item.token_number}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{item.patient_name}</h4>
                        <p className="text-xs text-slate-500">
                          {item.patient_gender}, {item.patient_age}y • {item.doctor_name} ({item.department})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                        {item.status}
                      </span>

                      {(isAdmin || isDoctor || isReceptionist) && item.status !== 'Completed' && (
                        <button
                          onClick={() => handleAdvanceStatus(item.id, item.status)}
                          disabled={isUpdating}
                          className="text-xs bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 px-2.5 py-1 rounded-lg font-medium transition"
                        >
                          {item.status === 'Scheduled' && 'Call to Queue'}
                          {item.status === 'In-Queue' && 'Call In'}
                          {item.status === 'In-Consultation' && 'Done'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Pharmacy Low Stock ({s.lowStockCount || 0})</span>
              </h3>
              <Link to="/pharmacy" className="text-xs text-blue-600 font-semibold hover:underline">
                Manage
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {(s.lowStockMedicines || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-3">All medicine stocks are at healthy levels.</p>
              ) : (
                s.lowStockMedicines.map((med) => (
                  <div key={med.id} className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{med.name}</p>
                      <p className="text-[11px] text-slate-500">{med.generic_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {med.stock_quantity} left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                <span>Diagnostics & Lab</span>
              </h3>
              <Link to="/laboratory" className="text-xs text-blue-600 font-semibold hover:underline">
                Lab Requisitions
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
                <span className="text-xl font-bold text-purple-700">{s.pendingLabTests || 0}</span>
                <p className="text-[11px] font-semibold text-purple-900 mt-0.5">Pending Tests</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-xl font-bold text-emerald-700">8</span>
                <p className="text-[11px] font-semibold text-emerald-900 mt-0.5">Catalog Tests</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-blue-600" />
              <span>Current IPD (In-Patient Department) Occupancy</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Admitted in-patients, ward assignments and attending consultants</p>
          </div>
          <Link
            to="/ipd-beds"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>Bed Allocation Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
                <th className="py-2.5 px-3">Admission #</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Ward & Bed</th>
                <th className="py-2.5 px-3">Attending Doctor</th>
                <th className="py-2.5 px-3">Diagnosis</th>
                <th className="py-2.5 px-3">Admission Date</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(s.recentAdmissions || []).length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No active admissions in IPD.
                  </td>
                </tr>
              ) : (
                s.recentAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-semibold text-blue-600">{adm.admission_number}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{adm.patient_name}</span>
                      <span className="text-[11px] text-slate-400">{adm.patient_code}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700 block">{adm.bed_number}</span>
                      <span className="text-[11px] text-slate-500">{adm.ward_type}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{adm.doctor_name}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{adm.initial_diagnosis || adm.admission_reason}</td>
                    <td className="py-3 px-3 text-slate-500">{adm.admission_date?.slice(0, 10)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {adm.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

