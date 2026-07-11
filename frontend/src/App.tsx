import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VehicleListing from './pages/VehicleListing';
import VehicleDetails from './pages/VehicleDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vehicles" element={<VehicleListing />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />

            {/* Protected User Pages */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Pages */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-vehicle"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AddVehicle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-vehicle/:id"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <EditVehicle />
                </ProtectedRoute>
              }
            />

            {/* Fallback 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
