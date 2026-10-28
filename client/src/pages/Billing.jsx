import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Printer, 
  X, 
  Eye, 
  Receipt,
  User,
  Calculator,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Billing = () => {
  const { isAccountant, isAdmin, isPatient, user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Invoice Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [aggregating, setAggregating] = useState(false);
  const [pendingCharges, setPendingCharges] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({
    patient_id: '',
    consultation_fee: '0',
    room_charges: '0',
    pharmacy_charges: '0',
    lab_charges: '0',
    additional_charges: '0',
    discount: '0',
    tax_amount: '0',
    notes: 'Hospital care services rendered',
    payment_method: 'Cash',
    payment_status: 'Paid',
    paid_amount: '0'
  });

  // Pay Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');

  // Print Invoice Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchInvoices();
    if (!isPatient) {
      fetchPatients();
    }
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/billing/invoices', { params });
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  // When patient is selected in invoice modal, aggregate unbilled charges
  const handleSelectPatientForBilling = async (patientId) => {
    setSelectedPatientId(patientId);
    setInvoiceForm(prev => ({ ...prev, patient_id: patientId }));
    if (!patientId) {
      setPendingCharges(null);
      return;
    }

    try {
      setAggregating(true);
      const res = await api.get(`/billing/pending/${patientId}`);
      const data = res.data.data;
      setPendingCharges(data);

      const consult = parseFloat(data.consultation_charges || 0);
      const room = parseFloat(data.room_charges || 0);
      const pharma = parseFloat(data.pharmacy_charges || 0);
      const lab = parseFloat(data.lab_charges || 0);
      const subtotal = consult + room + pharma + lab;

      setInvoiceForm(prev => ({
        ...prev,
        consultation_fee: consult.toFixed(2),
        room_charges: room.toFixed(2),
        pharmacy_charges: pharma.toFixed(2),
        lab_charges: lab.toFixed(2),
        paid_amount: subtotal.toFixed(2)
      }));
    } catch (err) {
      console.error('Error aggregating charges:', err);
    } finally {
      setAggregating(false);
    }
  };

  const subtotal = 
    parseFloat(invoiceForm.consultation_fee || 0) +
    parseFloat(invoiceForm.room_charges || 0) +
    parseFloat(invoiceForm.pharmacy_charges || 0) +
    parseFloat(invoiceForm.lab_charges || 0) +
    parseFloat(invoiceForm.additional_charges || 0);

  const netTotal = Math.max(0, subtotal - parseFloat(invoiceForm.discount || 0) + parseFloat(invoiceForm.tax_amount || 0));

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.patient_id) {
      setErrorMsg('Please choose a patient');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/billing/invoices', {
        ...invoiceForm,
        consultation_fee: parseFloat(invoiceForm.consultation_fee || 0),
        room_charges: parseFloat(invoiceForm.room_charges || 0),
        pharmacy_charges: parseFloat(invoiceForm.pharmacy_charges || 0),
        lab_charges: parseFloat(invoiceForm.lab_charges || 0),
        additional_charges: parseFloat(invoiceForm.additional_charges || 0),
        discount: parseFloat(invoiceForm.discount || 0),
        tax_amount: parseFloat(invoiceForm.tax_amount || 0),
        paid_amount: parseFloat(invoiceForm.paid_amount || 0)
      });

      setSuccessMsg('Consolidated bill invoice generated successfully!');
      setShowCreateModal(false);
      fetchInvoices();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const openPayModal = (inv) => {
    setSelectedInvoice(inv);
    const remaining = parseFloat(inv.total_amount) - parseFloat(inv.paid_amount);
    setPayAmount(remaining.toFixed(2));
    setPayMethod('Cash');
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.patch(`/billing/invoices/${selectedInvoice.id}/payment`, {
        paid_amount: parseFloat(payAmount),
        payment_method: payMethod
      });
      setSuccessMsg(`Payment of $${payAmount} recorded successfully!`);
      setShowPayModal(false);
      fetchInvoices();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openPrintModal = async (inv) => {
    try {
      const res = await api.get(`/billing/invoices/${inv.id}`);
      setSelectedInvoice(res.data.data);
    } catch (err) {
      setSelectedInvoice(inv);
    }
    setShowPrintModal(true);
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Billing &amp; Financial Accounting</h1>
            <p className="text-sm text-slate-500">Consolidated patient invoices, department charge aggregations &amp; payment receipts</p>
          </div>
        </div>

        {(isAccountant || isAdmin) && (
          <button
            onClick={() => {
              setInvoiceForm({
                patient_id: '',
                consultation_fee: '0',
                room_charges: '0',
                pharmacy_charges: '0',
                lab_charges: '0',
                additional_charges: '0',
                discount: '0',
                tax_amount: '0',
                notes: 'Consolidated hospital services invoice',
                payment_method: 'Cash',
                payment_status: 'Paid',
                paid_amount: '0'
              });
              setPendingCharges(null);
              setSelectedPatientId('');
              setShowCreateModal(true);
            }}
            className="flex items-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-rose-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Consolidated Bill
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

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search invoice#, patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex gap-2">
          {['', 'Paid', 'Pending', 'Partial'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Bills'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading invoices ledger...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40 text-rose-500" />
            <p className="text-base font-semibold text-slate-600">No Invoices Found</p>
            <p className="text-xs text-slate-400 mt-1">Generate a consolidated bill for medical treatments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Paid</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => {
                  const remaining = Math.max(0, parseFloat(inv.total_amount) - parseFloat(inv.paid_amount));
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{inv.patient_name}</div>
                        <div className="text-xs text-slate-400 font-mono">{inv.patient_code}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${parseFloat(inv.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">
                        ${parseFloat(inv.paid_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          inv.payment_status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.payment_status === 'Partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {inv.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {inv.payment_method}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {remaining > 0 && (
                          <button
                            onClick={() => openPayModal(inv)}
                            className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            Pay (${remaining.toFixed(2)})
                          </button>
                        )}
                        <button
                          onClick={() => openPrintModal(inv)}
                          className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Consolidated Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-rose-600" />
                Generate Consolidated Patient Invoice
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-4">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Patient (Charges will be automatically aggregated) *
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => handleSelectPatientForBilling(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">-- Choose Patient for Final Billing --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patient_id}) - {p.phone}</option>
                  ))}
                </select>
              </div>

              {aggregating && (
                <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-xl flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Calculating unbilled charges across OPD, IPD, Pharmacy &amp; Lab...
                </div>
              )}

              {/* Department Charges Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-1.5 text-rose-600" />
                  Itemized Department Charges ($)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Doctor Consultation Fees</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.consultation_fee}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, consultation_fee: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">IPD Cabin / Bed Rent Charges</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.room_charges}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, room_charges: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Pharmacy Dispensed Medicines</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.pharmacy_charges}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, pharmacy_charges: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Diagnostic Laboratory Investigations</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.lab_charges}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, lab_charges: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Additional Procedures / Nursing</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.additional_charges}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, additional_charges: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Discount Concession ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.discount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Net Total Summary */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">Total Invoice Payable:</span>
                  <span className="text-xl font-black font-mono text-rose-700">${netTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                  <select
                    value={invoiceForm.payment_method}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Online">Online / Mobile Banking</option>
                    <option value="Insurance">Health Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Status</label>
                  <select
                    value={invoiceForm.payment_status}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, payment_status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Paid">Paid Full</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Pending">Pending / Unpaid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount Received ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceForm.paid_amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, paid_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Generating...' : `Confirm & Issue Bill ($${netTotal.toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Record Bill Settlement</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div><span className="text-slate-500">Invoice:</span> <strong className="font-mono text-slate-800">{selectedInvoice.invoice_number}</strong></div>
                <div><span className="text-slate-500">Patient:</span> <strong className="text-slate-800">{selectedInvoice.patient_name}</strong></div>
                <div><span className="text-slate-500">Total Billed:</span> <strong className="font-mono">${parseFloat(selectedInvoice.total_amount).toFixed(2)}</strong></div>
                <div><span className="text-slate-500">Already Paid:</span> <strong className="font-mono text-emerald-600">${parseFloat(selectedInvoice.paid_amount).toFixed(2)}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paying Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-base font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Online">Online / Mobile Banking (bKash/Nagad)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-100 flex items-center justify-between border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Official Invoice Preview</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print Official Invoice
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-slate-800" id="printable-invoice">
              {/* Header */}
              <div className="border-b-2 border-rose-600 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-rose-700 tracking-tight">CareSync General Hospital</h2>
                  <p className="text-xs text-slate-500">Finance &amp; Accounts Department &bull; Tax ID: CARE-98402-HMS</p>
                  <p className="text-xs text-slate-500">Hospital Complex, 123 Healthcare Blvd &bull; Phone: +1 555-019-2830</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-slate-900">{selectedInvoice.invoice_number}</div>
                  <div className="text-xs text-slate-500">Billing Date: {new Date(selectedInvoice.created_at).toLocaleDateString()}</div>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase ${selectedInvoice.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {selectedInvoice.payment_status}
                  </span>
                </div>
              </div>

              {/* Patient info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-slate-500">Billed To:</span> <strong className="text-slate-900 block text-sm">{selectedInvoice.patient_name}</strong></div>
                <div><span className="text-slate-500">Patient ID:</span> <strong className="font-mono text-slate-800 block">{selectedInvoice.patient_code}</strong></div>
                <div><span className="text-slate-500">Contact:</span> <strong className="text-slate-800 block">{selectedInvoice.patient_phone || 'N/A'}</strong></div>
              </div>

              {/* Itemized Table */}
              <div className="py-2">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-600 font-bold uppercase">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parseFloat(selectedInvoice.consultation_fee) > 0 && (
                      <tr className="py-2.5">
                        <td className="py-2.5">Doctor OPD Consultation &amp; Assessment Charges</td>
                        <td className="py-2.5 text-right font-mono font-semibold">${parseFloat(selectedInvoice.consultation_fee).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedInvoice.room_charges) > 0 && (
                      <tr className="py-2.5">
                        <td className="py-2.5">In-Patient Department (IPD) Cabin / Bed Accommodation Rent</td>
                        <td className="py-2.5 text-right font-mono font-semibold">${parseFloat(selectedInvoice.room_charges).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedInvoice.pharmacy_charges) > 0 && (
                      <tr className="py-2.5">
                        <td className="py-2.5">Pharmacy Dispensed Prescription Medications &amp; Consumables</td>
                        <td className="py-2.5 text-right font-mono font-semibold">${parseFloat(selectedInvoice.pharmacy_charges).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedInvoice.lab_charges) > 0 && (
                      <tr className="py-2.5">
                        <td className="py-2.5">Clinical Pathology &amp; Diagnostic Investigations</td>
                        <td className="py-2.5 text-right font-mono font-semibold">${parseFloat(selectedInvoice.lab_charges).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedInvoice.additional_charges) > 0 && (
                      <tr className="py-2.5">
                        <td className="py-2.5">Hospital Facility, Nursing &amp; Administrative Fees</td>
                        <td className="py-2.5 text-right font-mono font-semibold">${parseFloat(selectedInvoice.additional_charges).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedInvoice.discount) > 0 && (
                      <tr className="py-2.5 text-emerald-700">
                        <td className="py-2.5">Authorized Concession / Discount</td>
                        <td className="py-2.5 text-right font-mono font-semibold">-${parseFloat(selectedInvoice.discount).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Summary */}
              <div className="border-t-2 border-slate-300 pt-3 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-1">
                    <span>Grand Total:</span>
                    <span className="font-mono text-rose-700">${parseFloat(selectedInvoice.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-700">
                    <span>Paid Amount:</span>
                    <span className="font-mono">${parseFloat(selectedInvoice.paid_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Balance Due:</span>
                    <span className="font-mono">${Math.max(0, parseFloat(selectedInvoice.total_amount) - parseFloat(selectedInvoice.paid_amount)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-12 flex justify-between text-xs">
                <div className="text-center border-t border-slate-400 pt-1 w-44">
                  <div className="font-bold text-slate-800">Patient / Depositor</div>
                  <div className="text-slate-400">Signature</div>
                </div>
                <div className="text-center border-t border-slate-400 pt-1 w-44">
                  <div className="font-bold text-slate-800">Authorized Cashier</div>
                  <div className="text-slate-400">CareSync Finance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

