import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getHostels, updateHostelStatus, getAnalytics } from '../api/adminApi';

const tabKeys = ['all', 'pending', 'approved', 'rejected'];
const tabLabels = ['All Listings', 'Pending Approval', 'Approved', 'Rejected'];
const tabStatusMap = { 0: '', 1: 'PENDING', 2: 'APPROVED', 3: 'REJECTED' };


const statusStyles = {
  PENDING: { style: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', label: 'Pending' },
  PENDING_REVIEW: { style: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500', label: 'Under Review' },
  APPROVED: { style: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', label: 'Approved' },
  REJECTED: { style: 'bg-red-100 text-red-800', dot: 'bg-red-500', label: 'Rejected' },
};

export default function HostelListings() {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [tabCounts, setTabCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (tabStatusMap[activeTab]) params.status = tabStatusMap[activeTab];
      if (search) params.search = search;
      if (city) params.city = city;
      const { data } = await getHostels(params);
      setHostels(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, [activeTab, page]);

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

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleTabChange = (idx) => {
    setActiveTab(idx);
    setPage(1);
  };

  const handleFilter = () => {
    setPage(1);
    fetchHostels();
  };

  const handleAction = async (action, hostelId) => {
    if (action === 'view') return navigate(`/hostels/${hostelId}`);
    if (action === 'approve') {
      try {
        await updateHostelStatus(hostelId, 'APPROVED');
        fetchHostels();
        fetchCounts();
      } catch (err) {
        console.error('Approve failed:', err);
      }
    }
    if (action === 'reject') {
      try {
        await updateHostelStatus(hostelId, 'REJECTED');
        fetchHostels();
        fetchCounts();
      } catch (err) {
        console.error('Reject failed:', err);
      }
    }
  };


  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hostel Listings</h2>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage and review hostel submissions across Pakistan.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
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
                  {tabCounts[tabKeys[i]]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search & City Filter */}
        <div className="p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Search Hostels
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none"
                placeholder="Search by hostel name, owner or ID..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              City
            </label>
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none outline-none"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          <button
            onClick={handleFilter}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm h-10.5 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-400 text-sm">Loading hostels...</p>
          </div>
        ) : hostels.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-400 text-sm">No hostels found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hostel Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type / Gender</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price (PKR)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hostels.map((hostel) => {
                const st = statusStyles[hostel.status] || statusStyles.PENDING;
                return (
                  <tr key={hostel._id} className="hover:bg-slate-50 transition-colors">
                    {/* Hostel Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {(hostel.images?.[0]?.url || hostel.images?.[0]?.secure_url) ? (
                            <img className="w-full h-full object-cover" src={hostel.images[0].url || hostel.images[0].secure_url} alt={hostel.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-slate-300">apartment</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{hostel.name}</p>
                          <p className="text-xs text-slate-400">ID: {hostel._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    {/* Owner */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{hostel.owner?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{hostel.owner?.email || ''}</p>
                    </td>
                    {/* City */}
                    <td className="px-6 py-4">
                      <span className="text-sm">{hostel.city}</span>
                    </td>
                    {/* Type / Gender */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded w-fit">{hostel.roomType}</span>
                        <span className={`text-xs font-semibold uppercase ${hostel.genderType === 'Girls' ? 'text-pink-500' : 'text-emerald-500'}`}>
                          {hostel.genderType}
                        </span>
                      </div>
                    </td>
                    {/* Price */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">
                        {hostel.pricePerMonth?.toLocaleString() ?? '—'}
                        <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
                      </p>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${st.style}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction('view', hostel._id)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleAction('approve', hostel._id)}
                          disabled={hostel.status === 'APPROVED'}
                          className={`p-2 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${hostel.status === 'APPROVED' ? 'text-green-500' : 'text-slate-400 hover:text-green-500'}`}
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </button>
                        <button
                          onClick={() => handleAction('reject', hostel._id)}
                          disabled={hostel.status === 'REJECTED'}
                          className={`p-2 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${hostel.status === 'REJECTED' ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                          title="Reject"
                        >
                          <span className="material-symbols-outlined text-[20px]">cancel</span>
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
        {!loading && hostels.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">
                {(page - 1) * 10 + 1}-{Math.min(page * 10, pagination.total)}
              </span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.total}</span> results
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
