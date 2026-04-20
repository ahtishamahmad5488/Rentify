import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getProperties, updatePropertyStatus, getAnalytics } from '../api/adminApi';

const tabKeys = ['all', 'pending', 'approved', 'rejected'];
const tabLabels = ['All Properties', 'Pending Approval', 'Approved', 'Rejected'];
const tabStatusMap = { 0: '', 1: 'PENDING', 2: 'APPROVED', 3: 'REJECTED' };

const statusStyles = {
  PENDING: { style: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500', label: 'Pending' },
  PENDING_REVIEW: { style: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500', label: 'Under Review' },
  APPROVED: { style: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', label: 'Approved' },
  REJECTED: { style: 'bg-red-100 text-red-800', dot: 'bg-red-500', label: 'Rejected' },
};

export default function PropertyListings() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [tabCounts, setTabCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (tabStatusMap[activeTab]) params.status = tabStatusMap[activeTab];
      if (search) params.search = search;
      if (city) params.city = city;
      const { data } = await getProperties(params);
      setProperties(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const { data } = await getAnalytics();
      const s = data.data.stats;
      setTabCounts({
        all: s.totalHostels || 0,
        pending: (s.pendingHostels || 0) + (s.pendingReviewHostels || 0),
        approved: s.approvedHostels || 0,
        rejected: s.rejectedHostels || 0,
      });
    } catch (err) {
      console.error('Failed to load tab counts:', err);
    }
  };

  useEffect(() => { fetchCounts(); }, []);
  useEffect(() => { fetchProperties(); }, [activeTab, page]);

  const handleAction = async (action, id) => {
    if (action === 'view') return navigate(`/properties/${id}`);
    try {
      await updatePropertyStatus(id, action === 'approve' ? 'APPROVED' : 'REJECTED');
      fetchProperties();
      fetchCounts();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Property Listings</h2>
        <p className="text-slate-500 mt-1 text-sm">Manage and review property submissions across Pakistan.</p>
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex px-4 sm:px-6 gap-4 sm:gap-8 min-w-max">
            {tabLabels.map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(i); setPage(1); }}
                className={`py-4 border-b-2 text-sm cursor-pointer flex items-center gap-2 ${
                  i === activeTab
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'
                }`}
              >
                {tab}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  i === activeTab ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tabCounts[tabKeys[i]]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Search Properties
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Search by name, owner or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProperties()}
              />
            </div>
          </div>

          <div className="w-full md:w-56">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-300"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Quetta'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          <button
            onClick={() => { setPage(1); fetchProperties(); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 cursor-pointer shrink-0 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin size-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">apartment</span>
            <p className="text-slate-400 text-sm">No properties found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Property', 'Landlord', 'City', 'Type', 'Price (PKR)', 'Status', 'Actions'].map((h) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => {
                  const st = statusStyles[p.status] || statusStyles.PENDING;
                  const img = p.images?.[0]?.url || p.images?.[0]?.secure_url;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            {img ? (
                              <img className="w-full h-full object-cover" src={img} alt={p.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-300 text-base">apartment</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{p.name}</p>
                            <p className="text-xs text-slate-400">#{p._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium">{p.owner?.name || '—'}</p>
                        <p className="text-xs text-slate-400">{p.owner?.email || ''}</p>
                      </td>
                      <td className="px-5 py-4 text-sm">{p.city}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{p.roomType}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold">{p.pricePerMonth?.toLocaleString() ?? '—'}<span className="text-xs font-normal text-slate-400 ml-1">/mo</span></p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold ${st.style}`}>
                          <span className={`size-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleAction('view', p._id)} className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer rounded-lg hover:bg-indigo-50" title="View">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button onClick={() => handleAction('approve', p._id)} disabled={p.status === 'APPROVED'} className="p-1.5 text-slate-400 hover:text-emerald-600 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-emerald-50" title="Approve">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          </button>
                          <button onClick={() => handleAction('reject', p._id)} disabled={p.status === 'REJECTED'} className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-red-50" title="Reject">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && properties.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-slate-500">
              {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} of{' '}
              <span className="font-bold text-slate-700">{pagination.total}</span>
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
