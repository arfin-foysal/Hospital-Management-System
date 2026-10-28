import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Plus, 
  LogOut, 
  X, 
  CheckCircle,
  AlertTriangle,
  Printer,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRCodeSVG from '../components/QRCodeSVG';

const IPDManagement = () => {
  const { isAdmin, isReceptionist, isDoctor } = useAuth();
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [dischargeCert, setDischargeCert] = useState(null);
  const [selectedBedForAction, setSelectedBedForAction] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [admitForm, setAdmitForm] = useState({
    patient_id: '',
    bed_id: '',
    doctor_id: '',
    admission_reason: '',
    initial_diagnosis: ''
  });

  const [dischargeForm, setDischargeForm] = useState({
    admission_id: '',
    discharge_summary: '',
    discharge_condition: 'Recovered & Clinically Stable'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchBeds();
    fetchDropdowns();
  }, [selectedWard, selectedStatus]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedWard) params.ward_type = selectedWard;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/ipd/beds', { params });
      setBeds(res.data.data || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Error fetching IPD beds:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [resPats, resDocs] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments/doctors')
      ]);
      setPatients(resPats.data.data || []);
      setDoctors(resDocs.data.data || []);
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    }
  };

  const handleOpenAdmitModal = (bed) => {
    setSelectedBedForAction(bed);
    setAdmitForm({
      patient_id: '',
      bed_id: bed.id,
      doctor_id: '',
      admission_reason: '',
      initial_diagnosis: ''
    });
    setErrorMsg('');
    setShowAdmitModal(true);
  };

  const handleOpenDischargeModal = (bed) => {
    setSelectedBedForAction(bed);
    setDischargeForm({
      admission_id: bed.active_admission_id,
      discharge_summary: `Patient discharged in stable hemodynamic state. Medication adjusted.`,
      discharge_condition: 'Recovered & Clinically Stable'
    });
    setErrorMsg('');
    setShowDischargeModal(true);
  };

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setSubmitting(true);
      const res = await api.post('/ipd/admit', admitForm);
      setSuccessMsg(res.data.message);
      setShowAdmitModal(false);
      fetchBeds();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to admit patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setSubmitting(true);
      const res = await api.post(`/ipd/admissions/${dischargeForm.admission_id}/discharge`, dischargeForm);
      setSuccessMsg(`${res.data.message} Total stay bed charge: $${res.data.staySummary?.totalBedCharges || 0}`);
      
      // Auto-generate official discharge certificate
      setDischargeCert({
        patient_name: selectedBedForAction.current_patient?.name,
        patient_code: selectedBedForAction.current_patient?.patient_id,
        bed_number: selectedBedForAction.bed_number,
        ward_type: selectedBedForAction.ward_type,
        admission_date: selectedBedForAction.admission_date,
        discharge_date: new Date().toISOString().slice(0, 10),
        stay_days: res.data.staySummary?.stayDays || 1,
        total_charges: res.data.staySummary?.totalBedCharges || 0,
        doctor_name: selectedBedForAction.attending_doctor?.name,
        condition: dischargeForm.discharge_condition,
        summary: dischargeForm.discharge_summary
      });

      setShowDischargeModal(false);
      setShowCertModal(true);
      fetchBeds();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to discharge patient');
    } finally {
      setSubmitting(false);
    }
  };

  const getBedStatusStyle = (status) => {
    switch (status) {
      case 'Available':
        return {
          card: 'border-emerald-200 bg-white hover:border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Occupied':
        return {
          card: 'border-blue-200 bg-blue-50/20 hover:border-blue-300',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-600',
        };
      case 'Maintenance':
        return {
          card: 'border-amber-200 bg-amber-50/20 hover:border-amber-300',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      default:
        return {
          card: 'border-purple-200 bg-purple-50/20 hover:border-purple-300',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <span>IPD (In-Patient Department) & Bed Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual bed occupancy tracking across ICU, CCU, General Wards, and VIP Cabins.
          </p>
        </div>

        {(isAdmin || isReceptionist || isDoctor) && (
          <button
            onClick={() => {
              const firstAvail = beds.find(b => b.status === 'Available');
              if (firstAvail) handleOpenAdmitModal(firstAvail);
              else alert('No available beds right now!');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Admit Patient</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 font-bold">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {stats?.total || 0}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Beds</p>
            <p className="text-sm font-bold text-slate-800">Hospital Capacity</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            {stats?.available || 0}
          </div>
          <div>
            <p className="text-xs text-emerald-600 font-semibold">Available</p>
            <p className="text-sm font-bold text-slate-800">Ready for Admission</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            {stats?.occupied || 0}
          </div>
          <div>
            <p className="text-xs text-blue-700 font-semibold">Occupied</p>
            <p className="text-sm font-bold text-slate-800">In-Patient Care</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            {stats?.maintenance || 0}
          </div>
          <div>
            <p className="text-xs text-amber-600 font-semibold">Maintenance</p>
            <p className="text-sm font-bold text-slate-800">Cleaning / Servicing</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading real-time bed layouts...
          </div>
        ) : beds.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No beds found matching filters.
          </div>
        ) : (
          beds.map((bed) => {
            const styles = getBedStatusStyle(bed.status);
            const isOccupied = bed.status === 'Occupied';

            return (
              <div
                key={bed.id}
                className={`rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between ${styles.card}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{bed.bed_number}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${styles.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                      <span>{bed.status}</span>
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{bed.ward_type}</span> • {bed.floor}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{bed.description}</p>

                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    Rate: <span className="text-blue-700 font-bold">৳{parseFloat(bed.daily_charge).toLocaleString()}</span> / day
                  </div>

                  {isOccupied && bed.patient_name && (
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900">{bed.patient_name}</span>
                        <span className="text-[10px] text-blue-700 font-mono">{bed.patient_code}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Doctor: <span className="font-medium text-slate-800">{bed.doctor_name}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  {bed.status === 'Available' && (isAdmin || isReceptionist || isDoctor) && (
                    <button
                      onClick={() => handleOpenAdmitModal(bed)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Admit Patient Here</span>
                    </button>
                  )}

                  {isOccupied && (isAdmin || isDoctor) && (
                    <button
                      onClick={() => handleOpenDischargeModal(bed)}
                      className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Discharge & Bill</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAdmitModal && selectedBedForAction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-600" />
                <span>Admit Patient to {selectedBedForAction.bed_number}</span>
              </h2>
              <button onClick={() => setShowAdmitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdmitSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={admitForm.patient_id}
                  onChange={(e) => setAdmitForm({ ...admitForm, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patient_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Consultant Doctor *</label>
                <select
                  required
                  value={admitForm.doctor_id}
                  onChange={(e) => setAdmitForm({ ...admitForm, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Reason *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Acute unstable angina, observation required"
                  value={admitForm.admission_reason}
                  onChange={(e) => setAdmitForm({ ...admitForm, admission_reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{submitting ? 'Admitting...' : 'Confirm Admission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDischargeModal && selectedBedForAction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LogOut className="w-5 h-5 text-rose-600" />
                <span>Discharge Patient</span>
              </h2>
              <button onClick={() => setShowDischargeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDischargeSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discharge Summary *</label>
                <textarea
                  required
                  rows="3"
                  value={dischargeForm.discharge_summary}
                  onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDischargeModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Confirm &amp; Generate Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Inpatient Discharge Certificate Modal */}
      {showCertModal && dischargeCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-100 flex items-center justify-between border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
                <FileCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                Official Inpatient Discharge Certificate
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print Certificate
                </button>
                <button
                  onClick={() => setShowCertModal(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-slate-800" id="printable-discharge-cert">
              <div className="border-b-2 border-emerald-600 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-emerald-800 tracking-tight">CareSync General Hospital</h2>
                  <p className="text-xs text-slate-500">In-Patient Department (IPD) Medical Records Division</p>
                  <p className="text-xs text-slate-500">123 Healthcare Boulevard &bull; Ext: 301</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-xs uppercase rounded-full">
                    Discharge Clearance
                  </span>
                  <div className="text-xs text-slate-400 mt-1">Date: {dischargeCert.discharge_date}</div>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500">Patient Name:</span> <strong className="text-slate-900 block text-sm">{dischargeCert.patient_name}</strong></div>
                <div><span className="text-slate-500">Patient ID:</span> <strong className="font-mono text-slate-800 block">{dischargeCert.patient_code}</strong></div>
                <div><span className="text-slate-500">Bed / Ward:</span> <strong className="text-slate-800 block">{dischargeCert.bed_number} ({dischargeCert.ward_type})</strong></div>
                <div><span className="text-slate-500">Attending Physician:</span> <strong className="text-slate-800 block">{dischargeCert.doctor_name}</strong></div>
                <div><span className="text-slate-500">Admission Date:</span> <strong className="text-slate-800 block">{dischargeCert.admission_date}</strong></div>
                <div><span className="text-slate-500">Total Inpatient Stay:</span> <strong className="text-emerald-700 block font-bold">{dischargeCert.stay_days} Day(s)</strong></div>
              </div>

              {/* Condition & Clinical Summary */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Condition at Discharge:</span>
                  <div className="p-2 bg-emerald-50/60 border border-emerald-200 text-emerald-900 font-semibold rounded-lg mt-0.5">
                    {dischargeCert.condition}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Clinical Discharge Summary &amp; Treatment:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {dischargeCert.summary}
                  </p>
                </div>
              </div>

              {/* Footer with QR Code & Signatures */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
                <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <QRCodeSVG value={`CareSync-Discharge:${dischargeCert.patient_code}:Bed:${dischargeCert.bed_number}:Date:${dischargeCert.discharge_date}`} size={56} />
                  <div className="text-[10px] text-slate-500 font-mono">
                    <div className="font-bold text-slate-700">Official Discharge Seal</div>
                    <div>Medically Cleared</div>
                    <div className="text-slate-400">CareSync IPD 2026</div>
                  </div>
                </div>

                <div className="flex space-x-8">
                  <div className="text-center border-t border-slate-400 pt-1 w-32">
                    <div className="font-bold text-slate-800">{dischargeCert.doctor_name}</div>
                    <div className="text-slate-400">Attending Doctor</div>
                  </div>
                  <div className="text-center border-t border-slate-400 pt-1 w-32">
                    <div className="font-bold text-slate-800">Medical Supt.</div>
                    <div className="text-slate-400">Hospital Authority</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPDManagement;

