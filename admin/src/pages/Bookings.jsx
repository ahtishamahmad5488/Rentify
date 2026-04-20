import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getAllBookings } from '../api/adminApi';

const statusStyle = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-sky-100 text-sky-800',
};

const payStyle = {
  UNPAID: 'bg-slate-100 text-slate-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllBookings();
      const list = data?.data || [];
      setBookings(list);
      setFiltered(list);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = bookings;
    if (statusFilter) list = list.filter((b) => b.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.tenantName?.toLowerCase().includes(q) ||
          b.tenantEmail?.toLowerCase().includes(q) ||
          b.property?.name?.toLowerCase().includes(q),
      );
    }
    setFiltered(list);
  }, [search, statusFilter, bookings]);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    paid: bookings.filter((b) => b.paymentStatus === 'PAID').length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Bookings</h2>
        <p className="text-slate-500 mt-1 text-sm">All property bookings made through the mobile app.</p>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Total', count: counts.all, color: 'bg-slate-100 text-slate-700' },
          { label: 'Pending', count: counts.pending, color: 'bg-amber-100 text-amber-700' },
          { label: 'Confirmed', count: counts.confirmed, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Paid', count: counts.paid, color: 'bg-sky-100 text-sky-700' },
        ].map((c) => (
          <div key={c.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${c.color}`}>
            <span>{c.label}</span>
            <span className="font-black">{c.count}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Search tenant name, email, property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300 appearance-none min-w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={load}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin size-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">calendar_today</span>
            <p className="text-slate-400 text-sm">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Tenant', 'Property', 'Check-In', 'Duration', 'Amount (PKR)', 'Status', 'Payment'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold">{b.tenantName || '—'}</p>
                      <p className="text-xs text-slate-400">{b.tenantEmail || b.tenantUid}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">{b.property?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{b.property?.city || ''}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm">{b.durationMonths} mo</td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold">{b.totalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[b.status] || 'bg-slate-100 text-slate-700'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${payStyle[b.paymentStatus] || 'bg-slate-100 text-slate-700'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
