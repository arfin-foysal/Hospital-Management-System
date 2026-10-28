import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Stethoscope, 
  Calendar, 
  FlaskConical, 
  BedDouble, 
  Receipt, 
  X, 
  Check, 
  AlertCircle,
  Tag
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PatientWristbandModal from '../components/PatientWristbandModal';

const Patients = () => {
  const { isAdmin, isReceptionist, isDoctor } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [wristbandPatient, setWristbandPatient] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    allergies: '',
    chronic_conditions: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients', { params: { search } });
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = async (patient) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/patients/${patient.id}`);
      setPatientHistory(res.data.history);
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setSubmitting(true);
      const res = await api.post('/patients', formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        blood_group: 'O+',
        phone: '',
        email: '',
        address: '',
        emergency_contact: '',
        allergies: '',
        chronic_conditions: ''
      });
      fetchPatients();
      handleOpenProfile(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Patient Management Module</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new patients, look up digital medical histories, and manage demographics.
          </p>
        </div>

        {(isAdmin || isReceptionist || isDoctor) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient ID (e.g. PAT-2026-0001), Phone number, or Full Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/70">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Name & Demographics</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {pat.patient_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{pat.name}</span>
                      <span className="text-[11px] text-slate-400">{pat.gender}, {pat.age} yrs</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        {pat.blood_group}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-medium block">{pat.phone}</span>
                      {pat.emergency_contact && (
                        <span className="text-[10px] text-slate-400 truncate block max-w-xs">ICE: {pat.emergency_contact}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {pat.address || 'Dhaka, Bangladesh'}
                    </td>
                    <td className="py-3.5 px-4">
                      {pat.is_admitted > 0 ? (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          IPD Admitted
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Outpatient
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setWristbandPatient(pat)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg text-xs transition"
                          title="Print Hospital Wristband & Specimen Barcode"
                        >
                          <Tag className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleOpenProfile(pat)}
                          className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          View History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                    <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2 py-0.5 rounded-md">
                      {selectedPatient.patient_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedPatient.gender}, {selectedPatient.age} yrs • Blood Group: <span className="font-bold text-rose-600">{selectedPatient.blood_group}</span> • Phone: {selectedPatient.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 border-b border-amber-200/60 px-5 py-2.5 flex flex-wrap gap-4 text-xs text-amber-900">
              <div>
                <span className="font-bold">Known Allergies: </span>
                <span>{selectedPatient.allergies || 'None reported'}</span>
              </div>
              <div>
                <span className="font-bold">Chronic Conditions: </span>
                <span>{selectedPatient.chronic_conditions || 'None reported'}</span>
              </div>
            </div>

            <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-bold text-slate-500">
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'prescriptions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>EMR Prescriptions ({patientHistory?.prescriptions?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'appointments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Appointments ({patientHistory?.appointments?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('lab')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'lab'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-800'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Lab Test Reports ({patientHistory?.labTests?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('admissions')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'admissions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-800'
                }`}
              >
                <BedDouble className="w-3.5 h-3.5" />
                <span>IPD Admissions ({patientHistory?.admissions?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'invoices'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-800'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Invoices & Billing ({patientHistory?.invoices?.length || 0})</span>
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading complete medical timeline...
                </div>
              ) : (
                <div>
                  {activeTab === 'prescriptions' && (
                    <div className="space-y-4">
                      {patientHistory?.prescriptions?.length === 0 ? (
                        <p className="text-slate-400 text-center py-8 text-xs">No digital prescriptions recorded.</p>
                      ) : (
                        patientHistory?.prescriptions?.map((rx) => (
                          <div key={rx.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div>
                                <span className="font-bold text-xs text-blue-700">{rx.prescription_number}</span>
                                <span className="text-xs text-slate-500 ml-2">• {rx.consultation_date}</span>
                              </div>
                              <div className="text-xs font-semibold text-slate-700">
                                {rx.doctor_name} ({rx.department})
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400 font-medium">Diagnosis:</span>
                                <p className="font-bold text-slate-800">{rx.diagnosis}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">Symptoms:</span>
                                <p className="text-slate-700">{rx.symptoms}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1">Prescribed Medicines:</p>
                              <div className="bg-white rounded-lg border border-slate-200 p-2 space-y-1">
                                {rx.items?.map((item) => (
                                  <div key={item.id} className="text-xs flex items-center justify-between text-slate-700">
                                    <span className="font-semibold text-blue-900">• {item.medicine_name} ({item.dosage})</span>
                                    <span className="text-slate-500">{item.frequency} | {item.duration} | {item.instructions}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'appointments' && (
                    <div className="divide-y divide-slate-100 text-xs">
                      {patientHistory?.appointments?.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No appointment history.</p>
                      ) : (
                        patientHistory?.appointments?.map((apt) => (
                          <div key={apt.id} className="py-3 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">Token #{apt.token_number} - {apt.appointment_number}</p>
                              <p className="text-slate-500">{apt.appointment_date} at {apt.appointment_time} • {apt.doctor_name} ({apt.department})</p>
                            </div>
                            <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full border border-slate-200">
                              {apt.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'lab' && (
                    <div className="space-y-3 text-xs">
                      {patientHistory?.labTests?.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No lab tests requested.</p>
                      ) : (
                        patientHistory?.labTests?.map((lab) => (
                          <div key={lab.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{lab.test_name} ({lab.category})</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                {lab.status}
                              </span>
                            </div>
                            <p className="text-slate-500">Ref: {lab.requisition_number} • Ordered by {lab.doctor_name} on {lab.test_date}</p>
                            {lab.result_value && (
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                                <span className="font-bold text-blue-700 block mb-0.5">Test Result:</span>
                                <p className="text-slate-800 font-medium">{lab.result_value}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'admissions' && (
                    <div className="space-y-3 text-xs">
                      {patientHistory?.admissions?.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No in-patient admission records.</p>
                      ) : (
                        patientHistory?.admissions?.map((adm) => (
                          <div key={adm.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-700">{adm.admission_number} - {adm.ward_type} ({adm.bed_number})</span>
                              <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[10px]">{adm.status}</span>
                            </div>
                            <p className="text-slate-600">Admitted: {adm.admission_date} • Attending: {adm.doctor_name}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'invoices' && (
                    <div className="space-y-3 text-xs">
                      {patientHistory?.invoices?.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No billing records found.</p>
                      ) : (
                        patientHistory?.invoices?.map((inv) => (
                          <div key={inv.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">{inv.invoice_number}</p>
                              <p className="text-slate-500">Date: {inv.billing_date} • Method: {inv.payment_method}</p>
                              <p className="text-slate-600 mt-0.5">Total: ৳{parseFloat(inv.total_amount).toLocaleString()} | Paid: ৳{parseFloat(inv.paid_amount).toLocaleString()} | Due: ৳{parseFloat(inv.due_amount).toLocaleString()}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
                              {inv.payment_status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Register New Patient Demographics</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1711..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Road, Area, City"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact (ICE)</label>
                  <input
                    type="text"
                    placeholder="Contact Name & Number"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drug Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Chronic Conditions / Past History</label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Diabetes Type 2"
                    value={formData.chronic_conditions}
                    onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Registering...' : 'Complete Registration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Wristband & Specimen Label Modal */}
      <PatientWristbandModal
        isOpen={!!wristbandPatient}
        onClose={() => setWristbandPatient(null)}
        patient={wristbandPatient}
      />
    </div>
  );
};

export default Patients;

