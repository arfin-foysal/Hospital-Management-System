import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Plus, 
  Search, 
  Activity, 
  Heart, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  User, 
  Phone, 
  Ambulance, 
  X, 
  ShieldAlert, 
  BedDouble, 
  Thermometer, 
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EmergencyTriage = () => {
  const { isDoctor, isAdmin, isReceptionist } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triageFilter, setTriageFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Metadata for IPD Transfer
  const [availableBeds, setAvailableBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: 'Male',
    phone: '',
    emergency_contact: '',
    triage_level: 'Yellow',
    arrival_mode: 'Ambulance',
    gcs_score: '15',
    spo2: '98',
    bp: '120/80',
    pulse: '76',
    temperature: '98.6',
    condition_summary: '',
    initial_treatment: '',
    assigned_bed: 'ER-Resuscitation Bay 1'
  });

  const [transferForm, setTransferForm] = useState({
    bed_id: '',
    doctor_id: '',
    admission_reason: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCases();
    fetchMetadata();
  }, [triageFilter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (triageFilter) params.triage_level = triageFilter;
      const res = await api.get('/emergency', { params });
      setCases(res.data.data || []);
    } catch (err) {
      console.error('Error fetching emergency cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [bedsRes, docsRes] = await Promise.all([
        api.get('/ipd/beds', { params: { status: 'Available' } }),
        api.get('/appointments/meta/doctors')
      ]);
      setAvailableBeds(bedsRes.data.data || []);
      setDoctors(docsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/emergency', formData);
      setSuccessMsg('Emergency casualty intake created and triaged!');
      setShowAddModal(false);
      setFormData({
        patient_name: '',
        age: '',
        gender: 'Male',
        phone: '',
        emergency_contact: '',
        triage_level: 'Yellow',
        arrival_mode: 'Ambulance',
        gcs_score: '15',
        spo2: '98',
        bp: '120/80',
        pulse: '76',
        temperature: '98.6',
        condition_summary: '',
        initial_treatment: '',
        assigned_bed: 'ER-Resuscitation Bay 1'
      });
      fetchCases();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register emergency case');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferToIPD = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post(`/emergency/${selectedCase.id}/transfer-ipd`, transferForm);
      setSuccessMsg(`Patient transferred to IPD bed successfully!`);
      setShowTransferModal(false);
      setSelectedCase(null);
      fetchCases();
      fetchMetadata();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transfer to IPD failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/emergency/${id}/status`, { status });
      fetchCases();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredCases = cases.filter(c =>
    c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.condition_summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const redCount = cases.filter(c => c.triage_level === 'Red' && c.status !== 'Discharged').length;
  const yellowCount = cases.filter(c => c.triage_level === 'Yellow' && c.status !== 'Discharged').length;
  const greenCount = cases.filter(c => c.triage_level === 'Green' && c.status !== 'Discharged').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Emergency &amp; Triage Casualty Center</h1>
            <p className="text-sm text-slate-500">Color-coded trauma triage, resuscitation tracking &amp; immediate IPD fast-track</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-rose-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Emergency Casualty Intake
        </button>
      </div>

      {/* Triage Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setTriageFilter(triageFilter === 'Red' ? '' : 'Red')}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer ${triageFilter === 'Red' ? 'border-rose-600 bg-rose-50 shadow-md' : 'bg-white border-rose-200 hover:border-rose-400'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                🔴 Code Red: Resuscitation
              </span>
              <div className="text-2xl font-black text-rose-700 mt-2 font-mono">{redCount} Active Cases</div>
              <p className="text-xs text-rose-600 mt-1">Immediate life threat (STEMI, Poly-trauma, Unconscious)</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
          </div>
        </div>

        <div 
          onClick={() => setTriageFilter(triageFilter === 'Yellow' ? '' : 'Yellow')}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer ${triageFilter === 'Yellow' ? 'border-amber-500 bg-amber-50 shadow-md' : 'bg-white border-amber-200 hover:border-amber-400'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                🟡 Code Yellow: Urgent
              </span>
              <div className="text-2xl font-black text-amber-800 mt-2 font-mono">{yellowCount} Active Cases</div>
              <p className="text-xs text-amber-700 mt-1">Severe pain, high pyrexia, fractures (Within 15-30m)</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-amber-500" />
          </div>
        </div>

        <div 
          onClick={() => setTriageFilter(triageFilter === 'Green' ? '' : 'Green')}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer ${triageFilter === 'Green' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'bg-white border-emerald-200 hover:border-emerald-400'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                🟢 Code Green: Non-Urgent
              </span>
              <div className="text-2xl font-black text-emerald-800 mt-2 font-mono">{greenCount} Active Cases</div>
              <p className="text-xs text-emerald-700 mt-1">Minor lacerations, soft sprains, walking wounded</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search casualty by case#, name, condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-slate-500">Filter:</span>
          {['', 'Red', 'Yellow', 'Green'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setTriageFilter(lvl)}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${triageFilter === lvl ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {lvl ? `Code ${lvl}` : 'All Casualties'}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading emergency cases...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border">
          <Ambulance className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-500" />
          <p className="font-bold text-slate-600">No Casualties in ER Queue</p>
          <p className="text-xs text-slate-400 mt-1">All incoming emergency cases will be displayed here in real time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => {
            const isRed = c.triage_level === 'Red';
            const isYellow = c.triage_level === 'Yellow';
            return (
              <div 
                key={c.id} 
                className={`p-5 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                  isRed 
                    ? 'border-rose-400 bg-rose-50/40 shadow-sm' 
                    : isYellow 
                    ? 'border-amber-300 bg-amber-50/30' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-slate-900">{c.case_number}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isRed ? 'bg-rose-600 text-white animate-pulse' : isYellow ? 'bg-amber-400 text-slate-900' : 'bg-emerald-600 text-white'
                        }`}>
                          Code {c.triage_level}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                          {c.arrival_mode}
                        </span>
                      </div>
                      <h3 className="font-black text-base text-slate-900 mt-1">{c.patient_name}</h3>
                      <div className="text-xs text-slate-500 font-medium">
                        {c.gender}, {c.age} years &bull; {c.phone || 'No Contact Listed'}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      c.status === 'Under_Treatment' ? 'bg-blue-100 text-blue-800' :
                      c.status === 'Transferred_to_IPD' ? 'bg-purple-100 text-purple-800' :
                      c.status === 'Discharged' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Vitals Ribbon */}
                  <div className="grid grid-cols-5 gap-1.5 py-3 text-center text-xs border-b border-slate-200 font-mono">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[9px] text-slate-400 uppercase">GCS</div>
                      <div className={`font-bold ${c.gcs_score < 12 ? 'text-rose-600' : 'text-slate-800'}`}>{c.gcs_score}/15</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[9px] text-slate-400 uppercase">SPO2</div>
                      <div className={`font-bold ${c.spo2 < 92 ? 'text-rose-600 font-black' : 'text-slate-800'}`}>{c.spo2}%</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[9px] text-slate-400 uppercase">BP</div>
                      <div className="font-bold text-slate-800">{c.bp}</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[9px] text-slate-400 uppercase">Pulse</div>
                      <div className="font-bold text-slate-800">{c.pulse} bpm</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[9px] text-slate-400 uppercase">Temp</div>
                      <div className="font-bold text-slate-800">{c.temperature} °F</div>
                    </div>
                  </div>

                  {/* Clinical condition */}
                  <div className="py-3 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-500 font-semibold">Trauma / Condition:</span>
                      <p className="font-bold text-slate-800 mt-0.5">{c.condition_summary}</p>
                    </div>
                    {c.initial_treatment && (
                      <div className="p-2 rounded bg-white/70 border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Stat ER Interventions:</span>
                        <p className="text-slate-700 font-medium">{c.initial_treatment}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">
                    Location: <strong className="text-slate-800">{c.assigned_bed}</strong>
                  </span>
                  
                  <div className="flex space-x-2">
                    {c.status !== 'Transferred_to_IPD' && c.status !== 'Discharged' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setTransferForm({
                              bed_id: availableBeds[0]?.id || '',
                              doctor_id: doctors[0]?.id || '',
                              admission_reason: `ER Transfer: ${c.condition_summary}`
                            });
                            setShowTransferModal(true);
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center cursor-pointer"
                        >
                          <BedDouble className="w-3.5 h-3.5 mr-1" />
                          Admit to IPD
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Discharged')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                        >
                          Discharge
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Emergency Casualty Intake Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center">
                <AlertOctagon className="w-5 h-5 mr-2 text-rose-600" />
                Emergency Casualty Intake &amp; Triage Form
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Patient Name (or Unknown Trauma) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe / Rashid Al-Mansoor"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Triage Priority *</label>
                  <select
                    value={formData.triage_level}
                    onChange={(e) => setFormData({ ...formData, triage_level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-rose-600"
                  >
                    <option value="Red">🔴 Code Red (Resuscitation)</option>
                    <option value="Yellow">🟡 Code Yellow (Urgent)</option>
                    <option value="Green">🟢 Code Green (Non-urgent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Arrival Mode</label>
                  <select
                    value={formData.arrival_mode}
                    onChange={(e) => setFormData({ ...formData, arrival_mode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Ambulance">Ambulance</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Police/Referral">Police / Referral</option>
                  </select>
                </div>
              </div>

              {/* Vitals row */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Triage Vitals Baseline</span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 block">GCS (3-15)</label>
                    <input
                      type="number"
                      value={formData.gcs_score}
                      onChange={(e) => setFormData({ ...formData, gcs_score: e.target.value })}
                      className="w-full p-1 border rounded text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">SPO2 (%)</label>
                    <input
                      type="number"
                      value={formData.spo2}
                      onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                      className="w-full p-1 border rounded text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">BP</label>
                    <input
                      type="text"
                      value={formData.bp}
                      onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                      className="w-full p-1 border rounded text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">Pulse</label>
                    <input
                      type="text"
                      value={formData.pulse}
                      onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                      className="w-full p-1 border rounded text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">Temp (°F)</label>
                    <input
                      type="text"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="w-full p-1 border rounded text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Presenting Trauma / Critical Condition *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Acute severe chest pain, shortness of breath, suspected acute myocardial infarction..."
                  value={formData.condition_summary}
                  onChange={(e) => setFormData({ ...formData, condition_summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stat ER Interventions Rendered</label>
                <input
                  type="text"
                  placeholder="e.g. O2 high-flow, IV cannula 18G, Aspirin 300mg, stat ECG ordered..."
                  value={formData.initial_treatment}
                  onChange={(e) => setFormData({ ...formData, initial_treatment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Initiating...' : 'Intake Casualty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer to IPD Modal */}
      {showTransferModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Transfer ER Patient to Inpatient Bed</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferToIPD} className="mt-4 space-y-4">
              <div className="p-3 bg-purple-50 text-purple-900 rounded-xl text-xs space-y-1">
                <div><strong>Patient:</strong> {selectedCase.patient_name} ({selectedCase.age}y, {selectedCase.gender})</div>
                <div><strong>Condition:</strong> {selectedCase.condition_summary}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Available Bed *</label>
                <select
                  required
                  value={transferForm.bed_id}
                  onChange={(e) => setTransferForm({ ...transferForm, bed_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">-- Choose Bed --</option>
                  {availableBeds.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bed_number} ({b.ward_type}) - ${b.daily_charge}/day
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Attending Consultant Doctor *</label>
                <select
                  required
                  value={transferForm.doctor_id}
                  onChange={(e) => setTransferForm({ ...transferForm, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admission Clinical Reason</label>
                <input
                  type="text"
                  value={transferForm.admission_reason}
                  onChange={(e) => setTransferForm({ ...transferForm, admission_reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Admitting...' : 'Confirm IPD Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyTriage;

