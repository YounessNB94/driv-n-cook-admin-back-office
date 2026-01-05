import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ProfilePage from '../pages/Profile/ProfilePage';
import LoginPage from '../pages/Auth/LoginPage';
import FranchiseesPage from '../pages/Franchisees/FranchiseesPage';
import FranchiseeDetailPage from '../pages/Franchisees/FranchiseeDetailPage';
import FranchiseeApplicationsPage from '../pages/FranchiseApplications/FranchiseeApplicationsPage';
import FranchiseeApplicationDetailPage from '../pages/FranchiseApplications/FranchiseeApplicationDetailPage';
import TrucksPage from '../pages/Trucks/TrucksPage';
import AdminSupplyOrdersPage from '../pages/SupplyOrders/AdminSupplyOrdersPage';
import AdminAppointmentsPage from '../pages/Appointments/AdminAppointmentsPage';
import AdminTruckIncidentsPage from '../pages/Incidents/AdminTruckIncidentsPage';
import AdminWarehousesPage from '../pages/Warehouses/AdminWarehousesPage';
import AdminReportsPage from '../pages/Reports/AdminReportsPage';
import AdminDashboardPage from '../pages/Dashboard/AdminDashboardPage';
import { Franchisee, Incident, ProfilePreferences, Truck } from '../types/api';
import { ProfileSubmitPayload } from '../hooks/useFranchiseeProfile';

interface AppRoutesProps {
  isAuthenticated: boolean;
  franchisee: Franchisee | null;
  preferences: ProfilePreferences;
  isProfileLoading: boolean;
  profileError: string | null;
  onSubmitProfile: (payload: ProfileSubmitPayload) => Promise<void>;
  onStartCreateOrder: (orderId: number) => void;
  orderInCreationId: number | null;
  onCustomerOrderFinished: () => void;
  selectedIncident: Incident | null;
  selectedIncidentTruck: Truck | null;
  onOpenIncidentDetail: (incident: Incident, truck?: Truck | null) => void;
}

interface RouteGuardProps {
  isAuthenticated: boolean;
  children: React.ReactElement;
}

const ProtectedRoute = ({ isAuthenticated, children }: RouteGuardProps): React.ReactElement => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const PublicRoute = ({ isAuthenticated, children }: RouteGuardProps): React.ReactElement => {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = ({
  isAuthenticated,
  franchisee,
  preferences,
  isProfileLoading,
  profileError,
  onSubmitProfile,
  onStartCreateOrder,
  orderInCreationId,
  onCustomerOrderFinished,
  selectedIncident,
  selectedIncidentTruck,
  onOpenIncidentDetail,
}: AppRoutesProps): React.ReactElement => {
  const navigate = useNavigate();
  const goDashboard = (): void => navigate('/dashboard');

  return (
    <Routes>


      <Route
        path="/profile"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ProfilePage
              franchisee={franchisee}
              preferences={preferences}
              isLoading={isProfileLoading}
              error={profileError}
              onBack={goDashboard}
              onSubmit={onSubmitProfile}
            />
          </ProtectedRoute>
        }
      />

    <Route
        path="/login"
        element={
            <PublicRoute isAuthenticated={isAuthenticated}>
                <LoginPage
                    onSuccess={() => {
                        navigate('/dashboard');
                    }}
                />
            </PublicRoute>
        }
    />
      <Route
        path="/admin/franchisees"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <FranchiseesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/franchisees/:franchiseeId"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <FranchiseeDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/franchise-applications"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <FranchiseeApplicationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/franchise-applications/:applicationId"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <FranchiseeApplicationDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/trucks"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <TrucksPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/supply-orders"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminSupplyOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminAppointmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/incidents"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminTruckIncidentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/warehouses"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminWarehousesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? '/admin/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
