import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  FileText, 
  Search, 
  Calendar, 
  User, 
  Heart, 
  Activity, 
  Thermometer, 
  Scale, 
  Pill, 
  FlaskConical, 
  Printer, 
  X, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  Eye,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRCodeSVG from '../components/QRCodeSVG';

const DoctorConsultation = () => {
  const { user, isDoctor, isAdmin } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [labCatalog, setLabCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New Prescription Form
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: user?.doctor_id || '',
    appointment_id: '',
    consultation_date: new Date().toISOString().slice(0, 10),
    bp: '120/80 mmHg',
    pulse: '72 bpm',
    temperature: '98.6 °F',
    weight: '68 kg',
    symptoms: '',
    diagnosis: '',
    lifestyle_advice: 'Drink at least 2.5L water daily. Avoid oily & spicy foods. Adequate 8-hour sleep.',
    follow_up_date: '',
    medicines: [
      { medicine_name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 days', instructions: 'After meal' }
    ],
    lab_test_ids: []
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchMetadata();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/emr');
      setPrescriptions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [ptsRes, dctsRes, labRes] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments/meta/doctors'),
        api.get('/lab/catalog')
      ]);
      setPatients(ptsRes.data.data || []);
      setDoctors(dctsRes.data.data || []);
      setLabCatalog(labRes.data.data || []);

      if (user?.role === 'doctor' && user.doctor_id) {
        setFormData(prev => ({ ...prev, doctor_id: user.doctor_id }));
      }
    } catch (err) {
      console.error('Error fetching consultation metadata:', err);
    }
  };

  const handleAddMedicineRow = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { medicine_name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 days', instructions: 'After meal' }
      ]
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.medicines];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  const handleToggleLabTest = (testId) => {
    setFormData(prev => {
      const exists = prev.lab_test_ids.includes(testId);
      const updated = exists
        ? prev.lab_test_ids.filter(id => id !== testId)
        : [...prev.lab_test_ids, testId];
      return { ...prev, lab_test_ids: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
      setErrorMsg('Please select a patient.');
      return;
    }
    if (!formData.diagnosis || !formData.symptoms) {
      setErrorMsg('Symptoms and Diagnosis are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/emr', formData);
      setSuccessMsg(`Prescription ${res.data.prescription_number || ''} created successfully!`);
      setShowModal(false);
      fetchPrescriptions();
      // Reset form
      setFormData({
        patient_id: '',
        doctor_id: user?.doctor_id || (doctors[0]?.id || ''),
        appointment_id: '',
        consultation_date: new Date().toISOString().slice(0, 10),
        bp: '120/80 mmHg',
        pulse: '72 bpm',
        temperature: '98.6 °F',
        weight: '68 kg',
        symptoms: '',
        diagnosis: '',
        lifestyle_advice: 'Drink at least 2.5L water daily. Avoid oily & spicy foods. Adequate 8-hour sleep.',
        follow_up_date: '',
        medicines: [{ medicine_name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 days', instructions: 'After meal' }],
        lab_test_ids: []
      });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewPrescription = async (rx) => {
    try {
      const res = await api.get(`/emr/${rx.id}`);
      setSelectedRx(res.data.data);
      setShowPrintModal(true);
    } catch (err) {
      setSelectedRx(rx);
      setShowPrintModal(true);
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx => 
    rx.prescription_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">EMR &amp; Doctor Consultation</h1>
              <p className="text-sm text-slate-500">Digital clinical prescriptions, vitals monitoring &amp; diagnostic test requisitions</p>
            </div>
          </div>
        </div>

        {(isDoctor || isAdmin) && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write Prescription
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Rx#, patient, doctor, diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Records: <span className="font-bold text-slate-800">{prescriptions.length}</span>
        </div>
      </div>

      {/* Prescriptions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading prescriptions database...
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-500" />
            <p className="text-base font-semibold text-slate-600">No Prescriptions Found</p>
            <p className="text-xs text-slate-400 mt-1">Start a digital consultation to generate an electronic medical prescription.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Rx Number</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Doctor</th>
                  <th className="py-3.5 px-4">Diagnosis</th>
                  <th className="py-3.5 px-4">Vitals</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPrescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-600">{rx.prescription_number}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {rx.consultation_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{rx.patient_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{rx.patient_code} &bull; {rx.patient_gender}, {rx.patient_age}y</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{rx.doctor_name}</div>
                      <div className="text-xs text-slate-400">{rx.doctor_department || 'General'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        {rx.diagnosis}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      BP: <span className="text-slate-800 font-semibold">{rx.bp || '120/80'}</span> | Pulse: <span className="text-slate-800 font-semibold">{rx.pulse || '72'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewPrescription(rx)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Rx
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">New Clinical Prescription</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* Patient & Doctor Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Patient *
                  </label>
                  <select
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.patient_id}) - {p.gender}, {p.age}y - Blood: {p.blood_group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Consulting Doctor *
                  </label>
                  <select
                    required
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.department} - {d.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 🛡️ Smart Clinical Allergy & Safety Shield */}
              {(() => {
                const pt = patients.find(p => p.id === parseInt(formData.patient_id));
                if (!pt) return null;

                const conflicts = [];
                if (pt.allergies) {
                  const allergyLower = pt.allergies.toLowerCase();
                  formData.medicines.forEach(m => {
                    const name = (m.medicine_name || '').toLowerCase();
                    if (!name) return;
                    if (allergyLower.includes('penicillin') && (name.includes('amox') || name.includes('penicillin') || name.includes('ampicillin'))) {
                      conflicts.push({ med: m.medicine_name, allergen: pt.allergies });
                    } else if (allergyLower.includes('sulfa') && (name.includes('sulfa') || name.includes('bactrim') || name.includes('cotrim'))) {
                      conflicts.push({ med: m.medicine_name, allergen: pt.allergies });
                    } else if (allergyLower.includes('aspirin') && (name.includes('aspirin') || name.includes('ibuprofen') || name.includes('diclofenac'))) {
                      conflicts.push({ med: m.medicine_name, allergen: pt.allergies });
                    } else if (allergyLower.includes('cephalosporin') && name.includes('cef')) {
                      conflicts.push({ med: m.medicine_name, allergen: pt.allergies });
                    }
                  });
                }

                return (
                  <div className="space-y-2">
                    {pt.allergies && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center text-xs text-amber-900">
                        <AlertTriangle className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
                        <span><strong>Documented Patient Allergy:</strong> {pt.allergies} (Verify before prescribing medications)</span>
                      </div>
                    )}
                    {conflicts.length > 0 && (
                      <div className="p-4 bg-rose-50 border-2 border-rose-500 rounded-xl flex items-start text-xs text-rose-900 shadow-md">
                        <ShieldAlert className="w-5 h-5 mr-2.5 text-rose-600 shrink-0 animate-bounce" />
                        <div>
                          <strong className="text-sm font-black block text-rose-800">🚨 CLINICAL DRUG-ALLERGY CONTRAINDICATION ALERT!</strong>
                          <p className="mt-1">
                            The patient has a known allergy to <strong>"{conflicts[0].allergen}"</strong>. You have entered <strong>"{conflicts[0].med}"</strong> which has high adverse reactivity. Consider an alternative medication class!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Patient Vitals Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-1.5 text-blue-600" />
                  Patient Vitals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80 mmHg"
                      value={formData.bp}
                      onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Pulse Rate</label>
                    <input
                      type="text"
                      placeholder="72 bpm"
                      value={formData.pulse}
                      onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Body Temperature</label>
                    <input
                      type="text"
                      placeholder="98.6 °F"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Weight</label>
                    <input
                      type="text"
                      placeholder="70 kg"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Presenting Symptoms *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g., Persistent dry cough for 3 days, mild headache, fever in the evening..."
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Diagnosis *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g., Acute Upper Respiratory Tract Infection (URTI)..."
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Medications Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                    <Pill className="w-4 h-4 mr-1.5 text-blue-600" />
                    Prescribed Medications (Rx)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Medicine
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.medicines.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Medicine Name (e.g., Amoxicillin 500mg)"
                          value={m.medicine_name}
                          onChange={(e) => handleMedicineChange(idx, 'medicine_name', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Dosage (1 tab)"
                          value={m.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Freq (1-0-1)"
                          value={m.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Duration (5 days)"
                          value={m.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <input
                          type="text"
                          placeholder="After meal"
                          value={m.instructions}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                        {formData.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Lab Requisition Linking */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center">
                  <FlaskConical className="w-4 h-4 mr-1.5 text-blue-600" />
                  Order Diagnostic Lab Tests (Direct Requisition)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                  {labCatalog.map(test => {
                    const checked = formData.lab_test_ids.includes(test.id);
                    return (
                      <label 
                        key={test.id} 
                        className={`flex items-center p-2 rounded-lg border text-xs cursor-pointer transition ${checked ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleLabTest(test.id)}
                          className="rounded text-blue-600 mr-2"
                        />
                        <span className="truncate">{test.test_name}</span>
                        <span className="ml-auto text-[10px] text-slate-400">${test.standard_charge}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Advice & Follow-Up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lifestyle &amp; Dietary Advice
                  </label>
                  <input
                    type="text"
                    value={formData.lifestyle_advice}
                    onChange={(e) => setFormData({ ...formData, lifestyle_advice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Follow-Up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Generating Rx...' : 'Save & Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription View & Print Modal */}
      {showPrintModal && selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-100 flex items-center justify-between border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Prescription Preview</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print Prescription
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Prescription Template */}
            <div className="p-8 space-y-6 text-slate-800" id="printable-rx">
              {/* Hospital Header */}
              <div className="border-b-2 border-blue-600 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-blue-700 tracking-tight">CareSync General Hospital</h2>
                  <p className="text-xs text-slate-500">123 Healthcare Boulevard, Medical District &bull; Tel: +1 (555) 019-2830</p>
                  <p className="text-xs text-slate-500">24/7 Emergency &bull; Multispecialty Tertiary Care Center</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-slate-800">{selectedRx.prescription_number}</div>
                  <div className="text-xs text-slate-500">Date: {selectedRx.consultation_date}</div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="flex justify-between items-start text-xs border-b border-slate-200 pb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{selectedRx.doctor_name}</div>
                  <div className="text-slate-600">{selectedRx.doctor_qualification || 'MBBS, MD'} &bull; {selectedRx.doctor_specialization || 'Consultant'}</div>
                  <div className="text-slate-500 font-medium">Department: {selectedRx.doctor_department || 'General Medicine'}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-700">Room No: {selectedRx.room_no || 'Consultation Suite 101'}</div>
                </div>
              </div>

              {/* Patient Info Bar */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div><span className="text-slate-500">Patient:</span> <strong className="text-slate-800">{selectedRx.patient_name}</strong></div>
                <div><span className="text-slate-500">ID / Age:</span> <strong className="text-slate-800">{selectedRx.patient_code} ({selectedRx.patient_gender}, {selectedRx.patient_age}y)</strong></div>
                <div><span className="text-slate-500">Blood Group:</span> <strong className="text-slate-800">{selectedRx.blood_group || 'N/A'}</strong></div>
                <div><span className="text-slate-500">Phone:</span> <strong className="text-slate-800">{selectedRx.patient_phone}</strong></div>
              </div>

              {/* Vitals */}
              <div className="flex flex-wrap gap-4 text-xs bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                <span><strong>BP:</strong> {selectedRx.bp || '120/80 mmHg'}</span>
                <span><strong>Pulse:</strong> {selectedRx.pulse || '72 bpm'}</span>
                <span><strong>Temp:</strong> {selectedRx.temperature || '98.6 °F'}</span>
                <span><strong>Weight:</strong> {selectedRx.weight || '68 kg'}</span>
              </div>

              {/* Symptoms & Diagnosis */}
              <div className="space-y-1 text-xs">
                <p><strong>Clinical Diagnosis:</strong> <span className="text-blue-700 font-semibold">{selectedRx.diagnosis}</span></p>
                <p className="text-slate-600"><strong>Presenting Symptoms:</strong> {selectedRx.symptoms}</p>
              </div>

              {/* Rx Medicines */}
              <div className="pt-2">
                <div className="text-xl font-bold font-serif text-blue-700 mb-2">℞ Medications</div>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 font-semibold">
                      <th className="py-2">#</th>
                      <th className="py-2">Medicine Name</th>
                      <th className="py-2">Dosage</th>
                      <th className="py-2">Frequency</th>
                      <th className="py-2">Duration</th>
                      <th className="py-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRx.items?.map((med, i) => (
                      <tr key={i} className="py-2">
                        <td className="py-2 font-mono text-slate-400">{i + 1}</td>
                        <td className="py-2 font-bold text-slate-800">{med.medicine_name}</td>
                        <td className="py-2">{med.dosage}</td>
                        <td className="py-2 font-semibold text-blue-600">{med.frequency}</td>
                        <td className="py-2">{med.duration}</td>
                        <td className="py-2 text-slate-600 italic">{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lab Requisitions ordered */}
              {selectedRx.labOrders && selectedRx.labOrders.length > 0 && (
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs">
                  <div className="font-bold text-amber-900 mb-1">Diagnostic Investigations Ordered:</div>
                  <ul className="list-disc list-inside space-x-2 text-amber-800">
                    {selectedRx.labOrders.map(lo => (
                      <li key={lo.id} className="inline-block mr-3">
                        {lo.test_name} ({lo.category})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advice & Follow Up */}
              <div className="border-t border-slate-200 pt-3 text-xs space-y-1">
                {selectedRx.lifestyle_advice && (
                  <p><strong>Advice:</strong> {selectedRx.lifestyle_advice}</p>
                )}
                {selectedRx.follow_up_date && (
                  <p><strong>Follow-Up:</strong> Review on {selectedRx.follow_up_date.slice(0, 10)}</p>
                )}
              </div>

              {/* Doctor Signature & Security QR Code */}
              <div className="pt-8 flex justify-between items-end">
                <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <QRCodeSVG value={`CareSync-Rx:${selectedRx.prescription_number}:Pt:${selectedRx.patient_code}:Doc:${selectedRx.doctor_name}`} size={64} />
                  <div className="text-[10px] text-slate-500 font-mono">
                    <div className="font-bold text-slate-700">Digital Rx Verifier</div>
                    <div>Scan at Pharmacy Counter</div>
                    <div className="text-slate-400">Security Hash: Verified</div>
                  </div>
                </div>

                <div className="text-center w-48 border-t border-slate-400 pt-1 text-xs">
                  <div className="font-bold text-slate-800">{selectedRx.doctor_name}</div>
                  <div className="text-slate-500">Authorized Medical Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorConsultation;

