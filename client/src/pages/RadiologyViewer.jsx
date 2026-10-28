import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Sliders,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Eye,
  Plus,
  X,
  User,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

const RadiologyViewer = () => {
  const { user, isDoctor, isAdmin } = useAuth();
  const { lang } = useLocale();

  const [studies, setStudies] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, xray: 0, mri: 0, ct: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [modalityFilter, setModalityFilter] = useState('');

  // PACS Image Manipulation Tools
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [invert, setInvert] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Diagnostic Report Edit State
  const [reportForm, setReportForm] = useState({
    findings: '',
    impression: '',
    status: 'Final_Approved',
    radiologist_name: ''
  });

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newStudyForm, setNewStudyForm] = useState({
    patient_id: '',
    modality: 'X_Ray',
    body_part: '',
    radiologist_name: '',
    image_url: '',
    clinical_indication: ''
  });

  const [banner, setBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudies();
    fetchPatients();
  }, [modalityFilter]);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (modalityFilter) params.modality = modalityFilter;
      const [res, statsRes] = await Promise.all([
        api.get('/radiology', { params }),
        api.get('/radiology/stats')
      ]);
      const data = res.data.data || [];
      setStudies(data);
      setStats(statsRes.data.data || {});
      if (data.length > 0 && !selectedStudy) {
        setSelectedStudy(data[0]);
        loadStudyReport(data[0]);
      }
    } catch (err) {
      console.error('Error fetching radiology studies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients', { params: { limit: 100 } });
      setPatients(res.data.data || []);
    } catch (e) {
      console.warn('Patient fetch warning:', e.message);
    }
  };

  const loadStudyReport = (study) => {
    setSelectedStudy(study);
    setReportForm({
      findings: study.findings || '',
      impression: study.impression || '',
      status: study.status || 'Final_Approved',
      radiologist_name: study.radiologist_name || user?.name || 'Dr. Mahmudul Hasan, MD'
    });
    // Reset canvas filters
    setZoomLevel(1);
    setRotation(0);
    setInvert(false);
    setBrightness(100);
    setContrast(100);
  };

  const showToast = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!selectedStudy) return;

    try {
      setSaving(true);
      const res = await api.patch(`/radiology/${selectedStudy.id}/report`, reportForm);
      showToast('success', `Diagnostic report for study #${selectedStudy.study_id} saved and signed.`);
      setSelectedStudy(res.data.data);
      fetchStudies();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not save report');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateStudy = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/radiology', newStudyForm);
      showToast('success', 'Radiology study registered to PACS server.');
      setShowAddModal(false);
      setNewStudyForm({
        patient_id: '',
        modality: 'X_Ray',
        body_part: '',
        radiologist_name: '',
        image_url: '',
        clinical_indication: ''
      });
      fetchStudies();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create study');
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setZoomLevel(1);
    setRotation(0);
    setInvert(false);
    setBrightness(100);
    setContrast(100);
  };

  const formatModality = (m) => {
    switch (m) {
      case 'X_Ray': return 'Digital X-Ray';
      case 'CT_Scan': return 'CT Scan (3D)';
      case 'MRI': return 'Magnetic Resonance (MRI)';
      case 'Ultrasound': return '4D Ultrasound';
      default: return m;
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

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-sky-800/40">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-sky-600 rounded-xl text-white shadow-lg shadow-sky-600/40">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {lang === 'bn' ? 'রেডিওলজি ও ডায়াগনস্টিক পিএসিএস ভিউয়ার' : 'Radiology PACS & Diagnostic DICOM Viewer'}
            </h1>
          </div>
          <p className="text-sky-200/80 text-sm max-w-2xl">
            {lang === 'bn' 
              ? 'হাই-রেজ্যুলেশন এক্স-রে, সিটি স্ক্যান ও এমআরআই ইমেজ বিশ্লেষণ, নেগেটিভ ফিল্টার এবং অনলাইন ডায়াগনস্টিক রিপোর্ট অনুমোদন।'
              : 'Enterprise PACS medical imaging workstation: contrast enhancement, inverted radiological analysis, and certified diagnostic impressions.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-600/30 transition hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন স্টাডি আপলোড' : 'Register New Study'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Studies</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || studies.length}</p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Digital X-Ray</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{stats.xray}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brain / Spine MRI</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{stats.mri}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Reports</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.approved}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* WORKSTATION VIEW: Left study list + Center interactive viewer + Right radiologist report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Study Directory (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Imaging Worklist</h3>
            <span className="text-xs text-slate-500">{studies.length} studies</span>
          </div>

          <div className="py-2.5">
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="">All Modalities</option>
              <option value="X_Ray">Digital X-Ray</option>
              <option value="CT_Scan">CT Scan</option>
              <option value="MRI">MRI</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {studies.map((s) => (
              <div
                key={s.id}
                onClick={() => loadStudyReport(s)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedStudy?.id === s.id
                    ? 'bg-sky-50/80 border-sky-400 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">{s.study_id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    s.status === 'Final_Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {s.status === 'Final_Approved' ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <p className="font-semibold text-xs text-slate-800">{s.patients?.name}</p>
                <p className="text-[11px] text-sky-700 font-medium">{formatModality(s.modality)} • {s.body_part}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date(s.imaging_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Center DICOM / PACS Image Viewer (6 cols) */}
        <div className="lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden shadow-2xl flex flex-col h-[750px]">
          {/* Top PACS Toolbar */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sky-400 font-bold">{selectedStudy?.study_id}</span>
              <span className="text-slate-500">|</span>
              <span className="text-white font-medium">{selectedStudy?.body_part}</span>
            </div>

            {/* Viewer control buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setInvert(!invert)}
                className={`p-1.5 rounded text-xs font-bold transition ${
                  invert ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="Negative Invert Filter"
              >
                INV
              </button>
              <button
                onClick={resetFilters}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 bg-black select-none">
            {selectedStudy ? (
              <img
                src={selectedStudy.image_url}
                alt="Radiology Study"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  filter: `invert(${invert ? 100 : 0}%) brightness(${brightness}%) contrast(${contrast}%)`,
                  transition: 'transform 0.15s ease-out'
                }}
                className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-2xl"
              />
            ) : (
              <p className="text-slate-600 text-sm">Select an imaging study from the worklist</p>
            )}

            {/* Live Overlay HUD */}
            {selectedStudy && (
              <div className="absolute top-4 left-4 text-[11px] text-sky-400 font-mono bg-black/70 backdrop-blur p-2 rounded-lg pointer-events-none space-y-0.5 border border-sky-950">
                <p>PATIENT: {selectedStudy.patients?.name}</p>
                <p>UHID: {selectedStudy.patients?.patient_id}</p>
                <p>MODALITY: {selectedStudy.modality}</p>
                <p>ZOOM: {(zoomLevel * 100).toFixed(0)}% | ROT: {rotation}°</p>
              </div>
            )}
          </div>

          {/* Bottom Brightness & Contrast Sliders */}
          <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-3 w-48">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="range"
                min="50"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
                className="w-full accent-sky-500 h-1 bg-slate-700 rounded-lg"
              />
            </div>

            <div className="flex items-center space-x-3 w-48">
              <Contrast className="w-3.5 h-3.5 text-sky-400" />
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(e.target.value)}
                className="w-full accent-sky-500 h-1 bg-slate-700 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Right Radiologist Diagnostic Report Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-[750px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Radiology Report</h3>
              <span className="text-[11px] text-slate-500">DICOM Certified</span>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-3 mt-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                  Clinical Indication
                </label>
                <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {selectedStudy?.clinical_indication || 'General screening'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                  Radiological Findings *
                </label>
                <textarea
                  rows="5"
                  required
                  placeholder="Describe observed radiological structures, opacities, fractures, or tissue density..."
                  value={reportForm.findings}
                  onChange={(e) => setReportForm({ ...reportForm, findings: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                  Diagnostic Impression *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Final medical diagnostic impression..."
                  value={reportForm.impression}
                  onChange={(e) => setReportForm({ ...reportForm, impression: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                  Signing Radiologist
                </label>
                <input
                  type="text"
                  value={reportForm.radiologist_name}
                  onChange={(e) => setReportForm({ ...reportForm, radiologist_name: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                  Approval Status
                </label>
                <select
                  value={reportForm.status}
                  onChange={(e) => setReportForm({ ...reportForm, status: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                >
                  <option value="Final_Approved">Final Approved (Digitally Signed)</option>
                  <option value="Preliminary">Preliminary Findings</option>
                  <option value="Pending_Review">Pending Review</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving || !selectedStudy}
                className="w-full mt-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {saving ? 'Signing...' : 'Approve & Sign Report'}
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            CareSync PACS Server • DICOM 3.0 Compliant
          </div>
        </div>
      </div>

      {/* MODAL: REGISTER NEW STUDY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Upload & Register PACS Study</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateStudy} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Patient *
                </label>
                <select
                  required
                  value={newStudyForm.patient_id}
                  onChange={(e) => setNewStudyForm({ ...newStudyForm, patient_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.patient_id} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Modality *
                  </label>
                  <select
                    value={newStudyForm.modality}
                    onChange={(e) => setNewStudyForm({ ...newStudyForm, modality: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                  >
                    <option value="X_Ray">Digital X-Ray</option>
                    <option value="CT_Scan">CT Scan</option>
                    <option value="MRI">MRI</option>
                    <option value="Ultrasound">Ultrasound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Body Part / View *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chest PA View"
                    value={newStudyForm.body_part}
                    onChange={(e) => setNewStudyForm({ ...newStudyForm, body_part: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Radiologist Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Mahmudul Hasan, MD"
                  value={newStudyForm.radiologist_name}
                  onChange={(e) => setNewStudyForm({ ...newStudyForm, radiologist_name: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Clinical Indication / Chief Complaint
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Chronic cough, workup for pneumothorax"
                  value={newStudyForm.clinical_indication}
                  onChange={(e) => setNewStudyForm({ ...newStudyForm, clinical_indication: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  disabled={saving}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'Registering...' : 'Register Study'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadiologyViewer;
