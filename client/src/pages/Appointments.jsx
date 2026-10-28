import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const { user, isAdmin, isDoctor, isReceptionist, isPatient } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().slice(0, 10),
    appointment_time: '10:00 AM',
    type: 'OPD',
    symptoms: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctorFilter, selectedStatusFilter, dateFilter]);

  const fetchInitialData = async () => {
    try {
      const [resDocs, resPats] = await Promise.all([
        api.get('/appointments/doctors'),
        api.get('/patients')
      ]);
      setDoctors(resDocs.data.data || []);
      setPatients(resPats.data.data || []);

      if (user?.doctor_id) {
        setSelectedDoctorFilter(user.doctor_id);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDoctorFilter) params.doctor_id = selectedDoctorFilter;
      if (selectedStatusFilter) params.status = selectedStatusFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await api.get('/appointments', { params });
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setSubmitting(true);
      const payload = { ...bookingData };

      if (isPatient && user?.patient_id) {
        payload.patient_id = user.patient_id;
      }

      const res = await api.post('/appointments', payload);
      setSuccessMsg(res.data.message);
      setShowModal(false);
      setBookingData({
        patient_id: '',
        doctor_id: '',
        appointment_date: new Date().toISOString().slice(0, 10),
        appointment_time: '10:00 AM',
        type: 'OPD',
        symptoms: '',
        notes: ''
      });
      fetchAppointments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to schedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    'Scheduled': 'bg-slate-100 text-slate-700 border-slate-200',
    'In-Queue': 'bg-amber-100 text-amber-800 border-amber-200',
    'In-Consultation': 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse font-bold',
    'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold',
    'Cancelled': 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Appointment & OPD Queue Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time consultation token tracking, doctor OPD scheduling, and live token calling.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 font-bold">&times;</button>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Filter Doctor</label>
          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Doctors & Chambers</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Queue Status</label>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Queue">In-Queue</option>
            <option value="In-Consultation">In-Consultation</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => { setDateFilter(''); setSelectedDoctorFilter(''); setSelectedStatusFilter(''); }}
          className="text-xs text-slate-500 hover:text-slate-800 self-end py-2 px-2"
        >
          Reset Filters
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/70">
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Appointment #</th>
                <th className="py-3 px-4">Patient Info</th>
                <th className="py-3 px-4">Doctor & Room</th>
                <th className="py-3 px-4">Schedule Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Queue Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading appointments & queue tokens...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No appointments found for the selected criteria.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-extrabold flex items-center justify-center text-sm shadow-xs">
                        #{apt.token_number}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                      {apt.appointment_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{apt.patient_name}</span>
                      <span className="text-[11px] text-slate-400">{apt.patient_code} • {apt.patient_phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{apt.doctor_name}</span>
                      <span className="text-[11px] text-slate-500">{apt.doctor_department} • Room: {apt.doctor_room}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-semibold block">{apt.appointment_date}</span>
                      <span className="text-[11px] text-slate-500">{apt.appointment_time}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full border ${statusColors[apt.status] || 'bg-slate-100'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {(isAdmin || isReceptionist || isDoctor) && (
                        <div className="inline-flex rounded-lg shadow-2xs border border-slate-200 overflow-hidden text-xs">
                          {apt.status === 'Scheduled' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'In-Queue')}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold transition"
                            >
                              Call to Queue
                            </button>
                          )}
                          {apt.status === 'In-Queue' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'In-Consultation')}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold transition"
                            >
                              Call In (Enter)
                            </button>
                          )}
                          {apt.status === 'In-Consultation' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'Completed')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition"
                            >
                              Mark Done
                            </button>
                          )}
                          {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] transition"
                            >
                              Cancel
                            </button>
                          )}
                          {apt.status === 'Completed' && (
                            <span className="px-2 py-1 bg-slate-50 text-slate-400 font-medium text-[11px]">Finished</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Schedule Doctor Consultation / OPD Token</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="mt-4 space-y-3.5 text-xs">
              {!isPatient && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    required
                    value={bookingData.patient_id}
                    onChange={(e) => setBookingData({ ...bookingData, patient_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.patient_id}) - {p.phone}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Doctor & Chamber *</label>
                <select
                  required
                  value={bookingData.doctor_id}
                  onChange={(e) => setBookingData({ ...bookingData, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} • {d.department} • Fee: ৳{d.consultation_fee} ({d.room_no})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingData.appointment_date}
                    onChange={(e) => setBookingData({ ...bookingData, appointment_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Time</label>
                  <select
                    value={bookingData.appointment_time}
                    onChange={(e) => setBookingData({ ...bookingData, appointment_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appointment Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {['OPD', 'Follow-up', 'Emergency', 'Routine'].map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setBookingData({ ...bookingData, type: t })}
                      className={`py-1.5 rounded-lg border text-xs font-semibold transition ${
                        bookingData.type === t ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Symptoms / Chief Complaint</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Chest pain, high fever for 3 days, dizziness"
                  value={bookingData.symptoms}
                  onChange={(e) => setBookingData({ ...bookingData, symptoms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Generating Token...' : 'Confirm & Generate Token'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

