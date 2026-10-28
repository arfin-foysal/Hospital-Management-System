import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  Pill, 
  FlaskConical, 
  CreditCard, 
  User, 
  CheckCircle, 
  X, 
  ShieldAlert, 
  Phone, 
  Mail,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const roleList = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' },
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-blue-600 bg-blue-50' },
  { value: 'receptionist', label: 'Receptionist', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'pharmacist', label: 'Pharmacist', icon: Pill, color: 'text-amber-600 bg-amber-50' },
  { value: 'lab_technician', label: 'Lab Tech', icon: FlaskConical, color: 'text-indigo-600 bg-indigo-50' },
  { value: 'accountant', label: 'Accountant', icon: CreditCard, color: 'text-rose-600 bg-rose-50' },
  { value: 'patient', label: 'Patient', icon: User, color: 'text-teal-600 bg-teal-50' },
];

const UsersManagement = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    phone: '',
    address: '',
    doctor: {
      specialization: 'Internal Medicine',
      department: 'General Medicine',
      qualification: 'MBBS, MD',
      consultation_fee: '50.00',
      room_no: 'Room 201'
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user.id}/toggle-status`);
      setSuccessMsg(`Status for ${user.name} updated successfully!`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        phone: userForm.phone,
        address: userForm.address,
        doctor: userForm.role === 'doctor' ? userForm.doctor : undefined
      };

      await api.post('/users', payload);
      setSuccessMsg(`Staff account for ${userForm.name} (${userForm.role}) created successfully!`);
      setShowAddModal(false);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'doctor',
        phone: '',
        address: '',
        doctor: {
          specialization: 'Internal Medicine',
          department: 'General Medicine',
          qualification: 'MBBS, MD',
          consultation_fee: '50.00',
          room_no: 'Room 201'
        }
      });
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Accounts &amp; RBAC Control</h1>
            <p className="text-sm text-slate-500">Manage hospital staff credentials, clinical role delegations &amp; system access privileges</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-purple-500/10 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff Account
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

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {roleList.map(r => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition cursor-pointer ${
                roleFilter === r.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading system accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-500" />
            <p className="text-base font-semibold text-slate-600">No User Accounts Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Department / Info</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => {
                  const roleConfig = roleList.find(r => r.value === u.role) || { label: u.role, color: 'text-slate-600 bg-slate-100' };
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{u.name}</div>
                        <div className="text-xs text-slate-400">ID #{u.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${roleConfig.color}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {u.phone || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {u.doctors ? `${u.doctors.department} (${u.doctors.specialization})` : u.patients ? `Patient: ${u.patients.patient_id}` : '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            u.is_active
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
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

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-purple-600" />
                Register New Hospital Staff Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr. Robert Chen"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">System Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="lab_technician">Lab Technician</option>
                    <option value="accountant">Accountant</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address (Login) *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 555-019-3322"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Address</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={userForm.address}
                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Conditional Doctor profile inputs */}
              {userForm.role === 'doctor' && (
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-blue-800 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-1.5" />
                    Doctor Clinical Profile Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Specialization</label>
                      <input
                        type="text"
                        value={userForm.doctor.specialization}
                        onChange={(e) => setUserForm({
                          ...userForm,
                          doctor: { ...userForm.doctor, specialization: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Department</label>
                      <input
                        type="text"
                        value={userForm.doctor.department}
                        onChange={(e) => setUserForm({
                          ...userForm,
                          doctor: { ...userForm.doctor, department: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Qualifications</label>
                      <input
                        type="text"
                        value={userForm.doctor.qualification}
                        onChange={(e) => setUserForm({
                          ...userForm,
                          doctor: { ...userForm.doctor, qualification: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Consultation Fee ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={userForm.doctor.consultation_fee}
                        onChange={(e) => setUserForm({
                          ...userForm,
                          doctor: { ...userForm.doctor, consultation_fee: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;

