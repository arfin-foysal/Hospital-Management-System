import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Printer, 
  X, 
  Eye, 
  Tag, 
  User, 
  Stethoscope
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const testCategories = ['All', 'Hematology', 'Biochemistry', 'Microbiology', 'Radiology', 'Pathology'];

const Laboratory = () => {
  const { isLabTech, isAdmin, isDoctor } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'catalog'
  const [requests, setRequests] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // New Request Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    patient_id: '',
    doctor_id: '',
    test_id: '',
    notes: ''
  });

  // Add Catalog Item Modal State
  const [showAddCatalogModal, setShowAddCatalogModal] = useState(false);
  const [catalogForm, setCatalogForm] = useState({
    test_name: '',
    category: 'Hematology',
    standard_charge: '',
    normal_range: '',
    unit: '',
    turnaround_hours: '24'
  });

  // Update Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resultForm, setResultForm] = useState({
    status: 'Completed',
    result_value: '',
    technician_notes: ''
  });
  const [reportFile, setReportFile] = useState(null);

  // Print Report Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchCatalog();
    fetchMetadata();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/lab/requests', { params });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Error fetching lab requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/lab/catalog');
      setCatalog(res.data.data || []);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments/meta/doctors')
      ]);
      setPatients(pRes.data.data || []);
      setDoctors(dRes.data.data || []);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/lab/requests', orderForm);
      setSuccessMsg('Diagnostic test requisition created successfully!');
      setShowOrderModal(false);
      setOrderForm({ patient_id: '', doctor_id: '', test_id: '', notes: '' });
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCatalogItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/lab/catalog', catalogForm);
      setSuccessMsg('Diagnostic test added to hospital catalog!');
      setShowAddCatalogModal(false);
      setCatalogForm({
        test_name: '',
        category: 'Hematology',
        standard_charge: '',
        normal_range: '',
        unit: '',
        turnaround_hours: '24'
      });
      fetchCatalog();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add test');
    } finally {
      setSubmitting(false);
    }
  };

  const openResultModal = (req) => {
    setSelectedRequest(req);
    setResultForm({
      status: req.status === 'Completed' ? 'Completed' : 'Completed',
      result_value: req.result_value || '',
      technician_notes: req.technician_notes || ''
    });
    setReportFile(null);
    setShowResultModal(true);
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('status', resultForm.status);
      data.append('result_value', resultForm.result_value);
      data.append('technician_notes', resultForm.technician_notes);
      if (reportFile) {
        data.append('report_file', reportFile);
      }

      await api.put(`/lab/requests/${selectedRequest.id}/result`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Diagnostic results updated successfully!');
      setShowResultModal(false);
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit test result');
    } finally {
      setSubmitting(false);
    }
  };

  const openPrintModal = (req) => {
    setSelectedRequest(req);
    setShowPrintModal(true);
  };

  const filteredRequests = requests.filter(r => 
    r.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Laboratory &amp; Diagnostics</h1>
            <p className="text-sm text-slate-500">Pathology tests, specimen results recording &amp; clinical diagnostic reports</p>
          </div>
        </div>

        {/* Tab & Action Buttons */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'requests' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Test Orders ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'catalog' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Test Catalog ({catalog.length})
            </button>
          </div>

          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            Order Test
          </button>

          {(isLabTech || isAdmin) && activeTab === 'catalog' && (
            <button
              onClick={() => setShowAddCatalogModal(true)}
              className="flex items-center px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Test to Catalog
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* TAB 1: TEST ORDERS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search order#, test, patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              {['', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st || 'All Statuses'}
                </button>
              ))}
            </div>
          </div>

          {/* Test Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading lab orders...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-500" />
                <p className="text-base font-semibold text-slate-600">No Laboratory Requests Found</p>
                <p className="text-xs text-slate-400 mt-1">Requisition diagnostic tests for clinical investigations.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Req #</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Test Name &amp; Dept</th>
                      <th className="py-3.5 px-4">Patient</th>
                      <th className="py-3.5 px-4">Doctor</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                          {req.request_number}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{req.test_name}</div>
                          <div className="text-xs text-slate-400">{req.category} &bull; ${req.standard_charge}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{req.patient_name}</div>
                          <div className="text-xs text-slate-400 font-mono">{req.patient_code}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {req.doctor_name || 'OPD Desk'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            req.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : req.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {(isLabTech || isAdmin) && req.status !== 'Completed' && (
                            <button
                              onClick={() => openResultModal(req)}
                              className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Record Result
                            </button>
                          )}
                          {req.status === 'Completed' && (
                            <button
                              onClick={() => openPrintModal(req)}
                              className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Report
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
        </div>
      )}

      {/* TAB 2: TEST CATALOG */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-600">
            <span>Diagnostic Tests &amp; Tariffs Catalog</span>
            <span>Total Available: {catalog.length} tests</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Test Name</th>
                  <th className="py-3 px-4">Department / Category</th>
                  <th className="py-3 px-4">Standard Charge</th>
                  <th className="py-3 px-4">Normal Reference Range</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Turnaround Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {catalog.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.test_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-emerald-700">
                      ${parseFloat(item.standard_charge).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {item.normal_range || 'Clinical Interpretation'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{item.unit || '-'}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{item.turnaround_hours} hours</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center">
                <FlaskConical className="w-5 h-5 mr-2 text-indigo-600" />
                New Diagnostic Requisition
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Patient *</label>
                <select
                  required
                  value={orderForm.patient_id}
                  onChange={(e) => setOrderForm({ ...orderForm, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patient_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Diagnostic Test *</label>
                <select
                  required
                  value={orderForm.test_id}
                  onChange={(e) => setOrderForm({ ...orderForm, test_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">-- Choose Test --</option>
                  {catalog.map(c => (
                    <option key={c.id} value={c.id}>{c.test_name} ({c.category}) - ${c.standard_charge}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Referring Doctor (Optional)</label>
                <select
                  value={orderForm.doctor_id}
                  onChange={(e) => setOrderForm({ ...orderForm, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">-- OPD Desk / Walk-in --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clinical Remarks / Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g., Routine pre-op screening, check fasting levels..."
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Submit Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Catalog Item Modal */}
      {showAddCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Add Test to Laboratory Catalog</h3>
              <button onClick={() => setShowAddCatalogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCatalogItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Complete Blood Count (CBC)"
                  value={catalogForm.test_name}
                  onChange={(e) => setCatalogForm({ ...catalogForm, test_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                <select
                  value={catalogForm.category}
                  onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  {testCategories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={catalogForm.standard_charge}
                    onChange={(e) => setCatalogForm({ ...catalogForm, standard_charge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="mg/dL, /uL"
                    value={catalogForm.unit}
                    onChange={(e) => setCatalogForm({ ...catalogForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Normal Reference Range</label>
                <input
                  type="text"
                  placeholder="e.g. 70 - 110 mg/dL"
                  value={catalogForm.normal_range}
                  onChange={(e) => setCatalogForm({ ...catalogForm, normal_range: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddCatalogModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Result Modal */}
      {showResultModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800">Record Test Findings</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedRequest.request_number} &bull; {selectedRequest.test_name}</p>
              </div>
              <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateResult} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Result Status</label>
                <select
                  value={resultForm.status}
                  onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Completed">Completed (Final Result Available)</option>
                  <option value="In Progress">In Progress (Specimen Analyzing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantitative / Qualitative Finding *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Fasting Blood Glucose: 98 mg/dL (Normal). HbA1c: 5.4%."
                  value={resultForm.result_value}
                  onChange={(e) => setResultForm({ ...resultForm, result_value: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Technician / Pathologist Notes</label>
                <input
                  type="text"
                  placeholder="Specimen quality satisfactory, verified by Lab In-Charge"
                  value={resultForm.technician_notes}
                  onChange={(e) => setResultForm({ ...resultForm, technician_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Attach Report Document / Scan (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setReportFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 border border-slate-300 rounded-xl p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Publish Test Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Diagnostic Report Modal */}
      {showPrintModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-100 flex items-center justify-between border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Diagnostic Laboratory Report</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print Report
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-slate-800" id="printable-lab-report">
              {/* Header */}
              <div className="border-b-2 border-indigo-600 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-indigo-700 tracking-tight">CareSync Diagnostic Laboratories</h2>
                  <p className="text-xs text-slate-500">ISO 15189 Certified Clinical Pathology &amp; Imaging Center</p>
                  <p className="text-xs text-slate-500">CareSync Hospital Complex &bull; Ext: 4421</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black font-mono text-slate-800">{selectedRequest.request_number}</div>
                  <div className="text-xs text-slate-500">Sample Date: {new Date(selectedRequest.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Patient info */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Patient:</span> <strong className="text-slate-800">{selectedRequest.patient_name}</strong></div>
                <div><span className="text-slate-500">Patient ID:</span> <strong className="text-slate-800">{selectedRequest.patient_code}</strong></div>
                <div><span className="text-slate-500">Referred by:</span> <strong className="text-slate-800">{selectedRequest.doctor_name || 'OPD Desk'}</strong></div>
                <div><span className="text-slate-500">Status:</span> <span className="font-bold text-emerald-600">{selectedRequest.status}</span></div>
              </div>

              {/* Test Results Table */}
              <div className="py-2">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-600 font-bold uppercase">
                      <th className="py-2">Investigation Test</th>
                      <th className="py-2">Observed Findings</th>
                      <th className="py-2">Reference Biological Range</th>
                      <th className="py-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="py-3">
                      <td className="py-3 font-bold text-slate-900">{selectedRequest.test_name}</td>
                      <td className="py-3 font-semibold text-indigo-700 whitespace-pre-wrap">{selectedRequest.result_value || 'Pending'}</td>
                      <td className="py-3 font-mono text-slate-600">{selectedRequest.normal_range || 'Clinical'}</td>
                      <td className="py-3 text-slate-500">{selectedRequest.unit || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedRequest.technician_notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Lab Remarks: </span>
                  <span className="text-slate-600">{selectedRequest.technician_notes}</span>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-12 flex justify-between text-xs">
                <div className="text-center border-t border-slate-400 pt-1 w-44">
                  <div className="font-bold text-slate-800">Medical Technologist</div>
                  <div className="text-slate-400">CareSync Pathology</div>
                </div>
                <div className="text-center border-t border-slate-400 pt-1 w-44">
                  <div className="font-bold text-slate-800">Consultant Pathologist</div>
                  <div className="text-slate-400">MBBS, FRCPath</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laboratory;

