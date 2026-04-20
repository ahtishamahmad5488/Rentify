import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getAnalytics, getAllBookings, getAllPayments } from '../api/adminApi';

const periodOptions = ['This Week', 'This Month', 'This Year', 'All Time'];
const periodParamMap = {
  'This Week': 'week', 'This Month': 'month', 'This Year': 'year', 'All Time': 'all',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentOwners, setRecentOwners] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Year');
  const navigate = useNavigate();

  const fetchAnalytics = async (period, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setActivityLoading(true);
    try {
      const { data } = await getAnalytics(periodParamMap[period]);
      setStats(data.data.stats);
      setRecentProperties(data.data.recentHostels || []);
      setRecentOwners(data.data.recentOwners || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      if (isInitial) setLoading(false);
      else setActivityLoading(false);
    }
  };

  const fetchBookingPaymentCounts = async () => {
    try {
      const [bRes, pRes] = await Promise.all([getAllBookings(), getAllPayments()]);
      setBookingCount(bRes.data?.data?.length || 0);
      setPaymentCount(pRes.data?.data?.length || 0);
    } catch {
      // Non-critical — counts stay 0 if backend isn't seeded yet
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod, true);
    fetchBookingPaymentCounts();
  }, []);

  const handlePeriodChange = (opt) => {
    setSelectedPeriod(opt);
    setPeriodOpen(false);
    fetchAnalytics(opt);
  };

  const statCards = [
    {
      label: 'Total Properties',
      value: stats?.totalHostels ?? '—',
      icon: 'apartment',
      iconColor: 'text-indigo-500 bg-indigo-50',
      trend: `${stats?.approvedHostels ?? 0} approved`,
      trendLabel: 'currently active',
      trendUp: true,
    },
    {
      label: 'Pending Approval',
      value: (stats?.pendingHostels ?? 0) + (stats?.pendingReviewHostels ?? 0),
      valueColor: 'text-amber-600',
      icon: 'pending_actions',
      iconColor: 'text-amber-500 bg-amber-50',
      trend: 'Action required',
      trendLabel: '',
      trendIcon: 'priority_high',
      trendColor: 'text-amber-500',
    },
    {
      label: 'Landlords',
      value: stats?.totalOwners ?? '—',
      icon: 'person',
      iconColor: 'text-indigo-500 bg-indigo-50',
      trend: '',
      trendLabel: '',
    },
    {
      label: 'Total Bookings',
      value: bookingCount,
      icon: 'calendar_month',
      iconColor: 'text-emerald-500 bg-emerald-50',
      trend: '',
      trendLabel: '',
      onClick: () => navigate('/bookings'),
    },
    {
      label: 'Total Payments',
      value: paymentCount,
      icon: 'payments',
      iconColor: 'text-sky-500 bg-sky-50',
      trend: '',
      trendLabel: '',
      onClick: () => navigate('/payments'),
    },
  ];

  const total = stats?.totalHostels || 1;
  const approvedPct = Math.round(((stats?.approvedHostels || 0) / total) * 100);
  const pendingPct = Math.round(((stats?.pendingHostels || 0) / total) * 100);
  const rejectedPct = Math.round(((stats?.rejectedHostels || 0) / total) * 100);

  const statusLegend = [
    { color: 'bg-emerald-500', label: 'Approved', value: `${stats?.approvedHostels ?? 0} (${approvedPct}%)` },
    { color: 'bg-amber-500', label: 'Pending', value: `${stats?.pendingHostels ?? 0} (${pendingPct}%)` },
    { color: 'bg-rose-500', label: 'Rejected', value: `${stats?.rejectedHostels ?? 0} (${rejectedPct}%)` },
  ];

  const getStatusIcon = (status) => {
    const map = {
      PENDING: { icon: 'add_business', color: 'text-amber-500' },
      PENDING_REVIEW: { icon: 'rate_review', color: 'text-blue-500' },
      APPROVED: { icon: 'verified', color: 'text-emerald-500' },
      REJECTED: { icon: 'report_problem', color: 'text-rose-500' },
    };
    return map[status] || { icon: 'apartment', color: 'text-indigo-500' };
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin size-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Stat Cards — 5 across */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm ${card.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-semibold text-slate-500 leading-tight">{card.label}</p>
              <span className={`material-symbols-outlined text-lg p-1.5 rounded-lg ${card.iconColor}`}>
                {card.icon}
              </span>
            </div>
            <p className={`text-2xl font-black ${card.valueColor || 'text-slate-900'}`}>
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </p>
            {card.trend && (
              <p className={`text-[11px] mt-1 ${card.trendColor || 'text-emerald-500'} font-semibold`}>
                {card.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Property Status Breakdown */}
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Property Status</h3>
            <div className="relative">
              <button
                onClick={() => setPeriodOpen(!periodOpen)}
                className="text-xs text-slate-500 font-semibold flex items-center gap-1 cursor-pointer hover:text-slate-700"
              >
                {selectedPeriod}
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              {periodOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-36">
                  {periodOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handlePeriodChange(opt)}
                      className={`w-full text-left px-4 py-2 text-xs cursor-pointer hover:bg-slate-50 ${opt === selectedPeriod ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Donut Chart */}
          <div className="flex justify-center py-4">
            {(() => {
              const r = 80, cx = 100, cy = 100, stroke = 28;
              const circumference = 2 * Math.PI * r;
              const segments = [
                { pct: approvedPct, color: '#10b981' },
                { pct: pendingPct, color: '#f59e0b' },
                { pct: rejectedPct, color: '#f43f5e' },
              ];
              const usedPct = approvedPct + pendingPct + rejectedPct;
              if (usedPct < 100) segments.push({ pct: 100 - usedPct, color: '#e2e8f0' });
              let offset = 0;
              return (
                <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {segments.map((seg, i) => {
                      const dash = (seg.pct / 100) * circumference;
                      const gap = circumference - dash;
                      const rotate = (offset / 100) * 360 - 90;
                      offset += seg.pct;
                      return (
                        <circle
                          key={i} cx={cx} cy={cy} r={r}
                          fill="none" stroke={seg.color} strokeWidth={stroke}
                          strokeDasharray={`${dash} ${gap}`} strokeDashoffset={0}
                          transform={`rotate(${rotate} ${cx} ${cy})`}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute text-center pointer-events-none">
                    <p className="text-3xl font-black">{stats?.totalHostels?.toLocaleString() ?? '0'}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total</p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {statusLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                <div>
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                  <p className="text-xs font-bold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Recent Activity</h3>
            <button
              onClick={() => navigate('/properties')}
              className="text-sm text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-5">
            {recentProperties.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
            ) : (
              recentProperties.slice(0, 4).map((property, idx) => {
                const si = getStatusIcon(property.status);
                const isLast = idx === Math.min(3, recentProperties.length - 1);
                return (
                  <div key={property._id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className={`material-symbols-outlined ${si.color} text-lg`}>{si.icon}</span>
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-slate-100 mt-2" />}
                    </div>
                    <div className={`flex-1 ${!isLast ? 'pb-5' : ''}`}>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-900">
                          {property.status === 'PENDING' && 'New Property Submitted'}
                          {property.status === 'PENDING_REVIEW' && 'Property Updated — Re-review'}
                          {property.status === 'APPROVED' && 'Property Approved'}
                          {property.status === 'REJECTED' && 'Property Rejected'}
                        </p>
                        <span className="text-[11px] text-slate-400 ml-2 shrink-0">
                          {timeAgo(property.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        &quot;{property.name}&quot;{property.owner ? ` by ${property.owner.name}` : ''} · {property.city}
                      </p>
                      {(property.status === 'PENDING' || property.status === 'PENDING_REVIEW') && (
                        <button
                          onClick={() => navigate(`/properties/${property._id}`)}
                          className="mt-2 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
