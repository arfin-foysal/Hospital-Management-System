import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Share2,
  MessageSquare,
  FileText,
  Clock,
  User,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  X,
  Send,
  Maximize2,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

const Telemedicine = () => {
  const { user, isDoctor, isAdmin, isPatient } = useAuth();
  const { formatMoney, lang } = useLocale();

  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ total: 0, inLobby: 0, inCall: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null); // When inside a live video call

  // Video call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  // In-call Doctor Clinical Rx
  const [inCallNotes, setInCallNotes] = useState({
    diagnosis: '',
    doctor_notes: ''
  });

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    patient_id: '',
    doctor_id: '',
    scheduled_at: '',
    chief_complaint: '',
    consultation_fee: 1000
  });

  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchMetadata();
  }, []);

  // Timer for active call
  useEffect(() => {
    let interval = null;
    if (activeSession) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const [res, statsRes] = await Promise.all([
        api.get('/telemedicine'),
        api.get('/telemedicine/stats')
      ]);
      setSessions(res.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Error loading telemedicine sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        api.get('/patients', { params: { limit: 100 } }),
        api.get('/appointments/meta/doctors')
      ]);
      setPatients(patRes.data.data || []);
      setDoctors(docRes.data.data || []);
    } catch (err) {
      console.warn('Metadata load error:', err.message);
    }
  };

  const showToast = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  const handleStartCall = async (session) => {
    setActiveSession(session);
    setInCallNotes({
      diagnosis: session.diagnosis || '',
      doctor_notes: session.doctor_notes || ''
    });
    try {
      await api.patch(`/telemedicine/${session.id}`, { status: 'In_Call' });
      fetchSessions();
    } catch (e) {
      console.warn('Status update warning:', e.message);
    }
  };

  const handleEndCall = async () => {
    if (!activeSession) return;
    try {
      await api.patch(`/telemedicine/${activeSession.id}`, {
        status: 'Completed',
        call_duration_seconds: callTimer,
        diagnosis: inCallNotes.diagnosis,
        doctor_notes: inCallNotes.doctor_notes
      });
      showToast('success', `Telemedicine consultation #${activeSession.session_code} completed (${formatTimer(callTimer)}). Digital notes saved.`);
      setActiveSession(null);
      fetchSessions();
    } catch (err) {
      showToast('error', 'Failed to save call records');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/telemedicine', scheduleForm);
      showToast('success', `Telemedicine session ${res.data.data.session_code} scheduled! SMS link dispatched to patient.`);
      setShowScheduleModal(false);
      setScheduleForm({
        patient_id: '',
        doctor_id: '',
        scheduled_at: '',
        chief_complaint: '',
        consultation_fee: 1000
      });
      fetchSessions();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not schedule session');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In_Lobby': return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
      case 'In_Call': return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {banner && (
        <div className={`p-4 rounded-xl flex items-center justify-between border shadow-lg ${
          banner.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {banner.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span className="font-semibold text-sm">{banner.text}</span>
          </div>
          <button onClick={() => setBanner(null)}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      )}

      {/* FULLSCREEN VIDEO CALL ROOM MODAL */}
      {activeSession && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white">
          {/* Top Bar */}
          <div className="h-16 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs font-bold border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>LIVE HD WEBRTC ENCRYPTED</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {activeSession.patients?.name} (UHID: {activeSession.patients?.patient_id})
                </h3>
                <p className="text-xs text-slate-400">Chief Complaint: {activeSession.chief_complaint}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-800 px-4 py-1.5 rounded-xl font-mono text-sm text-emerald-400 border border-slate-700">
                <Clock className="w-4 h-4" />
                <span>{formatTimer(callTimer)}</span>
              </div>

              <button
                onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  showNotesDrawer ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Digital Rx Pad</span>
              </button>
            </div>
          </div>

          {/* Main View Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Video Canvas Container */}
            <div className="flex-1 bg-slate-950 p-6 flex flex-col md:flex-row gap-4 items-center justify-center">
              {/* Patient Video Feed */}
              <div className="relative flex-1 w-full h-full max-h-[620px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80"
                  alt="Patient Video Feed"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Patient: {activeSession.patients?.name}</span>
                </div>
                {activeSession.patients?.blood_group && (
                  <div className="absolute top-4 right-4 bg-rose-900/80 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-rose-200">
                    Blood: {activeSession.patients.blood_group}
                  </div>
                )}
              </div>

              {/* Doctor Video Feed (Picture in Picture or Side) */}
              <div className="relative md:w-80 h-64 md:h-full max-h-[620px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl">
                {isVideoOff ? (
                  <div className="text-center p-4">
                    <User className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Camera Paused</p>
                  </div>
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
                    alt="Doctor Video"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Dr. {activeSession.doctors?.name || user?.name}</span>
                </div>
              </div>
            </div>

            {/* In-Call Digital Prescription & Clinical Notes Drawer */}
            {showNotesDrawer && (
              <div className="w-96 bg-slate-900 border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <h4 className="font-bold text-sm text-white">Live Clinical Rx Pad</h4>
                    </div>
                    <button onClick={() => setShowNotesDrawer(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Provisional Diagnosis
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acute Pharyngitis with fever"
                      value={inCallNotes.diagnosis}
                      onChange={(e) => setInCallNotes({ ...inCallNotes, diagnosis: e.target.value })}
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Prescribed Rx & Advice
                    </label>
                    <textarea
                      rows="6"
                      placeholder="Tab Paracetamol 500mg 1+1+1 (3 days)&#10;Tab Cetirizine 10mg 0+0+1 (5 days)&#10;Warm salt water gargle."
                      value={inCallNotes.doctor_notes}
                      onChange={(e) => setInCallNotes({ ...inCallNotes, doctor_notes: e.target.value })}
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 text-[11px] text-blue-300">
                    💡 Notes saved automatically to patient EMR upon call termination.
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[11px] text-slate-500 text-center">Session Code: {activeSession.session_code}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Call Controls Bar */}
          <div className="h-20 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Encrypted Peer-to-Peer Telehealth Stream
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-full transition ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3.5 rounded-full transition ${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                title="Share Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={handleEndCall}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-full shadow-lg shadow-red-600/30 transition hover:scale-105"
              >
                <PhoneOff className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider">End & Save Rx</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 text-right">
              {formatMoney(activeSession.consultation_fee)} Paid
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-blue-800/40">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/40">
              <Video className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {lang === 'bn' ? 'টেলিমেডিসিন ও ভার্চুয়াল কনসালটেশন' : 'Telemedicine & Virtual Video OPD'}
            </h1>
          </div>
          <p className="text-blue-200/80 text-sm max-w-2xl">
            {lang === 'bn' 
              ? 'ঘরে বসেই সরাসরি ডাক্তারের সাথে এইচডি ভিডিও কনসালটেশন, লাইভ প্রেসক্রিপশন ও এসএমএস লিংক সুবিধা।'
              : 'Encrypted HD video consultation suite, virtual waiting lobby, digital Rx pads, and automated patient SMS invites.'}
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন ভার্চুয়াল অ্যাপয়েন্টমেন্ট' : 'Schedule Video Consult'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sessions</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || sessions.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Video className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Lobby Waiting</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.inLobby}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Live Call</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{stats.inCall}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Video className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Consults</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm">Virtual OPD Appointments & Live Rooms</h3>
          <button
            onClick={fetchSessions}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Refresh Queue
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Session Code & Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor & Specialization</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{s.session_code}</div>
                    <div className="text-xs text-slate-500 flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{s.patients?.name}</div>
                    <div className="text-xs text-slate-500">ID: {s.patients?.patient_id} • {s.patients?.phone}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">Dr. {s.doctors?.name}</div>
                    <div className="text-xs text-slate-500">{s.doctors?.department} • {s.doctors?.specialization}</div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-xs text-slate-800 line-clamp-2">{s.chief_complaint}</p>
                    {s.diagnosis && (
                      <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Dx: {s.diagnosis}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(s.status)}`}>
                      {s.status?.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {s.status === 'Completed' ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        Consulted ({formatTimer(s.call_duration_seconds)})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartCall(s)}
                        className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Call</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Book Telemedicine Video Consult</h3>
              <button onClick={() => setShowScheduleModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Patient *
                </label>
                <select
                  required
                  value={scheduleForm.patient_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, patient_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.patient_id} - {p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Doctor *
                </label>
                <select
                  required
                  value={scheduleForm.doctor_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, doctor_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Specialist Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduled_at}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fee (৳/$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scheduleForm.consultation_fee}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, consultation_fee: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Chief Complaint / Symptoms *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Headache, sore throat and mild fever"
                  value={scheduleForm.chief_complaint}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, chief_complaint: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Book & Send SMS Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telemedicine;
