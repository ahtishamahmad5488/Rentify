import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getAllPayments } from '../api/adminApi';

const statusStyle = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
};

const methodIcon = { CARD: 'credit_card', WALLET: 'account_balance_wallet', CASH: 'payments' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllPayments();
      const list = data?.data || [];
      setPayments(list);
      setFiltered(list);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = payments;
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.transactionId?.toLowerCase().includes(q) ||
          p.tenantUid?.toLowerCase().includes(q) ||
          p.booking?.property?.name?.toLowerCase().includes(q),
      );
    }
    setFiltered(list);
  }, [search, statusFilter, payments]);

  const totalRevenue = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Payments</h2>
        <p className="text-slate-500 mt-1 text-sm">All processed (simulated) payments from the mobile app.</p>
      </div>

      {/* Revenue Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Total Revenue (Demo)</p>
          <p className="text-3xl font-black mt-1">Rs. {totalRevenue.toLocaleString()}</p>
        </div>
        <span className="material-symbols-outlined text-5xl opacity-30">payments</span>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Total', count: payments.length, color: 'bg-slate-100 text-slate-700' },
          { label: 'Successful', count: payments.filter((p) => p.status === 'SUCCESS').length, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Pending', count: payments.filter((p) => p.status === 'PENDING').length, color: 'bg-amber-100 text-amber-700' },
          { label: 'Failed', count: payments.filter((p) => p.status === 'FAILED').length, color: 'bg-red-100 text-red-700' },
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
            placeholder="Search transaction ID, tenant or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 bg-slate-50 rounded-lg text-sm outline-none appearance-none min-w-40 focus:ring-2 focus:ring-indigo-300"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {['SUCCESS', 'PENDING', 'FAILED'].map((s) => (
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
            <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
            <p className="text-slate-400 text-sm">No payments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Transaction ID', 'Property', 'Tenant UID', 'Method', 'Amount (PKR)', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{p.transactionId}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">{p.booking?.property?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{p.booking?.property?.city || ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-500 font-mono">{p.tenantUid?.slice(0, 16)}…</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-slate-400 text-base">{methodIcon[p.method] || 'credit_card'}</span>
                        <span className="text-sm">{p.method}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold">{p.amount?.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[p.status] || 'bg-slate-100 text-slate-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
