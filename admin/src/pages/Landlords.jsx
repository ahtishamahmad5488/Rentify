import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getLandlords, updateLandlordStatus } from '../api/adminApi';

const tabLabels = ['All Landlords', 'Verified', 'Pending Verification', 'Suspended'];
const tabKeys = ['total', 'verified', 'pending', 'suspended'];
const tabStatusMap = { 0: '', 1: 'verified', 2: 'pending', 3: 'suspended' };

export default function Landlords() {
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, suspended: 0 });

  const fetchLandlords = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (tabStatusMap[activeTab]) params.status = tabStatusMap[activeTab];
      if (search) params.search = search;
      const { data } = await getLandlords(params);
      setLandlords(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load landlords:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [allRes, verifiedRes, pendingRes, suspendedRes] = await Promise.all([
        getLandlords({ page: 1, limit: 1 }),
        getLandlords({ page: 1, limit: 1, status: 'verified' }),
        getLandlords({ page: 1, limit: 1, status: 'pending' }),
        getLandlords({ page: 1, limit: 1, status: 'suspended' }),
      ]);
      setStats({
        total: allRes.data.pagination.total,
        verified: verifiedRes.data.pagination.total,
        pending: pendingRes.data.pagination.total,
        suspended: suspendedRes.data.pagination.total,
      });
    } catch (err) {
      console.error('Stats failed:', err);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchLandlords(); }, [activeTab, page]);

  const handleAction = async (action, id) => {
    try {
      await updateLandlordStatus(id, action);
      fetchLandlords();
      fetchStats();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const getStatusStyle = (owner) => {
    if (!owner.isActive) return { style: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Suspended' };
    if (owner.isVerified) return { style: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Verified' };
    return { style: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Pending' };
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Landlords</h2>
        <p className="text-slate-500 mt-1 text-sm">Manage and verify property landlord accounts.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
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
                  {stats[tabKeys[i]]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-5">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Search by name, email or CNIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLandlords()}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin size-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div>
        ) : landlords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">person_off</span>
            <p className="text-slate-400 text-sm">No landlords found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  {['Landlord', 'CNIC / Contact', 'Status', 'Properties', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {landlords.map((owner) => {
                  const st = getStatusStyle(owner);
                  const avatar = owner.profileImage?.url || owner.profileImage?.secure_url;
                  return (
                    <tr key={owner._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            {avatar ? (
                              <img className="w-full h-full object-cover" src={avatar} alt={owner.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-300 text-base">person</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{owner.name}</p>
                            <p className="text-xs text-slate-400">{owner.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm">{owner.cnic || '—'}</p>
                        <p className="text-xs text-slate-400">{owner.contactNumber || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold ${st.style}`}>
                          <span className={`size-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold">{owner.hostelCount ?? 0}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(owner.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleAction(owner.isVerified ? 'unverify' : 'verify', owner._id)}
                            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${owner.isVerified ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                            title={owner.isVerified ? 'Unverify' : 'Verify'}
                          >
                            <span className="material-symbols-outlined text-[18px]">{owner.isVerified ? 'verified' : 'new_releases'}</span>
                          </button>
                          <button
                            onClick={() => handleAction(owner.isActive ? 'suspend' : 'unsuspend', owner._id)}
                            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${!owner.isActive ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                            title={owner.isActive ? 'Suspend' : 'Unsuspend'}
                          >
                            <span className="material-symbols-outlined text-[18px]">{owner.isActive ? 'block' : 'lock_open'}</span>
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

        {!loading && landlords.length > 0 && (
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
