import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  User, 
  Activity, 
  FileText,
  Search
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const OperationTheatre = () => {
  const { isDoctor, isAdmin } = useAuth();
  const [surgeries, setSurgeries] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Book Surgery Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookForm, setBookForm] = useState({
    patient_id: '',
    ot_id: '',
    lead_surgeon_id: '',
    anesthetist_name: 'Dr. Emily Vance (Anesthesiologist)',
    surgery_name: '',
    surgery_date: new Date().toISOString().slice(0, 10),
    scheduled_start_time: '10:00 AM',
    estimated_duration_hours: '2.0',
    anesthesia_type: 'General Anesthesia',
    pre_op_checklist_verified: true,
    surgical_notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSurgeries();
    fetchMetadata();
  }, [statusFilter]);

  const fetchSurgeries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/ot/surgeries', { params });
      setSurgeries(res.data.data || []);
    } catch (err) {
      console.error('Error fetching surgeries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [tRes, pRes, dRes] = await Promise.all([
        api.get('/ot/theatres'),
        api.get('/patients'),
        api.get('/appointments/meta/doctors')
      ]);
      setTheatres(tRes.data.data || []);
      setPatients(pRes.data.data || []);
      setDoctors(dRes.data.data || []);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const handleBookSurgery = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/ot/surgeries', bookForm);
      setSuccessMsg('Surgical procedure scheduled in Operation Theatre!');
      setShowBookModal(false);
      setBookForm({
        patient_id: '',
        ot_id: '',
        lead_surgeon_id: '',
        anesthetist_name: 'Dr. Emily Vance (Anesthesiologist)',
        surgery_name: '',
        surgery_date: new Date().toISOString().slice(0, 10),
        scheduled_start_time: '10:00 AM',
        estimated_duration_hours: '2.0',
        anesthesia_type: 'General Anesthesia',
        pre_op_checklist_verified: true,
        surgical_notes: ''
      });
      fetchSurgeries();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to schedule surgery');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/ot/surgeries/${id}/status`, { status });
      fetchSurgeries();
    } catch (err) {
      alert('Failed to update surgery status');
    }
  };

  const filteredSurgeries = surgeries.filter(s =>
    s.surgery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.surgery_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Operation Theatre (OT) Complex</h1>
            <p className="text-sm text-slate-500">Surgical scheduling, anesthesia logging &amp; perioperative patient care</p>
          </div>
        </div>

        {(isDoctor || isAdmin) && (
          <button
            onClick={() => {
              setBookForm(prev => ({
                ...prev,
                ot_id: theatres[0]?.id || '',
                lead_surgeon_id: doctors[0]?.id || ''
              }));
              setShowBookModal(true);
            }}
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Surgery
          </button>
        )}
      </div>

      {/* Theatres Occupancy Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {theatres.map(ot => (
          <div key={ot.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-blue-600">{ot.ot_code}</div>
              <h4 className="text-sm font-bold text-slate-800 mt-0.5">{ot.name}</h4>
              <span className="text-[10px] text-slate-400">{ot.ot_type}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {ot.status}
            </span>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search surgery#, patient, procedure..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['', 'Scheduled', 'In Theatre', 'Recovery Room', 'Completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Surgeries'}
            </button>
          ))}
        </div>
      </div>

      {/* Surgeries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading surgery schedule...
          </div>
        ) : filteredSurgeries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Scissors className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
            <p className="font-bold text-slate-600">No Surgeries Scheduled</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Surgery #</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Surgical Procedure</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">OT Theatre</th>
                  <th className="py-3.5 px-4">Surgeon &amp; Anesthesia</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSurgeries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{s.surgery_number}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800">{s.surgery_date}</div>
                      <div className="text-slate-400">{s.scheduled_start_time} ({s.estimated_duration_hours}h)</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.surgery_name}</div>
                      <div className="text-xs text-slate-400">{s.anesthesia_type}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.patient_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{s.patient_code} ({s.patient_gender}, {s.patient_age}y)</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 font-mono">
                        {s.ot_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800">{s.lead_surgeon_name}</div>
                      <div className="text-slate-400">{s.anesthetist_name || 'Anesthesia Team'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        s.status === 'In Theatre' ? 'bg-rose-50 text-rose-700 animate-pulse' :
                        s.status === 'Recovery Room' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {s.status === 'Scheduled' && (
                        <button
                          onClick={() => handleStatusChange(s.id, 'In Theatre')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Start Surgery
                        </button>
                      )}
                      {s.status === 'In Theatre' && (
                        <button
                          onClick={() => handleStatusChange(s.id, 'Recovery Room')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          To Recovery
                        </button>
                      )}
                      {s.status === 'Recovery Room' && (
                        <button
                          onClick={() => handleStatusChange(s.id, 'Completed')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Surgery Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Scissors className="w-5 h-5 mr-2 text-blue-600" />
                Schedule Surgical Procedure in Operation Theatre
              </h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSurgery} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Patient *</label>
                  <select
                    required
                    value={bookForm.patient_id}
                    onChange={(e) => setBookForm({ ...bookForm, patient_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.patient_id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select OT Theatre *</label>
                  <select
                    required
                    value={bookForm.ot_id}
                    onChange={(e) => setBookForm({ ...bookForm, ot_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="">-- Choose OT --</option>
                    {theatres.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.ot_code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Surgical Procedure Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laparoscopic Appendectomy / Total Hip Arthroplasty"
                  value={bookForm.surgery_name}
                  onChange={(e) => setBookForm({ ...bookForm, surgery_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chief Lead Surgeon *</label>
                  <select
                    required
                    value={bookForm.lead_surgeon_id}
                    onChange={(e) => setBookForm({ ...bookForm, lead_surgeon_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="">-- Choose Surgeon --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Anesthesiologist</label>
                  <input
                    type="text"
                    value={bookForm.anesthetist_name}
                    onChange={(e) => setBookForm({ ...bookForm, anesthetist_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Surgery Date *</label>
                  <input
                    type="date"
                    required
                    value={bookForm.surgery_date}
                    onChange={(e) => setBookForm({ ...bookForm, surgery_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    value={bookForm.scheduled_start_time}
                    onChange={(e) => setBookForm({ ...bookForm, scheduled_start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={bookForm.estimated_duration_hours}
                    onChange={(e) => setBookForm({ ...bookForm, estimated_duration_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Anesthesia Modality</label>
                <select
                  value={bookForm.anesthesia_type}
                  onChange={(e) => setBookForm({ ...bookForm, anesthesia_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="General Anesthesia">General Anesthesia</option>
                  <option value="Spinal Anesthesia">Spinal Anesthesia</option>
                  <option value="Epidural Anesthesia">Epidural Anesthesia</option>
                  <option value="Local Anesthesia">Local Anesthesia</option>
                  <option value="Sedation">IV Conscious Sedation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pre-Operative Notes &amp; Preparation</label>
                <textarea
                  rows="2"
                  placeholder="e.g. NPO confirmed for 8 hours, 2 units PRBC cross-matched in blood bank, informed consent signed..."
                  value={bookForm.surgical_notes}
                  onChange={(e) => setBookForm({ ...bookForm, surgical_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Booking...' : 'Confirm OT Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationTheatre;

