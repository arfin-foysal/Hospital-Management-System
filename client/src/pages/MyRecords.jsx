import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  FlaskConical, 
  Receipt, 
  Heart, 
  Activity, 
  Clock, 
  CheckCircle, 
  Printer, 
  Eye, 
  AlertCircle,
  Pill,
  CreditCard,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyRecords = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' | 'appointments' | 'labs' | 'bills'
  const [patientProfile, setPatientProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected item modal
  const [selectedRx, setSelectedRx] = useState(null);
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchAllRecords();
  }, []);

  const fetchAllRecords = async () => {
    try {
      setLoading(true);
      const [rxRes, aptRes, labRes, invRes] = await Promise.all([
        api.get('/emr'),
        api.get('/appointments'),
        api.get('/lab/requests'),
        api.get('/billing/invoices')
      ]);

      setPrescriptions(rxRes.data.data || []);
      setAppointments(aptRes.data.data || []);
      setLabReports(labRes.data.data || []);
      setInvoices(invRes.data.data || []);

      // If user is a patient with patient_id, fetch profile
      if (user?.patient_id) {
        try {
          const pRes = await api.get(`/patients/${user.patient_id}`);
          setPatientProfile(pRes.data.data);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Error fetching patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId, amount) => {
    try {
      await api.patch(`/billing/invoices/${invoiceId}/payment`, {
        paid_amount: parseFloat(amount),
        payment_method: 'Online'
      });
      alert('Online Payment Successful! Receipt Updated.');
      fetchAllRecords();
      setShowInvoiceModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Health ID Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <User className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400 text-slate-900">
                  Verified Patient
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Patient Code: <strong className="font-mono text-white">{user?.patients?.patient_id || user?.patient_code || 'PT-ONLINE'}</strong> &bull; {user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center">
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Blood Group</div>
              <div className="text-lg font-black text-white">{patientProfile?.blood_group || user?.patients?.blood_group || 'O+'}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center">
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Age / Gender</div>
              <div className="text-lg font-black text-white">
                {patientProfile?.age || user?.patients?.age || '28'}y &bull; {patientProfile?.gender || user?.patients?.gender || 'Male'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center">
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Total Visits</div>
              <div className="text-lg font-black text-white">{appointments.length + prescriptions.length}</div>
            </div>
          </div>
        </div>

        {patientProfile?.allergies && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
            <span><strong>Allergies / Alerts:</strong> {patientProfile.allergies}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'prescriptions'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          My Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          My Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'labs'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-4 h-4 mr-2" />
          Diagnostic Lab Reports ({labReports.length})
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'bills'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4 mr-2" />
          Invoices &amp; Payments ({invoices.length})
        </button>
      </div>

      {/* TAB CONTENT: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading your electronic medical prescriptions...
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
              <p className="font-bold text-slate-600">No Prescriptions Issued Yet</p>
              <p className="text-xs text-slate-400 mt-1">Prescriptions will appear here after clinical consultation with our doctors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map(rx => (
                <div key={rx.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono font-bold text-blue-600 text-sm">{rx.prescription_number}</span>
                      <div className="text-xs text-slate-400 flex items-center mt-0.5">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {rx.consultation_date}
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedRx(rx); setShowRxModal(true); }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      View &amp; Print
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Doctor: </span>
                      <strong className="text-slate-800">{rx.doctor_name}</strong> ({rx.doctor_department})
                    </div>
                    <div>
                      <span className="text-slate-400">Diagnosis: </span>
                      <span className="font-bold text-amber-700">{rx.diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Medications: </span>
                      <span className="text-slate-700">{rx.items?.length || 0} prescribed medications</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
              <p className="font-bold text-slate-600">No Consultation Appointments Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Doctor &amp; Dept</th>
                    <th className="py-3 px-4">Token #</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {appointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-semibold text-slate-800">{apt.appointment_date}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{apt.doctor_name}</div>
                        <div className="text-xs text-slate-400">{apt.doctor_department}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">#{apt.queue_token || '1'}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{apt.reason_for_visit}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: LAB REPORTS */}
      {activeTab === 'labs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading diagnostic reports...
            </div>
          ) : labReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
              <p className="font-bold text-slate-600">No Diagnostic Tests on Record</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Req #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Result / Findings</th>
                    <th className="py-3 px-4">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {labReports.map(lr => (
                    <tr key={lr.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{lr.request_number}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{new Date(lr.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{lr.test_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${lr.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {lr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-indigo-700">
                        {lr.result_value || 'Analyzing sample...'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">{lr.normal_range || 'Normal'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BILLING & INVOICES */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading financial statements...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-500" />
              <p className="font-bold text-slate-600">No Billing Invoices</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total Billed</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {invoices.map(inv => {
                    const balance = Math.max(0, parseFloat(inv.total_amount) - parseFloat(inv.paid_amount));
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">{inv.invoice_number}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">${parseFloat(inv.total_amount).toFixed(2)}</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">${parseFloat(inv.paid_amount).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${inv.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {inv.payment_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {balance > 0 && (
                            <button
                              onClick={() => handlePayInvoice(inv.id, balance)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Pay Now (${balance.toFixed(2)})
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Details
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
      )}

      {/* Prescription View Modal */}
      {showRxModal && selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <span className="font-bold text-slate-800">Prescription Details</span>
              <button onClick={() => setShowRxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-4 text-xs">
              <div className="flex justify-between">
                <div>
                  <div className="text-base font-bold text-blue-700">{selectedRx.prescription_number}</div>
                  <div className="text-slate-500">Date: {selectedRx.consultation_date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">{selectedRx.doctor_name}</div>
                  <div className="text-slate-400">{selectedRx.doctor_department}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div><strong>Diagnosis:</strong> <span className="text-slate-800">{selectedRx.diagnosis}</span></div>
                <div className="mt-1"><strong>Symptoms:</strong> <span className="text-slate-600">{selectedRx.symptoms}</span></div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-2">Prescribed Medicines:</div>
                <div className="space-y-1.5">
                  {selectedRx.items?.map((item, idx) => (
                    <div key={idx} className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between items-center">
                      <span className="font-bold text-slate-900">{item.medicine_name}</span>
                      <span className="text-blue-700">{item.dosage} &bull; {item.frequency} &bull; {item.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRx.lifestyle_advice && (
                <div className="text-slate-600 border-t pt-2">
                  <strong>Advice:</strong> {selectedRx.lifestyle_advice}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                Print Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-800">Invoice {selectedInvoice.invoice_number}</span>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between"><span>Doctor OPD Fee:</span> <strong>${parseFloat(selectedInvoice.consultation_fee).toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Bed Rent Charges:</span> <strong>${parseFloat(selectedInvoice.room_charges).toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Pharmacy Medicines:</span> <strong>${parseFloat(selectedInvoice.pharmacy_charges).toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Diagnostic Lab Tests:</span> <strong>${parseFloat(selectedInvoice.lab_charges).toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Discount Concession:</span> <strong className="text-emerald-700">-${parseFloat(selectedInvoice.discount).toFixed(2)}</strong></div>
              <div className="flex justify-between text-sm font-bold border-t pt-2 text-slate-900">
                <span>Total Amount:</span>
                <span className="text-rose-700 font-mono">${parseFloat(selectedInvoice.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Amount Paid:</span>
                <span className="font-mono">${parseFloat(selectedInvoice.paid_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecords;

