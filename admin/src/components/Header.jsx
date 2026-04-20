import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const pageTitles = {
  '/': { title: 'Dashboard Overview', subtitle: null },
  '/hostels': { title: 'Hostel Listings', subtitle: 'Manage hostel submissions' },
  '/hostel-owners': { title: 'Hostel Owners', subtitle: 'Manage owner profiles' },
};

const typeIcon = {
  NEW_HOSTEL: { icon: 'add_business', color: 'text-amber-500 bg-amber-50' },
  HOSTEL_APPROVED: { icon: 'verified', color: 'text-emerald-500 bg-emerald-50' },
  HOSTEL_REJECTED: { icon: 'block', color: 'text-rose-500 bg-rose-50' },
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const raw = pageTitles[pathname] || { title: 'Dashboard', subtitle: '' };
  const page = {
    ...raw,
    subtitle: raw.subtitle === null ? `Welcome back, ${user?.name || 'Admin'}` : raw.subtitle,
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => socket.emit('join_admin'));
    socket.on('new_notification', (notif) => {
      setNotifications((prev) => [{ ...notif, id: Date.now(), read: false }, ...prev].slice(0, 20));
    });
    return () => socket.disconnect();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setOpen((prev) => !prev);
    if (!open) setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif) => {
    if (notif.hostelId) navigate(`/hostels/${notif.hostelId}`);
    setOpen(false);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">{page.title}</h2>
        {page.subtitle && (
          <div className="hidden sm:flex items-center gap-4">
            <div className="h-6 w-px bg-slate-200" />
            <p className="text-sm text-slate-500">{page.subtitle}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Notifications</p>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-slate-400 hover:text-primary cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">No notifications</div>
                ) : (
                  notifications.map((notif) => {
                    const ti = typeIcon[notif.type] || { icon: 'notifications', color: 'text-slate-500 bg-slate-50' };
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                      >
                        <span className={`material-symbols-outlined text-xl mt-0.5 p-1.5 rounded-lg shrink-0 ${ti.color}`}>
                          {ti.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.read && <span className="size-2 bg-primary rounded-full shrink-0 mt-1" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
