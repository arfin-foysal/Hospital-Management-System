import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  DollarSign,
  User,
  Building,
  X,
  CreditCard,
  Briefcase
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

const InsuranceClaims = () => {
  const { user, isAdmin, isAccountant } = useAuth();
  const { formatMoney, lang } = useLocale();

  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, preAuth: 0, settled: 0, totalApprovedSum: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [patients, setPatients] = useState([]);

  // Forms
  const [claimForm, setClaimForm] = useState({
    patient_id: '',
    insurance_company: 'Green Delta Health Insurance Ltd',
    policy_number: '',
    tpa_name: 'CareSync Hospital TPA Desk',
    claim_type: 'Cashless_Hospitalization',
    estimated_amount: '',
    copay_percentage: 10,
    remarks: ''
  });

  const [actionForm, setActionForm] = useState({
    claim_status: 'Approved',
    approved_amount: '',
    approval_code: '',
    remarks: ''
  });

  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClaims();
    fetchPatients();
  }, [statusFilter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.claim_status = statusFilter;
      const [res, statsRes] = await Promise.all([
        api.get('/insurance', { params }),
        api.get('/insurance/stats')
      ]);
      setClaims(res.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients', { params: { limit: 100 } });
      setPatients(res.data.data || []);
    } catch (e) {
      console.warn('Patients fetch warning:', e.message);
    }
  };

  const showToast = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/insurance', claimForm);
      showToast('success', `Pre-authorization filed! Claim #${res.data.data.claim_number}.`);
      setShowAddModal(false);
      setClaimForm({
        patient_id: '',
        insurance_company: 'Green Delta Health Insurance Ltd',
        policy_number: '',
        tpa_name: 'CareSync Hospital TPA Desk',
        claim_type: 'Cashless_Hospitalization',
        estimated_amount: '',
        copay_percentage: 10,
        remarks: ''
      });
      fetchClaims();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to file claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClaim = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      setSubmitting(true);
      await api.patch(`/insurance/${selectedClaim.id}`, actionForm);
      showToast('success', `Claim ${selectedClaim.claim_number} updated to "${actionForm.claim_status}".`);
      setSelectedClaim(null);
      fetchClaims();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update claim');
    } finally {
      setSubmitting(false);
    }
  };

  const openActionModal = (claim) => {
    setSelectedClaim(claim);
    setActionForm({
      claim_status: claim.claim_status,
      approved_amount: claim.approved_amount || claim.estimated_amount,
      approval_code: claim.approval_code || `AUTH-${Date.now().toString().slice(-6)}`,
      remarks: claim.remarks || ''
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pre_Auth_Submitted': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Settled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Under_Query': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredClaims = claims.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.claim_number?.toLowerCase().includes(q) ||
      c.patients?.name?.toLowerCase().includes(q) ||
      c.policy_number?.toLowerCase().includes(q) ||
      c.insurance_company?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {banner && (
        <div className={`p-4 rounded-xl flex items-center justify-between border shadow-lg ${
          banner.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {banner.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span className="font-semibold text-sm">{banner.text}</span>
          </div>
          <button onClick={() => setBanner(null)}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-emerald-800/40">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {lang === 'bn' ? 'হেলথ ইন্স্যুরেন্স ও টিপিএ ক্লেইম ডেস্ক' : 'Health Insurance & Cashless TPA Claims Desk'}
            </h1>
          </div>
          <p className="text-emerald-200/80 text-sm max-w-2xl">
            {lang === 'bn' 
              ? 'ক্যাশলেস হসপিটালাইজেশন প্রি-অথরাইজেশন, পলিসি ক্লেইম অনুমোদন এবং সরাসরি বিলিং সমন্বয়।'
              : 'End-to-end corporate insurance pre-authorization desk, cashless hospitalization approvals, and hospital bill settlements.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন ক্লেইম দাখিল' : 'File Pre-Auth Claim'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || claims.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pre-Auth In Review</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.preAuth}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Cashless</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.approved}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Approved Sum</p>
            <p className="text-xl font-black text-purple-700 mt-1">{formatMoney(stats.totalApprovedSum)}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search claim #, policy #, patient, insurer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Claim Statuses</option>
              <option value="Pre_Auth_Submitted">Pre-Auth Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Settled">Settled</option>
              <option value="Under_Query">Under Query</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              onClick={fetchClaims}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Claim # & Type</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Insurer & Policy #</th>
                <th className="py-3 px-4">Status & Auth Code</th>
                <th className="py-3 px-4">Amounts (Est / Appr)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.map((c) => (
                <tr key={c.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{c.claim_number}</div>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      {c.claim_type?.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{c.patients?.name}</div>
                    <div className="text-xs text-slate-500">UHID: {c.patients?.patient_id}</div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{c.insurance_company}</div>
                    <div className="text-xs text-slate-500 font-mono">Pol: {c.policy_number}</div>
                    <div className="text-[11px] text-slate-400">{c.tpa_name}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(c.claim_status)}`}>
                      {c.claim_status?.replace(/_/g, ' ')}
                    </span>
                    {c.approval_code && (
                      <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                        Code: {c.approval_code}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-500">Est: {formatMoney(c.estimated_amount)}</div>
                    <div className="font-black text-sm text-emerald-700">
                      Approved: {formatMoney(c.approved_amount)}
                    </div>
                    <div className="text-[11px] text-slate-400">Co-pay: {c.copay_percentage}%</div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openActionModal(c)}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition"
                    >
                      Process / Settle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: FILE NEW PRE-AUTH CLAIM */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">File Cashless Pre-Auth Claim</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Patient *
                </label>
                <select
                  required
                  value={claimForm.patient_id}
                  onChange={(e) => setClaimForm({ ...claimForm, patient_id: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.patient_id} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Insurance Provider Company *
                </label>
                <select
                  value={claimForm.insurance_company}
                  onChange={(e) => setClaimForm({ ...claimForm, insurance_company: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Green Delta Health Insurance Ltd">Green Delta Health Insurance Ltd</option>
                  <option value="MetLife Bangladesh Healthcare">MetLife Bangladesh Healthcare</option>
                  <option value="Pragati Life Insurance TPA">Pragati Life Insurance TPA</option>
                  <option value="Bupa Global International">Bupa Global International</option>
                  <option value="Pioneer Insurance Healthcare">Pioneer Insurance Healthcare</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Policy / Membership Card Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GD-CORP-99281-H"
                  value={claimForm.policy_number}
                  onChange={(e) => setClaimForm({ ...claimForm, policy_number: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Estimated Cost *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="৳"
                    value={claimForm.estimated_amount}
                    onChange={(e) => setClaimForm({ ...claimForm, estimated_amount: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Co-pay %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={claimForm.copay_percentage}
                    onChange={(e) => setClaimForm({ ...claimForm, copay_percentage: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pre-Auth Treatment Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. IPD Admission for elective lap cholecystectomy."
                  value={claimForm.remarks}
                  onChange={(e) => setClaimForm({ ...claimForm, remarks: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'File Pre-Auth'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROCESS / APPROVE / SETTLE CLAIM */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Process Claim #{selectedClaim.claim_number}
              </h3>
              <button onClick={() => setSelectedClaim(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleUpdateClaim} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Claim Status
                </label>
                <select
                  value={actionForm.claim_status}
                  onChange={(e) => setActionForm({ ...actionForm, claim_status: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  <option value="Approved">Approved (Pre-Auth Granted)</option>
                  <option value="Settled">Settled (Hospital Account Paid)</option>
                  <option value="Under_Query">Under Query / Documents Required</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Approved Amount (৳/$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={actionForm.approved_amount}
                  onChange={(e) => setActionForm({ ...actionForm, approved_amount: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Authorization Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. AUTH-GD-2026-8812"
                  value={actionForm.approval_code}
                  onChange={(e) => setActionForm({ ...actionForm, approval_code: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Settlement Remarks
                </label>
                <textarea
                  rows="2"
                  value={actionForm.remarks}
                  onChange={(e) => setActionForm({ ...actionForm, remarks: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save & Update Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceClaims;
