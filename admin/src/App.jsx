import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PropertyListings from './pages/PropertyListings';
import Landlords from './pages/Landlords';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
// Legacy detail/modal pages — still use the old hostel routes from backend
import HostelDetail from './pages/HostelDetail';
import ApprovalModal from './pages/ApprovalModal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Property detail — now under /properties/:id */}
          <Route path="/properties/:id" element={<ProtectedRoute><HostelDetail /></ProtectedRoute>} />
          <Route path="/properties/:id/approve" element={<ProtectedRoute><ApprovalModal /></ProtectedRoute>} />

          {/* Legacy hostel routes kept so old bookmarked URLs still work */}
          <Route path="/hostels/:id" element={<ProtectedRoute><HostelDetail /></ProtectedRoute>} />
          <Route path="/hostels/:id/approve" element={<ProtectedRoute><ApprovalModal /></ProtectedRoute>} />

          {/* Dashboard pages */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><PropertyListings /></ProtectedRoute>} />
          <Route path="/landlords" element={<ProtectedRoute><Landlords /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />

          {/* Legacy aliases so old sidebar links don't 404 during transition */}
          <Route path="/hostels" element={<ProtectedRoute><PropertyListings /></ProtectedRoute>} />
          <Route path="/hostel-owners" element={<ProtectedRoute><Landlords /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
