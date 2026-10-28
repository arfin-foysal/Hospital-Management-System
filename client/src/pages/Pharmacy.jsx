import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  DollarSign, 
  Trash2, 
  Calendar, 
  Clock, 
  Printer, 
  X, 
  TrendingDown, 
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = ['All', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'IV Fluid'];

const Pharmacy = () => {
  const { isPharmacist, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'pos' | 'sales'
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Add Medicine Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [medForm, setMedForm] = useState({
    name: '',
    generic_name: '',
    category: 'Tablet',
    batch_number: '',
    unit_price: '',
    cost_price: '',
    stock_quantity: '',
    reorder_level: '20',
    expiry_date: '',
    manufacturer: '',
    rack_location: 'Rack A1'
  });

  // POS State
  const [posPatientId, setPosPatientId] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [completedSale, setCompletedSale] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMedicines();
    fetchPatients();
  }, [selectedCategory, showLowStockOnly]);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSales();
    }
  }, [activeTab]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (showLowStockOnly) params.low_stock = 'true';
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/pharmacy/medicines', { params });
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
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

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pharmacy/sales');
      setSales(res.data.data || []);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines();
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/pharmacy/medicines', medForm);
      setSuccessMsg('Medicine added to inventory successfully!');
      setShowAddModal(false);
      setMedForm({
        name: '',
        generic_name: '',
        category: 'Tablet',
        batch_number: '',
        unit_price: '',
        cost_price: '',
        stock_quantity: '',
        reorder_level: '20',
        expiry_date: '',
        manufacturer: '',
        rack_location: 'Rack A1'
      });
      fetchMedicines();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setSubmitting(false);
    }
  };

  // Cart operations
  const addToCart = (med) => {
    const existing = cart.find(item => item.id === med.id);
    if (existing) {
      if (existing.quantity >= med.stock_quantity) {
        alert('Cannot add more than available inventory!');
        return;
      }
      setCart(cart.map(item => item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (med.stock_quantity < 1) {
        alert('This medicine is out of stock!');
        return;
      }
      setCart([...cart, { ...med, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.stock_quantity) return item;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0);
  const cartTotal = Math.max(0, cartSubtotal - parseFloat(discount || 0));

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        patient_id: posPatientId ? parseInt(posPatientId) : null,
        items: cart.map(item => ({
          medicine_id: item.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price)
        })),
        payment_method: paymentMethod,
        discount: parseFloat(discount || 0),
        tax_amount: 0
      };

      const res = await api.post('/pharmacy/dispense', payload);
      setCompletedSale(res.data.sale);
      setShowReceiptModal(true);
      setCart([]);
      setPosPatientId('');
      setDiscount(0);
      setSuccessMsg('Medicines dispensed & stock deducted successfully!');
      fetchMedicines();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to process sale');
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockCount = medicines.filter(m => m.is_low_stock).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pharmacy &amp; Inventory</h1>
            <p className="text-sm text-slate-500">Batch stock tracking, automatic POS dispensing &amp; low-inventory safeguards</p>
          </div>
        </div>

        {/* Tab Switcher & Action */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'inventory' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center ${activeTab === 'pos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              POS Dispense
              {cart.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px]">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'sales' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sales Log
            </button>
          </div>

          {(isPharmacist || isAdmin) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Medicine
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

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters & Low Stock Warning */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, generic, batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </form>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Low stock toggle */}
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                showLowStockOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
              Low Stock Alerts ({lowStockCount})
            </button>
          </div>

          {/* Medicines Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading inventory...
              </div>
            ) : medicines.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-500" />
                <p className="text-base font-semibold text-slate-600">No Medicines Found</p>
                <p className="text-xs text-slate-400 mt-1">Add new medicines to your pharmacy inventory.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Medicine &amp; Generic</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Batch #</th>
                      <th className="py-3.5 px-4">Expiry Date</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Rack</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {medicines.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{m.name}</div>
                          <div className="text-xs text-slate-400">{m.generic_name}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {m.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                          {m.batch_number}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className={m.is_expiring_soon ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                            {m.expiry_date}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className={`font-bold ${m.stock_quantity <= m.reorder_level ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {m.stock_quantity}
                            </span>
                            {m.stock_quantity <= m.reorder_level && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700 uppercase">
                                Low
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">Reorder at {m.reorder_level}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          ${parseFloat(m.unit_price).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                          {m.rack_location || 'Main Store'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              addToCart(m);
                              setActiveTab('pos');
                            }}
                            disabled={m.stock_quantity <= 0}
                            className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Dispense
                          </button>
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

      {/* TAB 2: POS DISPENSING COUNTER */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Medicine Picker */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Type to filter inventory for POS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medicines
                  .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(med => (
                    <div 
                      key={med.id}
                      onClick={() => med.stock_quantity > 0 && addToCart(med)}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${med.stock_quantity > 0 ? 'bg-white hover:border-blue-400 hover:shadow-md cursor-pointer border-slate-200' : 'bg-slate-50 opacity-60 border-slate-200 cursor-not-allowed'}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 text-sm">{med.name}</span>
                          <span className="text-xs font-bold text-blue-600">${parseFloat(med.unit_price).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{med.generic_name} ({med.category})</div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Stock: <strong className={med.stock_quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>{med.stock_quantity}</strong></span>
                        <span className="text-slate-400 text-[10px]">Exp: {med.expiry_date}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Col: Dispensing Cart Checkout */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                  Dispensing Cart
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {cart.length} items
                </span>
              </div>

              {/* Patient Selector */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Patient (Optional)
                </label>
                <select
                  value={posPatientId}
                  onChange={(e) => setPosPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Walk-in Customer / OTC --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patient_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Cart is empty. Click medicines on the left to add.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex-1 mr-2">
                        <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                        <div className="text-slate-400 text-[10px]">${item.unit_price} each</div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-5 h-5 bg-white border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-5 h-5 bg-white border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-100"
                        >
                          +
                        </button>
                        <span className="font-bold text-slate-800 w-12 text-right">
                          ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-rose-500 hover:text-rose-700 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Billing Calculation & Payment */}
            <div className="border-t border-slate-200 pt-3 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount ($):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-20 px-2 py-1 text-right border border-slate-200 rounded text-xs"
                  />
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-2">
                  <span>Net Total:</span>
                  <span className="text-emerald-700 font-mono text-base">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {['Cash', 'Card', 'Online'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition ${paymentMethod === method ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dispense Button */}
              <button
                type="button"
                onClick={handleCompleteSale}
                disabled={submitting || cart.length === 0}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-emerald-500/10 disabled:opacity-40 cursor-pointer"
              >
                {submitting ? 'Processing...' : `Confirm & Dispense ($${cartTotal.toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALES HISTORY */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading sales history...
            </div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-500" />
              <p className="text-base font-semibold text-slate-600">No Sales Records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Items Count</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{s.invoice_number}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(s.sale_date).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{s.patient_name || 'Walk-in OTC'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{s.items?.length || 0} medicines</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${parseFloat(s.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Pill className="w-5 h-5 mr-2 text-amber-600" />
                Add Medicine to Inventory
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol 500mg"
                    value={medForm.name}
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acetaminophen"
                    value={medForm.generic_name}
                    onChange={(e) => setMedForm({ ...medForm, generic_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={medForm.category}
                    onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="BATCH-2026-X"
                    value={medForm.batch_number}
                    onChange={(e) => setMedForm({ ...medForm, batch_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Selling Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5.00"
                    value={medForm.unit_price}
                    onChange={(e) => setMedForm({ ...medForm, unit_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="3.20"
                    value={medForm.cost_price}
                    onChange={(e) => setMedForm({ ...medForm, cost_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={medForm.stock_quantity}
                    onChange={(e) => setMedForm({ ...medForm, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reorder Level Alert</label>
                  <input
                    type="number"
                    value={medForm.reorder_level}
                    onChange={(e) => setMedForm({ ...medForm, reorder_level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={medForm.expiry_date}
                    onChange={(e) => setMedForm({ ...medForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rack / Storage Location</label>
                  <input
                    type="text"
                    placeholder="Rack A-04"
                    value={medForm.rack_location}
                    onChange={(e) => setMedForm({ ...medForm, rack_location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POS Receipt Modal */}
      {showReceiptModal && completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 my-8">
            <div className="text-center border-b border-dashed border-slate-300 pb-4">
              <h3 className="font-black text-xl text-slate-900">CareSync Pharmacy</h3>
              <p className="text-xs text-slate-500">Official Pharmacy Dispensation Receipt</p>
              <div className="text-xs font-mono font-bold mt-2 text-blue-600">{completedSale.invoice_number}</div>
              <div className="text-[10px] text-slate-400">{new Date(completedSale.sale_date).toLocaleString()}</div>
            </div>

            <div className="py-4 border-b border-dashed border-slate-300 space-y-2 text-xs">
              {completedSale.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800">{item.medicine_name}</span>
                    <span className="text-slate-400 text-[10px] ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-mono font-bold">${parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="py-3 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>Total Paid ({completedSale.payment_method}):</span>
                <span className="text-emerald-700 font-mono">${parseFloat(completedSale.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print Receipt
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;

