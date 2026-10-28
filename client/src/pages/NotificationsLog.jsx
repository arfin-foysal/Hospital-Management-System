import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Search, 
  CheckCircle, 
  MessageSquare, 
  Phone, 
  Clock, 
  ShieldCheck, 
  X
} from 'lucide-react';
import api from '../services/api';

const NotificationsLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  // Send Custom SMS Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    recipient_name: '',
    recipient_phone: '',
    event_type: 'Emergency_Alert',
    channel: 'SMS',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [channelFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (channelFilter) params.channel = channelFilter;
      const res = await api.get('/notifications/logs', { params });
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Error fetching notification logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/notifications/send', sendForm);
      setSuccessMsg('SMS notification queued and dispatched via carrier gateway!');
      setShowSendModal(false);
      setSendForm({
        recipient_name: '',
        recipient_phone: '',
        event_type: 'Emergency_Alert',
        channel: 'SMS',
        message: ''
      });
      fetchLogs();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(l =>
    l.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.recipient_phone.includes(searchTerm) ||
    l.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notification &amp; SMS Gateway Service</h1>
            <p className="text-sm text-slate-500">Automated patient alerts, appointment reminders, emergency broadcasts &amp; carrier logs</p>
          </div>
        </div>

        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-indigo-500/10 cursor-pointer"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Instant SMS Alert
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Search & Channel Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search recipient, phone, SMS text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex space-x-2 text-xs font-semibold">
          {['', 'SMS', 'WhatsApp', 'Email'].map(ch => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                channelFilter === ch ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ch || 'All Channels'}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading transmission logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
            <p className="font-bold text-slate-600">No Notifications Sent</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Event Trigger</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Message Dispatched</th>
                  <th className="py-3 px-4">Carrier Gateway</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                      {new Date(l.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{l.recipient_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{l.recipient_phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {l.event_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-600">
                      {l.channel}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 max-w-sm">
                      {l.message}
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono text-slate-400">
                      {l.gateway_response}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send Custom SMS Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Send className="w-5 h-5 mr-2 text-indigo-600" />
                Dispatch Custom SMS / Alert
              </h3>
              <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur / Patient"
                  value={sendForm.recipient_name}
                  onChange={(e) => setSendForm({ ...sendForm, recipient_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Recipient Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1711 000000"
                  value={sendForm.recipient_phone}
                  onChange={(e) => setSendForm({ ...sendForm, recipient_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alert Category</label>
                  <select
                    value={sendForm.event_type}
                    onChange={(e) => setSendForm({ ...sendForm, event_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="Emergency_Alert">Emergency Alert</option>
                    <option value="Appointment_Confirmed">Appointment Reminder</option>
                    <option value="Lab_Report_Ready">Lab Report Ready</option>
                    <option value="Blood_Request">Blood Bank Stat Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Carrier Channel</label>
                  <select
                    value={sendForm.channel}
                    onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="SMS">Direct GSM SMS</option>
                    <option value="WhatsApp">WhatsApp Business API</option>
                    <option value="Email">Secure Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SMS Message Content *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Type message here..."
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {submitting ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsLog;

