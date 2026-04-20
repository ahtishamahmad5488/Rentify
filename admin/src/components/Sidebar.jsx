import { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadAdminProfileImage } from '../api/adminApi';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/' },
  { icon: 'apartment', label: 'Properties', to: '/properties' },
  { icon: 'badge', label: 'Landlords', to: '/landlords' },
  { icon: 'calendar_month', label: 'Bookings', to: '/bookings' },
  { icon: 'payments', label: 'Payments', to: '/payments' },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  const openModal = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setShowProfile(true);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (user?.profileImage?.public_id) {
        formData.append('oldPublicId', user.profileImage.public_id);
      }
      const { data } = await uploadAdminProfileImage(formData);
      updateUser({ profileImage: data.data });
      showToast('Profile image updated!');
    } catch (err) {
      console.error('Upload error:', err.response?.status, err.response?.data || err.message);
      showToast('Image upload failed.');
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    setSaving(true);
    updateUser({ name: name.trim() || 'Admin', email: email.trim() });
    showToast('Profile updated!');
    setSaving(false);
    setShowProfile(false);
  };

  return (
    <>
      <aside
        className={`w-72 text-slate-300 flex flex-col fixed h-full z-40 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#1e293b' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">apartment</span>
          </div>
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold leading-none">Rentify</h1>
            <p className="text-xs text-slate-400 mt-1">Admin Portal</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive
                  ? 'active-nav flex items-center gap-3 px-3 py-2.5 rounded-lg text-white'
                  : 'flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer'
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-700/50">
            <div
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-rose-400"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </div>
          </div>
        </nav>

        {/* User Profile — clickable */}
        <div
          className="p-6 border-t border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
          onClick={openModal}
        >
          <div className="flex items-center gap-3">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              <div className="size-10 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400">person</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Admin</p>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-sm">edit</span>
          </div>
        </div>
      </aside>

      {/* Profile Edit Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  {user?.profileImage?.url ? (
                    <img
                      src={user.profileImage.url}
                      alt=""
                      className="size-24 rounded-full object-cover border-4 border-slate-100"
                    />
                  ) : (
                    <div className="size-24 rounded-full bg-slate-100 border-4 border-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageLoading}
                    className="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {imageLoading ? 'hourglass_empty' : 'photo_camera'}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                {imageLoading && (
                  <p className="text-xs text-slate-400">Uploading...</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Admin name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowProfile(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div className="fixed top-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium z-60">
              {toast}
            </div>
          )}
        </div>
      )}
    </>
  );
}
