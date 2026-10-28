import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Plus, 
  Activity, 
  CheckCircle, 
  Clock, 
  Pill, 
  X, 
  User, 
  Thermometer, 
  AlertCircle,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NursingStation = () => {
  const { user } = useAuth();
  const [inpatients, setInpatients] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [emarList, setEmarList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);

  // Forms
  const [vitalsForm, setVitalsForm] = useState({
    recorded_by_nurse: user?.name || 'Staff Nurse',
    bp: '120/80',
    pulse: '74',
    temperature: '98.6',
    spo2: '98',
    respiratory_rate: '18',
    blood_sugar_fbs: '95 mg/dL',
    urine_output_ml: '450',
    fluid_intake_ml: '500',
    nurse_assessment_notes: 'Patient resting comfortably, IV cannula site clean'
  });

  const [medForm, setMedForm] = useState({
    medicine_name: 'Ceftriaxone 1g IV',
    dosage: '1 vial',
    route: 'IV',
    scheduled_time: '08:00 PM',
    notes: 'Administer over 15 minutes in 100ml NS'
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchInpatients();
  }, []);

  const fetchInpatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/nursing/inpatients');
      const data = res.data.data || [];
      setInpatients(data);
      if (data.length > 0 && !selectedAdmission) {
        selectPatient(data[0]);
      }
    } catch (err) {
      console.error('Error fetching inpatients:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = async (admission) => {
    setSelectedAdmission(admission);
    try {
      const [vRes, eRes] = await Promise.all([
        api.get(`/nursing/vitals/${admission.id}`),
        api.get(`/nursing/emar/${admission.id}`)
      ]);
      setVitalsHistory(vRes.data.data || []);
      setEmarList(eRes.data.data || []);
    } catch (err) {
      console.error('Error fetching patient clinical charts:', err);
    }
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;
    setSubmitting(true);
    try {
      await api.post('/nursing/vitals', {
        ...vitalsForm,
        admission_id: selectedAdmission.id
      });
      setSuccessMsg('Bedside vital signs charted successfully!');
      setShowVitalsModal(false);
      selectPatient(selectedAdmission);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to log bedside vitals');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleMed = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;
    setSubmitting(true);
    try {
      await api.post('/nursing/emar', {
        ...medForm,
        admission_id: selectedAdmission.id
      });
      setSuccessMsg('Medication regimen charted on eMAR!');
      setShowAddMedModal(false);
      selectPatient(selectedAdmission);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to schedule medication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdministerMed = async (medId) => {
    try {
      await api.patch(`/nursing/emar/${medId}/administer`, {
        nurse_name: user?.name || 'Staff Nurse',
        notes: 'Dose administered to patient as scheduled'
      });
      selectPatient(selectedAdmission);
    } catch (err) {
      alert('Failed to record administration');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nursing Station &amp; eMAR Administration</h1>
            <p className="text-sm text-slate-500">Bedside vital signs charting, inpatient shift monitoring &amp; electronic medication administration</p>
          </div>
        </div>

        {selectedAdmission && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowVitalsModal(true)}
              className="flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Activity className="w-4 h-4 mr-1.5" />
              Chart Vitals
            </button>
            <button
              onClick={() => setShowAddMedModal(true)}
              className="flex items-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Pill className="w-4 h-4 mr-1.5" />
              Schedule eMAR Dose
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Inpatient Roster */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-100 p-3 rounded-xl flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Active Inpatients Roster</span>
            <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 shadow-xs">{inpatients.length} Admitted</span>
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading ward roster...</div>
            ) : inpatients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No active admitted patients.</div>
            ) : (
              inpatients.map(a => {
                const isSelected = selectedAdmission?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => selectPatient(a)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{a.patient_name}</span>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{a.patient_code} &bull; {a.patient_gender}, {a.patient_age}y</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-800 font-mono">
                        {a.bed_number}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                      <span>{a.ward_type} &bull; Dr. {a.doctor_name}</span>
                      <span className="text-emerald-700 font-bold font-mono">
                        {a.latest_vitals ? `BP ${a.latest_vitals.bp}` : 'No vitals yet'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Inpatient Bedside Chart & eMAR */}
        <div className="lg:col-span-8 space-y-4">
          {selectedAdmission ? (
            <>
              {/* Selected Patient Overview Header */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-slate-900">{selectedAdmission.patient_name}</h2>
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-blue-100 text-blue-800 font-mono">
                      {selectedAdmission.bed_number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                      {selectedAdmission.ward_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Admission #{selectedAdmission.admission_number} &bull; Date: {selectedAdmission.admission_date} &bull; Attending: <strong>{selectedAdmission.doctor_name}</strong>
                  </p>
                </div>

                <div className="flex space-x-2 text-xs">
                  <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold">
                    Blood: {selectedAdmission.blood_group}
                  </span>
                  {selectedAdmission.allergies && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold">
                      Allergy Alert: {selectedAdmission.allergies}
                    </span>
                  )}
                </div>
              </div>

              {/* Section 1: Bedside Vitals Flowsheet */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Bedside Vital Signs Flowsheet (q4h / q8h)
                  </span>
                  <span className="text-slate-400 font-medium">Logged: {vitalsHistory.length} readings</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">BP (mmHg)</th>
                        <th className="py-2.5 px-3">Pulse</th>
                        <th className="py-2.5 px-3">Temp (°F)</th>
                        <th className="py-2.5 px-3">SPO2 (%)</th>
                        <th className="py-2.5 px-3">Resp Rate</th>
                        <th className="py-2.5 px-3">Blood Sugar</th>
                        <th className="py-2.5 px-3">Nurse Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                      {vitalsHistory.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 text-slate-500 font-sans">{new Date(v.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{v.bp}</td>
                          <td className="py-2 px-3">{v.pulse} bpm</td>
                          <td className="py-2 px-3">{v.temperature}</td>
                          <td className="py-2 px-3 font-bold text-emerald-600">{v.spo2}%</td>
                          <td className="py-2 px-3">{v.respiratory_rate}/m</td>
                          <td className="py-2 px-3 text-slate-600">{v.blood_sugar_fbs || '-'}</td>
                          <td className="py-2 px-3 font-sans text-slate-600 text-[11px] truncate max-w-xs">{v.nurse_assessment_notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Electronic Medication Administration Record (eMAR) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center">
                    <Pill className="w-4 h-4 mr-1.5 text-blue-600" />
                    eMAR Schedule (Electronic Medication Administration Record)
                  </span>
                  <span className="text-slate-400 font-medium">Shift Doses</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                        <th className="py-2.5 px-3">Medicine &amp; Dose</th>
                        <th className="py-2.5 px-3">Route</th>
                        <th className="py-2.5 px-3">Scheduled Time</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Administered By</th>
                        <th className="py-2.5 px-3 text-right">Sign-off</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {emarList.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{m.medicine_name} ({m.dosage})</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {m.route}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{m.scheduled_time}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.status === 'Administered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{m.nurse_name || '-'}</td>
                          <td className="py-2.5 px-3 text-right">
                            {m.status === 'Scheduled' && (
                              <button
                                onClick={() => handleAdministerMed(m.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Mark Given
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border">
              Select an admitted inpatient from the roster to view bedside vitals flowsheet and eMAR schedule.
            </div>
          )}
        </div>
      </div>

      {/* Chart Vitals Modal */}
      {showVitalsModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Chart Bedside Vital Signs</h3>
              <button onClick={() => setShowVitalsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordVitals} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitalsForm.bp}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pulse (bpm)</label>
                  <input
                    type="text"
                    value={vitalsForm.pulse}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Body Temp (°F)</label>
                  <input
                    type="text"
                    value={vitalsForm.temperature}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oxygen Saturation SPO2 (%)</label>
                  <input
                    type="number"
                    value={vitalsForm.spo2}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resp Rate (/min)</label>
                  <input
                    type="number"
                    value={vitalsForm.respiratory_rate}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, respiratory_rate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Sugar (FBS/RBS)</label>
                  <input
                    type="text"
                    value={vitalsForm.blood_sugar_fbs}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, blood_sugar_fbs: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nurse Assessment Notes</label>
                <textarea
                  rows="2"
                  value={vitalsForm.nurse_assessment_notes}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, nurse_assessment_notes: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {submitting ? 'Charting...' : 'Save Vitals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule eMAR Modal */}
      {showAddMedModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Add Medication to eMAR Flowsheet</h3>
              <button onClick={() => setShowAddMedModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleMed} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceftriaxone 1g IV"
                  value={medForm.medicine_name}
                  onChange={(e) => setMedForm({ ...medForm, medicine_name: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medForm.dosage}
                    onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Route</label>
                  <select
                    value={medForm.route}
                    onChange={(e) => setMedForm({ ...medForm, route: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs"
                  >
                    <option value="Oral">Oral</option>
                    <option value="IV">Intravenous (IV)</option>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="Subcutaneous">Subcutaneous</option>
                    <option value="Inhalation">Nebulization / Inhalation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scheduled Time</label>
                <input
                  type="text"
                  placeholder="e.g. 08:00 PM / TDS"
                  value={medForm.scheduled_time}
                  onChange={(e) => setMedForm({ ...medForm, scheduled_time: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Administration Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Infuse over 30 mins in 100ml Normal Saline"
                  value={medForm.notes}
                  onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {submitting ? 'Scheduling...' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NursingStation;

