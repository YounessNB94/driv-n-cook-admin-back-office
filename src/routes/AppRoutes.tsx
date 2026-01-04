import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProfilePage from '../pages/Profile/ProfilePage';
import { Franchisee, ProfilePreferences } from '../types/api';
import { ProfileSubmitPayload } from '../hooks/useFranchiseeProfile';

const PRIVATE_HOME_PATH = '/profile';

const AuthPlaceholder = (): React.ReactElement => <></>;

interface AppRoutesProps {
  isAuthenticated: boolean;
  franchisee: Franchisee | null;
  preferences: ProfilePreferences;
  isProfileLoading: boolean;
  profileError: string | null;
  onSubmitProfile: (payload: ProfileSubmitPayload) => Promise<void>;
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
    return <Navigate to={PRIVATE_HOME_PATH} replace />;
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
}: AppRoutesProps): React.ReactElement => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute isAuthenticated={isAuthenticated}>
            <AuthPlaceholder />
          </PublicRoute>
        }
      />

      <Route
        path={PRIVATE_HOME_PATH}
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ProfilePage
              franchisee={franchisee}
              preferences={preferences}
              isLoading={isProfileLoading}
              error={profileError}
              onSubmit={onSubmitProfile}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? PRIVATE_HOME_PATH : '/'} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
