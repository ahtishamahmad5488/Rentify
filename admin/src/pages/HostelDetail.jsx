import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPropertyById, updatePropertyStatus } from '../api/adminApi';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await getPropertyById(id);
        setProperty(data.data);
      } catch (err) {
        console.error('Failed to load property:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleStatusChange = async (status) => {
    setActionLoading(status);
    try {
      await updatePropertyStatus(id, status);
      setProperty((prev) => ({ ...prev, status }));
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setActionLoading('');
    }
  };

  const statusBadge = {
    PENDING: { bg: 'bg-amber-100 text-amber-700', icon: 'pending', label: 'Pending Approval' },
    PENDING_REVIEW: { bg: 'bg-blue-100 text-blue-700', icon: 'rate_review', label: 'Pending Review' },
    APPROVED: { bg: 'bg-emerald-100 text-emerald-700', icon: 'verified', label: 'Approved' },
    REJECTED: { bg: 'bg-red-100 text-red-700', icon: 'block', label: 'Rejected' },
  };

  if (loading) {
    return (
      <div className="bg-background-light font-display text-slate-900 min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-background-light font-display text-slate-900 min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Property not found.</p>
      </div>
    );
  }

  const badge = statusBadge[property.status] || statusBadge.PENDING;
  const owner = property.owner || {};
  const images = property.images || [];
  const mainImg = images[0]?.secure_url || images[0]?.url || '';
  const thumbImgs = images.slice(1, 4);
  const extraCount = Math.max(0, images.length - 4);

  const ownerInfo = [
    { label: 'Full Name', value: owner.name || '—' },
    { label: 'Email Address', value: owner.email || '—' },
    { label: 'Phone Number', value: owner.phone || '—' },
    { label: 'CNIC Number', value: owner.cnic || '—', hasToggle: true },
  ];

  const facilities = (property.facilities || []).map((f) => {
    const iconMap = {
      wifi: 'wifi', security: 'security', mess: 'restaurant', laundry: 'local_laundry_service',
      ac: 'ac_unit', generator: 'electric_bolt', parking: 'local_parking', gym: 'fitness_center',
      library: 'local_library', cctv: 'videocam',
    };
    const key = f.toLowerCase().replace(/[\s-]/g, '');
    return { icon: iconMap[key] || 'check_circle', label: f };
  });

  const isPending = property.status === 'PENDING' || property.status === 'PENDING_REVIEW';

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen">
      {/* Top Navbar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-10 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base">apartment</span>
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">Rentify</h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="hidden sm:flex items-center gap-6 sm:gap-9">
            <Link className="text-slate-700 text-sm font-medium hover:text-primary transition-colors" to="/">Dashboard</Link>
            <Link className="text-sm font-bold border-b-2 border-primary pb-1" to="/properties">Properties</Link>
            <Link className="text-slate-700 text-sm font-medium hover:text-primary transition-colors" to="/landlords">Landlords</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 sm:px-10 py-4 sm:py-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link className="text-slate-500 text-sm flex items-center gap-1 hover:text-primary transition-colors" to="/properties">
              <span className="material-symbols-outlined text-sm">home</span> Properties
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 text-sm font-semibold">Property Detail</span>
          </div>

          {/* Title + Back Button */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-slate-900 text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                  {property.title}
                </h1>
                <span className={`px-3 py-1 rounded-full ${badge.bg} text-xs font-bold flex items-center gap-1 uppercase tracking-wider`}>
                  <span className="material-symbols-outlined text-xs">{badge.icon}</span> {badge.label}
                </span>
              </div>
              <p className="text-slate-500 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">location_on</span>
                {property.address || `${property.area || ''}, ${property.city}`}
              </p>
            </div>
            <button
              onClick={() => navigate('/properties')}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-white border border-slate-200 text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span> Back to List
            </button>
          </div>

          {/* Grid: Left (Images + Description) | Right (Owner + Details) */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
              {/* Image Gallery */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 h-80 bg-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {mainImg ? (
                    <img className="w-full h-full object-cover" src={mainImg} alt={property.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-slate-300">image</span>
                    </div>
                  )}
                </div>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-40 bg-slate-200 rounded-xl overflow-hidden shadow-sm relative ${
                      i === 2 && extraCount > 0 ? 'group cursor-pointer' : ''
                    }`}
                  >
                    {(thumbImgs[i]?.secure_url || thumbImgs[i]?.url) ? (
                      <img
                        className={`w-full h-full object-cover ${i === 2 && extraCount > 0 ? 'opacity-80' : ''}`}
                        src={thumbImgs[i].secure_url || thumbImgs[i].url}
                        alt=""
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
                      </div>
                    )}
                    {i === 2 && extraCount > 0 && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">+{extraCount} More</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Description + Facilities */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">description</span> Description
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {property.description || 'No description provided.'}
                </p>
                {facilities.length > 0 && (
                  <>
                    <h3 className="text-lg font-bold mb-4">Facilities &amp; Amenities</h3>
                    <div className="flex flex-wrap gap-3">
                      {facilities.map((f) => (
                        <span
                          key={f.label}
                          className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm font-semibold flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">{f.icon}</span> {f.label}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
              {/* Owner Info */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">person</span> Landlord Info
                </h3>
                <div className="space-y-4">
                  {ownerInfo.map((item) => (
                    <div key={item.label} className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-900 font-medium">{item.value}</p>
                        {item.hasToggle && (
                          <button className="hover:text-primary/80 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">info</span> Property Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">City</span>
                      <p className="text-slate-900 font-medium">{property.city}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Price / Month</span>
                      <p className="text-slate-900 font-medium">PKR {property.price?.toLocaleString() ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Address</span>
                    <p className="text-slate-900 font-medium">{property.address || '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Available Rooms</span>
                      <p className="text-slate-900 font-medium">{property.availableRooms ?? '—'} / {property.totalRooms ?? '—'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Gender / Type</span>
                      <p className="text-slate-900 font-medium">{property.genderType} / {property.propertyType}</p>
                    </div>
                  </div>
                </div>
                {/* Map */}
                {(() => {
                  const coords = property.location?.coordinates;
                  const lng = coords?.[0];
                  const lat = coords?.[1];
                  const hasCoords = lat != null && lng != null;
                  const googleMapsUrl = hasCoords
                    ? `https://www.google.com/maps?q=${lat},${lng}`
                    : `https://www.google.com/maps/search/${encodeURIComponent(property.address || property.city)}`;
                  const embedUrl = hasCoords
                    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
                    : null;

                  return (
                    <div className="mt-6 rounded-lg overflow-hidden h-48 border border-slate-200 relative group">
                      {embedUrl ? (
                        <>
                          <iframe
                            src={embedUrl}
                            className="w-full h-full border-none"
                            title="Property Location"
                          />
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1 hover:bg-primary hover:text-white transition-colors">
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                              Open in Google Maps
                            </span>
                          </a>
                        </>
                      ) : (
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-3xl text-slate-400">location_off</span>
                          <span className="text-xs text-slate-500 font-medium">No coordinates — Search on Google Maps</span>
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      {isPending && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 sm:px-10 py-3 sm:py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <p className="text-sm text-slate-600">
                Submitted on{' '}
                <span className="font-bold">
                  {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                disabled={!!actionLoading}
                onClick={() => handleStatusChange('REJECTED')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-35 h-10 sm:h-12 px-4 sm:px-6 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-md shadow-red-500/20 cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-lg">block</span>
                {actionLoading === 'REJECTED' ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                disabled={!!actionLoading}
                onClick={() => handleStatusChange('APPROVED')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-35 h-10 sm:h-12 px-4 sm:px-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {actionLoading === 'APPROVED' ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
