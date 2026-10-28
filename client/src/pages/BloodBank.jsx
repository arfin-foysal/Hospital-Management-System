import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  Droplet, 
  X, 
  AlertCircle, 
  Calendar, 
  User, 
  Phone, 
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BloodBank = () => {
  const { isLabTech, isAdmin, isDoctor } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'donors' | 'requisitions'
  const [inventory, setInventory] = useState([]);
  const [stockSummary, setStockSummary] = useState({});
  const [donors, setDonors] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');

  // Modals
  const [showAddBagModal, setShowAddBagModal] = useState(false);
  const [showAddDonorModal, setShowAddDonorModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // Forms
  const [bagForm, setBagForm] = useState({
    donor_id: '',
    blood_group: 'O+',
    component_type: 'Whole Blood',
    volume_ml: '450',
    storage_location: 'Blood Bank Refrigerator #1'
  });

  const [donorForm, setDonorForm] = useState({
    name: '',
    blood_group: 'O+',
    gender: 'Male',
    age: '28',
    phone: '',
    email: '',
    address: ''
  });

  const [reqForm, setReqForm] = useState({
    patient_id: '',
    blood_group: 'O+',
    component_type: 'Whole Blood',
    units_required: '1',
    urgency: 'Routine',
    notes: '',
    required_date: new Date().toISOString().slice(0, 10)
  });

  const [issueForm, setIssueForm] = useState({
    bag_id: '',
    notes: 'Cross-match compatible'
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchDonors();
    fetchRequisitions();
    fetchPatients();
  }, [selectedGroup]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGroup) params.blood_group = selectedGroup;
      const res = await api.get('/blood-bank/inventory', { params });
      setInventory(res.data.bags || []);
      setStockSummary(res.data.stockSummary || {});
    } catch (err) {
      console.error('Error fetching blood inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonors = async () => {
    try {
      const res = await api.get('/blood-bank/donors');
      setDonors(res.data.data || []);
    } catch (err) {
      console.error('Error fetching donors:', err);
    }
  };

  const fetchRequisitions = async () => {
    try {
      const res = await api.get('/blood-bank/requisitions');
      setRequisitions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching blood requisitions:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleAddBag = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/blood-bank/inventory', bagForm);
      setSuccessMsg('Blood unit added to cold storage inventory!');
      setShowAddBagModal(false);
      fetchInventory();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add blood unit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/blood-bank/donors', donorForm);
      setSuccessMsg('Blood donor registered successfully!');
      setShowAddDonorModal(false);
      setDonorForm({ name: '', blood_group: 'O+', gender: 'Male', age: '28', phone: '', email: '', address: '' });
      fetchDonors();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register donor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/blood-bank/requisitions', reqForm);
      setSuccessMsg('Blood requisition submitted for cross-matching!');
      setShowReqModal(false);
      fetchRequisitions();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueBag = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.patch(`/blood-bank/requisitions/${selectedReq.id}/issue`, issueForm);
      setSuccessMsg(`Blood unit issued to patient transfusion team!`);
      setShowIssueModal(false);
      setSelectedReq(null);
      fetchRequisitions();
      fetchInventory();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to issue blood unit');
    } finally {
      setSubmitting(false);
    }
  };

  const availableBags = inventory.filter(b => b.status === 'Available');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <Droplet className="w-6 h-6 fill-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Blood Bank &amp; Transfusion Services</h1>
            <p className="text-sm text-slate-500">Cold chain storage, voluntary donor registry, cross-matching &amp; unit issue</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'inventory' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Inventory ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'donors' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Donors ({donors.length})
            </button>
            <button
              onClick={() => setActiveTab('requisitions')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'requisitions' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Transfusion Requisitions ({requisitions.length})
            </button>
          </div>

          {(isLabTech || isAdmin) && activeTab === 'inventory' && (
            <button
              onClick={() => setShowAddBagModal(true)}
              className="flex items-center px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Blood Bag
            </button>
          )}

          {activeTab === 'donors' && (
            <button
              onClick={() => setShowAddDonorModal(true)}
              className="flex items-center px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              Register Donor
            </button>
          )}

          {activeTab === 'requisitions' && (
            <button
              onClick={() => setShowReqModal(true)}
              className="flex items-center px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              Request Blood
            </button>
          )}
        </div>
      </div>

      {/* Stock Cards by Blood Group */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {bloodGroups.map(bg => {
          const count = stockSummary[bg] || 0;
          const isSelected = selectedGroup === bg;
          return (
            <div
              key={bg}
              onClick={() => setSelectedGroup(isSelected ? '' : bg)}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                isSelected 
                  ? 'border-rose-600 bg-rose-50 shadow-md ring-2 ring-rose-500' 
                  : count > 0 
                  ? 'bg-white border-slate-200 hover:border-rose-300' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-sm font-black text-slate-800 font-mono">{bg}</div>
              <div className={`text-xl font-black mt-1 ${count > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {count}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Units</div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* TAB 1: BLOOD INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-600">
            <span>Stored Blood Components &amp; Cold Chain Status</span>
            <span>Total Available: {availableBags.length} Units</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Bag Serial #</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Component Type</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Collected Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Storage Refrigerator</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {inventory.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.bag_number}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded font-black text-xs bg-rose-100 text-rose-800 font-mono">
                        {b.blood_group.replace('_POS', '+').replace('_NEG', '-')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">{b.component_type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-xs font-mono">{b.volume_ml} mL</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{b.collected_date}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-amber-700">{b.expiry_date}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{b.storage_location}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        b.status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                        b.status === 'Reserved' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DONORS REGISTRY */}
      {activeTab === 'donors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Donor ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Gender / Age</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Donation Count</th>
                  <th className="py-3 px-4">Last Donated</th>
                  <th className="py-3 px-4">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donors.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{d.donor_code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3 px-4 font-mono font-black text-rose-700">
                      {d.blood_group.replace('_POS', '+').replace('_NEG', '-')}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{d.gender}, {d.age}y</td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-mono">{d.phone}</td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-800">{d.total_donations} times</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{d.last_donation_date || 'First time'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {d.is_eligible ? 'Eligible' : 'Deferred'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REQUISITIONS & TRANSFUSION */}
      {activeTab === 'requisitions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Req #</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Group Needed</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Crossmatch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requisitions.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">{r.req_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{r.patient_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{r.patient_code}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-rose-700">
                      {r.blood_group.replace('_POS', '+').replace('_NEG', '-')}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-800">{r.units_required} unit(s)</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.urgency.includes('Emergency') ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {r.urgency.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">
                      <span className={r.crossmatch_status === 'Compatible' ? 'text-emerald-600' : 'text-amber-600'}>
                        {r.crossmatch_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.status === 'Issued' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status !== 'Issued' && (isLabTech || isAdmin) && (
                        <button
                          onClick={() => {
                            setSelectedReq(r);
                            const matchingBag = availableBags.find(b => b.blood_group === r.blood_group);
                            setIssueForm({ bag_id: matchingBag?.id || availableBags[0]?.id || '', notes: 'Cross-matched & issued to transfusion unit' });
                            setShowIssueModal(true);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Crossmatch &amp; Issue
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Blood Bag Modal */}
      {showAddBagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Add Blood Bag to Cold Chain Inventory</h3>
              <button onClick={() => setShowAddBagModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBag} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Group *</label>
                <select
                  value={bagForm.blood_group}
                  onChange={(e) => setBagForm({ ...bagForm, blood_group: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-black font-mono text-rose-700"
                >
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Component Type</label>
                <select
                  value={bagForm.component_type}
                  onChange={(e) => setBagForm({ ...bagForm, component_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Packed Red Blood Cells (PRBC)">Packed Red Blood Cells (PRBC)</option>
                  <option value="Platelets">Platelets</option>
                  <option value="Fresh Frozen Plasma (FFP)">Fresh Frozen Plasma (FFP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Volume (mL)</label>
                <input
                  type="number"
                  value={bagForm.volume_ml}
                  onChange={(e) => setBagForm({ ...bagForm, volume_ml: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cold Storage Location</label>
                <input
                  type="text"
                  value={bagForm.storage_location}
                  onChange={(e) => setBagForm({ ...bagForm, storage_location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddBagModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Store Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Donor Modal */}
      {showAddDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Register Voluntary Blood Donor</h3>
              <button onClick={() => setShowAddDonorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Donor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Group *</label>
                  <select
                    value={donorForm.blood_group}
                    onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-black font-mono text-rose-700"
                  >
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    value={donorForm.age}
                    onChange={(e) => setDonorForm({ ...donorForm, age: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1711 000000"
                  value={donorForm.phone}
                  onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddDonorModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Register Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blood Requisition Modal */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Submit Blood Transfusion Request</h3>
              <button onClick={() => setShowReqModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Patient *</label>
                <select
                  required
                  value={reqForm.patient_id}
                  onChange={(e) => setReqForm({ ...reqForm, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patient_id}) - Blood: {p.blood_group}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Group *</label>
                  <select
                    value={reqForm.blood_group}
                    onChange={(e) => setReqForm({ ...reqForm, blood_group: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-rose-700"
                  >
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Units Required</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reqForm.units_required}
                    onChange={(e) => setReqForm({ ...reqForm, units_required: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Urgency</label>
                <select
                  value={reqForm.urgency}
                  onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Routine">Routine Elective</option>
                  <option value="Urgent">Urgent (Within 4 hours)</option>
                  <option value="Emergency - Immediate">Emergency - Immediate Stat (OT / Trauma)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clinical Indication / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Pre-op orthopedic surgery, Hb 7.8 g/dL..."
                  value={reqForm.notes}
                  onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crossmatch & Issue Blood Modal */}
      {showIssueModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Issue Blood Unit to Ward/OT</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueBag} className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div><strong>Patient:</strong> {selectedReq.patient_name}</div>
                <div><strong>Group:</strong> <span className="font-bold text-rose-700">{selectedReq.blood_group}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Compatible Bag from Inventory *</label>
                <select
                  required
                  value={issueForm.bag_id}
                  onChange={(e) => setIssueForm({ ...issueForm, bag_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                >
                  <option value="">-- Choose Blood Bag --</option>
                  {availableBags.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bag_number} ({b.blood_group}) - Exp: {b.expiry_date}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cross-match Verification Remarks</label>
                <input
                  type="text"
                  value={issueForm.notes}
                  onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Issuing...' : 'Confirm Transfusion Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodBank;

