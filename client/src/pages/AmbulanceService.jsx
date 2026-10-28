import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  Plus,
  Search,
  Phone,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Shield,
  Send,
  Navigation,
  FileText,
  DollarSign,
  X,
  Radio,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

const AmbulanceService = () => {
  const { isAdmin, isDoctor, isReceptionist } = useAuth();
  const { formatMoney, lang } = useLocale();

  const [ambulances, setAmbulances] = useState([]);
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({
    totalAmbulances: 0,
    availableAmbulances: 0,
    dispatchedAmbulances: 0,
    maintenanceAmbulances: 0,
    activeTrips: 0,
    totalTrips: 0
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trips'); // 'trips' | 'fleet'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showAddAmbulanceModal, setShowAddAmbulanceModal] = useState(false);
  const [showTripDetailModal, setShowTripDetailModal] = useState(null);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(null);

  // Notifications / Alert
  const [bannerMsg, setBannerMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dispatch Form
  const [dispatchForm, setDispatchForm] = useState({
    ambulance_id: '',
    patient_id: '',
    caller_name: '',
    caller_phone: '',
    pickup_location: '',
    drop_location: 'CareSync Hospital Emergency ER Bay',
    urgency: 'Emergency_Critical___Red_Code',
    total_km: 10,
    remarks: ''
  });

  // Add Ambulance Form
  const [newAmbulance, setNewAmbulance] = useState({
    vehicle_number: '',
    vehicle_model: '',
    ambulance_type: 'Basic_Life_Support__BLS_',
    driver_name: '',
    driver_phone: '',
    paramedic_name: '',
    current_location: 'CareSync Emergency Bay',
    base_charge: 1500,
    per_km_rate: 60
  });

  // Trip Status Form
  const [tripUpdateForm, setTripUpdateForm] = useState({
    trip_status: '',
    total_km: '',
    payment_status: '',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
    fetchPatients();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ambRes, tripRes, statsRes] = await Promise.all([
        api.get('/ambulance'),
        api.get('/ambulance/trips'),
        api.get('/ambulance/stats')
      ]);
      setAmbulances(ambRes.data.data || []);
      setTrips(tripRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Error fetching ambulance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients', { params: { limit: 100 } });
      setPatients(res.data.data || []);
    } catch (e) {
      console.warn('Could not load patient dropdown:', e.message);
    }
  };

  const showNotification = (type, text) => {
    setBannerMsg({ type, text });
    setTimeout(() => setBannerMsg(null), 6000);
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchForm.ambulance_id || !dispatchForm.caller_name || !dispatchForm.caller_phone || !dispatchForm.pickup_location) {
      showNotification('error', 'Please fill in all mandatory dispatch fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/ambulance/trips', dispatchForm);
      showNotification('success', `Dispatch initiated! Trip #${res.data.data.trip_number}. SMS alert sent to ${dispatchForm.caller_phone}.`);
      setShowDispatchModal(false);
      setDispatchForm({
        ambulance_id: '',
        patient_id: '',
        caller_name: '',
        caller_phone: '',
        pickup_location: '',
        drop_location: 'CareSync Hospital Emergency ER Bay',
        urgency: 'Emergency_Critical___Red_Code',
        total_km: 10,
        remarks: ''
      });
      fetchData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to dispatch ambulance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAmbulance = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/ambulance', newAmbulance);
      showNotification('success', 'Ambulance vehicle registered to emergency fleet successfully!');
      setShowAddAmbulanceModal(false);
      setNewAmbulance({
        vehicle_number: '',
        vehicle_model: '',
        ambulance_type: 'Basic_Life_Support__BLS_',
        driver_name: '',
        driver_phone: '',
        paramedic_name: '',
        current_location: 'CareSync Emergency Bay',
        base_charge: 1500,
        per_km_rate: 60
      });
      fetchData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to register ambulance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (trip, nextStatus) => {
    try {
      await api.patch(`/ambulance/trips/${trip.id}/status`, { trip_status: nextStatus });
      showNotification('success', `Trip ${trip.trip_number} updated to "${formatTripStatus(nextStatus)}".`);
      fetchData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Could not update status');
    }
  };

  const handleUpdateTripSubmit = async (e) => {
    e.preventDefault();
    if (!showStatusUpdateModal) return;

    try {
      setSubmitting(true);
      await api.patch(`/ambulance/trips/${showStatusUpdateModal.id}/status`, tripUpdateForm);
      showNotification('success', `Trip ${showStatusUpdateModal.trip_number} details successfully updated!`);
      setShowStatusUpdateModal(null);
      fetchData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update trip');
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusModal = (trip) => {
    setTripUpdateForm({
      trip_status: trip.trip_status,
      total_km: trip.total_km || 10,
      payment_status: trip.payment_status || 'Unpaid',
      remarks: trip.remarks || ''
    });
    setShowStatusUpdateModal(trip);
  };

  // Helper labels
  const formatAmbulanceType = (type) => {
    switch (type) {
      case 'ICU_Ambulance_with_Ventilator': return 'Mobile ICU (Ventilator)';
      case 'Advanced_Cardiac_Life_Support__ACLS_': return 'ACLS Cardiac Support';
      case 'Basic_Life_Support__BLS_': return 'Basic Life Support (BLS)';
      case 'Patient_Transport_Vehicle': return 'Patient Transport';
      default: return type?.replace(/_/g, ' ');
    }
  };

  const formatTripStatus = (status) => {
    switch (status) {
      case 'Dispatched': return 'Dispatched & En Route';
      case 'Reached_Patient_Scene': return 'At Patient Scene';
      case 'In_Transit_to_Hospital': return 'In Transit to ER';
      case 'Completed': return 'Completed';
      case 'Cancelled': return 'Cancelled';
      default: return status?.replace(/_/g, ' ');
    }
  };

  const getTripStatusBadge = (status) => {
    switch (status) {
      case 'Dispatched':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Reached_Patient_Scene':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In_Transit_to_Hospital':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAmbulanceStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Dispatched___On_Trip':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'At_Patient_Scene':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Returning_to_Base':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Maintenance':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Emergency_Critical___Red_Code':
        return 'bg-red-500 text-white font-bold animate-pulse';
      case 'Urgent_Transfer':
        return 'bg-amber-500 text-white font-semibold';
      case 'Routine_Transfer':
        return 'bg-blue-500 text-white font-medium';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  // Filtered trips
  const filteredTrips = trips.filter(t => {
    const matchesSearch = 
      t.trip_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.caller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.caller_phone?.includes(searchQuery) ||
      t.pickup_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ambulances?.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || t.trip_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate selected ambulance fare preview in modal
  const selectedAmbObj = ambulances.find(a => a.id === parseInt(dispatchForm.ambulance_id));
  const estimatedFare = selectedAmbObj 
    ? (parseFloat(selectedAmbObj.base_charge) || 1000) + ((parseFloat(dispatchForm.total_km) || 10) * (parseFloat(selectedAmbObj.per_km_rate) || 50))
    : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {bannerMsg && (
        <div className={`p-4 rounded-xl flex items-center justify-between shadow-lg transition-all border ${
          bannerMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
            : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          <div className="flex items-center space-x-3">
            {bannerMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <p className="text-sm font-semibold">{bannerMsg.text}</p>
          </div>
          <button onClick={() => setBannerMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-rose-800/40">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-rose-600 rounded-xl text-white shadow-lg shadow-rose-600/40 animate-pulse">
              <Ambulance className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {lang === 'bn' ? 'অ্যাম্বুলেন্স ও জরুরি ডিসপ্যাচ ব্যবস্থাপনা' : 'Ambulance Fleet & Emergency Dispatch'}
            </h1>
          </div>
          <p className="text-rose-200/80 text-sm max-w-2xl">
            {lang === 'bn' 
              ? '২৪/৭ জরুরি মোবাইল আইসিইউ ডিসপ্যাচ, লাইভ ট্রিপ ট্র্যাকিং এবং স্বয়ংক্রিয় এসএমএস সতর্কতা ব্যবস্থা।'
              : '24/7 Mobile ICU & BLS fleet tracking, rapid incident response dispatch, live status coordination, and automated caller SMS alerts.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(isAdmin || isReceptionist || isDoctor) && (
            <button
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4 animate-spin text-rose-200" />
              <span>{lang === 'bn' ? 'জরুরি অ্যাম্বুলেন্স পাঠান' : 'Dispatch Emergency'}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowAddAmbulanceModal(true)}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4 text-rose-300" />
              <span>{lang === 'bn' ? 'নতুন অ্যাম্বুলেন্স যুক্ত করুন' : 'Add Vehicle'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'মোট বহর' : 'Total Fleet'}
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalAmbulances || ambulances.length}</p>
            <span className="text-xs text-blue-600 font-medium mt-1 inline-block">CareSync Hospital Base</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Ambulance className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'স্ট্যান্ডবাই খালি' : 'Available Standby'}
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.availableAmbulances}</p>
            <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Ready for Dispatch</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'চলমান জরুরি ট্রিপ' : 'Active Dispatches'}
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1">{stats.activeTrips}</p>
            <span className="text-xs text-rose-600 font-medium mt-1 inline-block">Live on Dhaka Roads</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'সার্ভিস সম্পন্ন' : 'Total Trips Logged'}
            </p>
            <p className="text-2xl font-black text-purple-600 mt-1">{stats.totalTrips || trips.length}</p>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Historical Trips</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex space-x-2">
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'trips'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{lang === 'bn' ? 'জরুরি ট্রিপ ও লাইভ ডিসপ্যাচ' : 'Active Dispatches & Trips'} ({trips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'fleet'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Ambulance className="w-4 h-4" />
          <span>{lang === 'bn' ? 'অ্যাম্বুলেন্স বহর ও ড্রাইভার' : 'Ambulance Fleet Directory'} ({ambulances.length})</span>
        </button>
      </div>

      {/* TAB 1: TRIPS LOG */}
      {activeTab === 'trips' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'ট্রিপ নং, কলারের নাম, ফোন বা স্থান দিয়ে খুঁজুন...' : 'Search trip #, caller, phone or location...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">All Trip Statuses</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Reached_Patient_Scene">At Patient Scene</option>
                <option value="In_Transit_to_Hospital">In Transit</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={fetchData}
                className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 shadow-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Trip # & Urgency</th>
                  <th className="py-3 px-4">Vehicle & EMT</th>
                  <th className="py-3 px-4">Caller & Location</th>
                  <th className="py-3 px-4">Status Workflow</th>
                  <th className="py-3 px-4">Fare & Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      <Ambulance className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-500" />
                      <p className="font-semibold text-slate-600">No ambulance trips found</p>
                      <p className="text-xs text-slate-400 mt-1">Initiate an emergency dispatch using the button above.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{trip.trip_number}</div>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${getUrgencyBadge(trip.urgency)}`}>
                            {trip.urgency === 'Emergency_Critical___Red_Code' ? 'RED CODE CRITICAL' : trip.urgency?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{trip.ambulances?.vehicle_number}</div>
                        <div className="text-xs text-slate-600">{trip.ambulances?.vehicle_model}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center">
                          <User className="w-3 h-3 mr-1 text-slate-400" />
                          {trip.ambulances?.driver_name} ({trip.ambulances?.driver_phone})
                        </div>
                        {trip.ambulances?.paramedic_name && (
                          <div className="text-[11px] text-rose-600 font-medium">
                            EMT: {trip.ambulances?.paramedic_name}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900">{trip.caller_name}</div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" />
                          {trip.caller_phone}
                        </div>
                        <div className="text-xs text-slate-700 mt-1 flex items-start">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{trip.pickup_location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getTripStatusBadge(trip.trip_status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                          {formatTripStatus(trip.trip_status)}
                        </span>

                        {/* Quick progression shortcuts */}
                        <div className="mt-2 flex items-center gap-1.5">
                          {trip.trip_status === 'Dispatched' && (
                            <button
                              onClick={() => handleQuickStatusChange(trip, 'Reached_Patient_Scene')}
                              className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded transition"
                              title="Driver reached patient scene"
                            >
                              Arrived Scene →
                            </button>
                          )}
                          {trip.trip_status === 'Reached_Patient_Scene' && (
                            <button
                              onClick={() => handleQuickStatusChange(trip, 'In_Transit_to_Hospital')}
                              className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-300 px-2 py-0.5 rounded transition"
                              title="Ambulance en route back to CareSync ER"
                            >
                              Depart ER →
                            </button>
                          )}
                          {trip.trip_status === 'In_Transit_to_Hospital' && (
                            <button
                              onClick={() => handleQuickStatusChange(trip, 'Completed')}
                              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded transition"
                              title="Patient safely delivered to ER"
                            >
                              Complete Trip ✓
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{formatMoney(trip.total_fare)}</div>
                        <div className="text-xs text-slate-500">{trip.total_km} km estimated</div>
                        <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          trip.payment_status === 'Paid' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : trip.payment_status === 'Charged_to_Hospital_Bill'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {trip.payment_status === 'Charged_to_Hospital_Bill' ? 'Hospital Bill' : trip.payment_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setShowTripDetailModal(trip)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="View details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openStatusModal(trip)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition font-medium text-xs border border-rose-200"
                            title="Edit / Settle Fare"
                          >
                            Manage
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
      )}

      {/* TAB 2: AMBULANCE FLEET DIRECTORY */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ambulances.map((amb) => (
            <div
              key={amb.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <Ambulance className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getAmbulanceStatusBadge(amb.status)}`}>
                    {amb.status?.replace(/___/g, ' / ')?.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base">{amb.vehicle_number}</h3>
                <p className="text-xs text-slate-600 font-medium mb-1">{amb.vehicle_model}</p>

                <div className="mt-2 inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                  <Shield className="w-3 h-3 mr-1 text-slate-500" />
                  {formatAmbulanceType(amb.ambulance_type)}
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Driver:
                    </span>
                    <span className="font-semibold text-slate-800">{amb.driver_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Phone:
                    </span>
                    <a href={`tel:${amb.driver_phone}`} className="font-semibold text-rose-600 hover:underline">
                      {amb.driver_phone}
                    </a>
                  </div>

                  {amb.paramedic_name && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center">
                        <Activity className="w-3.5 h-3.5 mr-1.5 text-rose-500" /> Paramedic:
                      </span>
                      <span className="font-semibold text-rose-700">{amb.paramedic_name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Station:
                    </span>
                    <span className="font-medium text-slate-800 truncate max-w-[120px]">{amb.current_location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Fare</span>
                  <span className="font-bold text-slate-900">{formatMoney(amb.base_charge)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Per KM</span>
                  <span className="font-bold text-slate-900">{formatMoney(amb.per_km_rate)}/km</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: EMERGENCY DISPATCH */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/30">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {lang === 'bn' ? 'জরুরি অ্যাম্বুলেন্স ডিসপ্যাচ ফর্ম' : 'Emergency Ambulance Dispatch'}
                  </h3>
                  <p className="text-xs text-slate-500">Fast vehicle dispatch with automated SMS coordination to caller</p>
                </div>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Ambulance Vehicle *
                </label>
                <select
                  required
                  value={dispatchForm.ambulance_id}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, ambulance_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  <option value="">-- Choose Available Fleet Vehicle --</option>
                  {ambulances.map((amb) => (
                    <option key={amb.id} value={amb.id}>
                      {amb.vehicle_number} - {amb.vehicle_model} ({formatAmbulanceType(amb.ambulance_type)}) [{amb.status?.replace(/___/g, ' / ')}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Caller / Attendant Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Shamima Begum"
                    value={dispatchForm.caller_name}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, caller_name: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Caller Phone (SMS Alert Target) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+880 1711..."
                    value={dispatchForm.caller_phone}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, caller_phone: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pickup Location / Incident Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House 45, Road 11, Dhanmondi, Dhaka"
                  value={dispatchForm.pickup_location}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, pickup_location: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Emergency Urgency Level
                  </label>
                  <select
                    value={dispatchForm.urgency}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, urgency: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  >
                    <option value="Emergency_Critical___Red_Code">Red Code (Critical - Oxygen/CPR)</option>
                    <option value="Urgent_Transfer">Yellow Code (Urgent Transfer)</option>
                    <option value="Routine_Transfer">Green Code (Routine Patient Transfer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Est. Distance (KM)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={dispatchForm.total_km}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, total_km: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Patient link if existing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Link Registered Patient (Optional)
                </label>
                <select
                  value={dispatchForm.patient_id}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, patient_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">-- No registered patient / Unregistered ER patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.patient_id} - {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Medical Notes / Condition Summary
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. 62yo male, severe dyspnea, suspected cardiac arrest. Oxygen prepared."
                  value={dispatchForm.remarks}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, remarks: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Fare calculation display */}
              {selectedAmbObj && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between text-xs text-rose-900">
                  <div>
                    <span className="font-bold">Tariff Calculation:</span>
                    <span className="ml-2">Base {formatMoney(selectedAmbObj.base_charge)} + ({dispatchForm.total_km} km × {formatMoney(selectedAmbObj.per_km_rate)})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-rose-700">{formatMoney(estimatedFare)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Dispatching...' : 'Dispatch & Send SMS'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD AMBULANCE VEHICLE */}
      {showAddAmbulanceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Register Ambulance Vehicle</h3>
                  <p className="text-xs text-slate-500">Add a new emergency transport unit to CareSync fleet</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAmbulanceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAmbulance} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DHK-METRO-CHA-71-4405"
                    value={newAmbulance.vehicle_number}
                    onChange={(e) => setNewAmbulance({ ...newAmbulance, vehicle_number: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Toyota HiAce Grand Cabin"
                    value={newAmbulance.vehicle_model}
                    onChange={(e) => setNewAmbulance({ ...newAmbulance, vehicle_model: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ambulance Category / Tier
                </label>
                <select
                  value={newAmbulance.ambulance_type}
                  onChange={(e) => setNewAmbulance({ ...newAmbulance, ambulance_type: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="ICU_Ambulance_with_Ventilator">Mobile ICU with Ventilator & Defibrillator</option>
                  <option value="Advanced_Cardiac_Life_Support__ACLS_">Advanced Cardiac Life Support (ACLS)</option>
                  <option value="Basic_Life_Support__BLS_">Basic Life Support (BLS)</option>
                  <option value="Patient_Transport_Vehicle">Patient Transport Vehicle</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Driver Full Name"
                    value={newAmbulance.driver_name}
                    onChange={(e) => setNewAmbulance({ ...newAmbulance, driver_name: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Driver Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+880 1711..."
                    value={newAmbulance.driver_phone}
                    onChange={(e) => setNewAmbulance({ ...newAmbulance, driver_phone: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned EMT / Paramedic
                </label>
                <input
                  type="text"
                  placeholder="e.g. EMT Rafiqul Islam"
                  value={newAmbulance.paramedic_name}
                  onChange={(e) => setNewAmbulance({ ...newAmbulance, paramedic_name: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Base Fare (৳/$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newAmbulance.base_charge}
                    onChange={(e) => setNewAmbulance({ ...newAmbulance, base_charge: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Per KM Rate (৳/$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newAmbulance.per_km_rate}
                    onChange={(e) => setNewAmbulance({ ...newAmbulance, per_km_rate: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAmbulanceModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Registering...' : 'Register Vehicle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRIP DETAIL VIEW */}
      {showTripDetailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Trip #{showTripDetailModal.trip_number}</h3>
                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-1 ${getUrgencyBadge(showTripDetailModal.urgency)}`}>
                  {showTripDetailModal.urgency?.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={() => setShowTripDetailModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase">Caller & Contact</p>
                <p className="font-bold text-slate-800">{showTripDetailModal.caller_name}</p>
                <p className="text-slate-600">{showTripDetailModal.caller_phone}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase">Routing</p>
                <p className="text-slate-800"><span className="font-semibold">From:</span> {showTripDetailModal.pickup_location}</p>
                <p className="text-slate-800 mt-1"><span className="font-semibold">To:</span> {showTripDetailModal.drop_location}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Ambulance</p>
                  <p className="font-bold text-slate-800">{showTripDetailModal.ambulances?.vehicle_number}</p>
                  <p className="text-xs text-slate-600">{showTripDetailModal.ambulances?.vehicle_model}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Driver & EMT</p>
                  <p className="font-bold text-slate-800">{showTripDetailModal.ambulances?.driver_name}</p>
                  <p className="text-xs text-rose-600">{showTripDetailModal.ambulances?.paramedic_name || 'No EMT'}</p>
                </div>
              </div>

              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-800 uppercase">Total Fare</p>
                  <p className="text-xs text-rose-700">{showTripDetailModal.total_km} KM distance</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-rose-700">{formatMoney(showTripDetailModal.total_fare)}</p>
                  <span className="text-xs font-semibold text-slate-700">{showTripDetailModal.payment_status}</span>
                </div>
              </div>

              {showTripDetailModal.remarks && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <p className="font-bold text-slate-700 mb-0.5">Medical Log & Remarks:</p>
                  <p className="text-slate-600">{showTripDetailModal.remarks}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTripDetailModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MANAGE STATUS & FARE */}
      {showStatusUpdateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Update Trip #{showStatusUpdateModal.trip_number}
              </h3>
              <button
                onClick={() => setShowStatusUpdateModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTripSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Trip Status
                </label>
                <select
                  value={tripUpdateForm.trip_status}
                  onChange={(e) => setTripUpdateForm({ ...tripUpdateForm, trip_status: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                >
                  <option value="Dispatched">Dispatched</option>
                  <option value="Reached_Patient_Scene">Reached Patient Scene</option>
                  <option value="In_Transit_to_Hospital">In Transit to Hospital</option>
                  <option value="Completed">Completed (Releases Ambulance)</option>
                  <option value="Cancelled">Cancelled (Releases Ambulance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Final Actual KM Distance
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={tripUpdateForm.total_km}
                  onChange={(e) => setTripUpdateForm({ ...tripUpdateForm, total_km: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Status
                </label>
                <select
                  value={tripUpdateForm.payment_status}
                  onChange={(e) => setTripUpdateForm({ ...tripUpdateForm, payment_status: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  <option value="Paid">Paid in Cash/Card</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Charged_to_Hospital_Bill">Charged to In-Patient Hospital Bill</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Trip Remarks / Completion Log
                </label>
                <textarea
                  rows="2"
                  value={tripUpdateForm.remarks}
                  onChange={(e) => setTripUpdateForm({ ...tripUpdateForm, remarks: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusUpdateModal(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition text-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceService;
