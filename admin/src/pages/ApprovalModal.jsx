import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getHostelById, updateHostelStatus } from '../api/adminApi';

const navLinks = [
  { label: 'Dashboard', active: false, to: '/' },
  { label: 'Hostels', active: true, to: '/hostels' },
  { label: 'Verification', active: false, to: '#' },
  { label: 'Users', active: false, to: '#' },
];

const breadcrumbs = [
  { label: 'Dashboard', to: '/' },
  { label: 'Hostels', to: '/hostels' },
  { label: 'Hostel Details', to: null },
];

export default function ApprovalModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const { data } = await getHostelById(id);
        setHostel(data.data);
      } catch (err) {
        console.error('Failed to load hostel:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHostel();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await updateHostelStatus(id, 'APPROVED');
      navigate('/hostels');
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    try {
      await updateHostelStatus(id, 'REJECTED');
      navigate('/hostels');
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-display flex items-center justify-center">
        <p className="text-slate-400">Loading hostel...</p>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen bg-background-light font-display flex items-center justify-center">
        <p className="text-slate-400">Hostel not found.</p>
      </div>
    );
  }

  const owner = hostel.owner || {};
  const hostelInfo = [
    { label: 'Owner', value: owner.name || '—' },
    { label: 'Capacity', value: `${hostel.totalRooms ?? '—'} Rooms` },
    { label: 'Monthly Rent', value: `PKR ${hostel.pricePerMonth?.toLocaleString() ?? '—'}` },
  ];

  const statusMap = {
    PENDING: { label: 'Pending', style: 'bg-amber-100 text-amber-700' },
    PENDING_REVIEW: { label: 'Under Review', style: 'bg-blue-100 text-blue-700' },
    APPROVED: { label: 'Approved', style: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: 'Rejected', style: 'bg-red-100 text-red-700' },
  };
  const st = statusMap[hostel.status] || statusMap.PENDING;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light font-display text-slate-900">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-10 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-primary">
            <span className="material-symbols-outlined text-3xl">apartment</span>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">StayHub Admin</h2>
          </div>
          <nav className="hidden md:flex items-center gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={
                  link.active
                    ? 'text-primary text-sm font-semibold'
                    : 'text-slate-600 text-sm font-medium hover:text-primary transition-colors'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <div className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-200" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {i > 0 && <span className="material-symbols-outlined text-xs">chevron_right</span>}
              {crumb.to ? (
                <Link className="hover:text-primary" to={crumb.to}>{crumb.label}</Link>
              ) : (
                <span className="text-slate-900 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>

        {/* Title + Actions */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{hostel.name}</h1>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={!!actionLoading}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-60"
            >
              {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 shadow-sm cursor-pointer"
            >
              Approve Hostel
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
              {hostel.images?.[0]?.url ? (
                <img className="aspect-video w-full object-cover" src={hostel.images[0].url} alt={hostel.name} />
              ) : (
                <div className="aspect-video w-full bg-slate-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300">image</span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed">
                  {hostel.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Hostel Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4">Hostel Information</h3>
              <div className="space-y-4">
                {hostelInfo.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">{item.label}</span>
                    <span className="text-slate-900 font-medium text-sm">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Status</span>
                  <span className={`px-2 py-0.5 ${st.style} rounded text-xs font-bold uppercase tracking-wider`}>
                    {st.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4">Location</h3>
              <div className="h-40 rounded-lg bg-slate-200 overflow-hidden">
                <div className="w-full h-full bg-cover bg-center bg-slate-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-slate-400">map</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5">location_on</span>
                {hostel.fullAddress || `${hostel.area || ''}, ${hostel.city}`}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 text-center">
              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-primary text-3xl font-bold">verified</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Approve This Hostel?</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                This hostel will become publicly visible to students on the StayHub marketplace. The owner will be
                notified of your approval.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {actionLoading === 'approve' ? 'Approving...' : 'Confirm Approve'}
              </button>
            </div>

            {/* Audit Info */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xs text-slate-400">info</span>
              <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
                Logged as Admin Action
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
