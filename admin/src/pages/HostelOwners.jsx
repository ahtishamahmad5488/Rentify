import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getOwners, updateOwnerStatus } from '../api/adminApi';

const tabLabels = ['All Owners', 'Verified', 'Pending Verification', 'Suspended'];
const tabKeys = ['total', 'verified', 'pending', 'suspended'];
const tabStatusMap = { 0: '', 1: 'verified', 2: 'pending', 3: 'suspended' };

export default function HostelOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, suspended: 0, new: 0 });

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (tabStatusMap[activeTab]) params.status = tabStatusMap[activeTab];
      if (search) params.search = search;
      const { data } = await getOwners(params);
      setOwners(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [allRes, verifiedRes, pendingRes, suspendedRes] = await Promise.all([
        getOwners({ page: 1, limit: 1 }),
        getOwners({ page: 1, limit: 1, status: 'verified' }),
        getOwners({ page: 1, limit: 1, status: 'pending' }),
        getOwners({ page: 1, limit: 1, status: 'suspended' }),
      ]);
      setStats({
        total: allRes.data.pagination.total,
        verified: verifiedRes.data.pagination.total,
        pending: pendingRes.data.pagination.total,
        suspended: suspendedRes.data.pagination.total,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAction = async (action, ownerId) => {
    try {
      await updateOwnerStatus(ownerId, action);
      fetchOwners();
      fetchStats();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [activeTab, page]);

  const handleTabChange = (idx) => {
    setActiveTab(idx);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchOwners();
  };

  const getStatusStyle = (owner) => {
    if (!owner.isActive) return { style: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Suspended' };
    if (owner.isVerified) return { style: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Verified' };
    return { style: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Pending' };
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hostel Owners</h2>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage and verify hostel owner profiles across Pakistan.</p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex px-4 sm:px-6 gap-4 sm:gap-8 min-w-max">
            {tabLabels.map((tab, i) => (
              <button
                key={tab}
                onClick={() => handleTabChange(i)}
                className={`py-4 border-b-2 text-sm cursor-pointer flex items-center gap-2 ${
                  i === activeTab
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'
                }`}
              >
                {tab}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  i === activeTab
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {stats[tabKeys[i]]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none"
              placeholder="Search by name, email or CNIC..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-400 text-sm">Loading owners...</p>
          </div>
        ) : owners.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-400 text-sm">No owners found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-225">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CNIC / Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hostels</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {owners.map((owner) => {
                  const st = getStatusStyle(owner);
                  return (
                    <tr key={owner._id} className="hover:bg-slate-50 transition-colors">
                      {/* Owner Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            {(owner.profileImage?.url || owner.profileImage?.secure_url) ? (
                              <img className="w-full h-full object-cover" src={owner.profileImage.url || owner.profileImage.secure_url} alt={owner.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-300">person</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{owner.name}</p>
                            <p className="text-xs text-slate-400">{owner.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* CNIC / Contact */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{owner.cnic || '—'}</p>
                        <p className="text-xs text-slate-400">{owner.contactNumber || '—'}</p>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${st.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      {/* Hostels */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold">{owner.hostelCount ?? 0}</span>
                      </td>
                      {/* Joined */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {new Date(owner.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {/* Verify / Unverify */}
                          <button
                            onClick={() => handleAction(owner.isVerified ? 'unverify' : 'verify', owner._id)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${owner.isVerified ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                            title={owner.isVerified ? 'Unverify Owner' : 'Verify Owner'}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {owner.isVerified ? 'verified' : 'new_releases'}
                            </span>
                          </button>
                          {/* Suspend / Unsuspend */}
                          <button
                            onClick={() => handleAction(owner.isActive ? 'suspend' : 'unsuspend', owner._id)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${!owner.isActive ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                            title={owner.isActive ? 'Suspend Owner' : 'Unsuspend Owner'}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {owner.isActive ? 'block' : 'lock_open'}
                            </span>
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
        {!loading && owners.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">
                {(page - 1) * 10 + 1}-{Math.min(page * 10, pagination.total)}
              </span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.total.toLocaleString()}</span> results
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 text-sm border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
