import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Incident, ProfilePreferences, Truck } from './types/api';
import { useFranchiseeProfile, ProfileSubmitPayload } from './hooks/useFranchiseeProfile';
import Header from './components/layout/Header';
import theme from './theme';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import { AUTH_TOKEN_EVENT, getStoredToken, setStoredToken } from './services/httpClient';

const DEFAULT_ACCENT_COLOR = '#2F5D50';

const initialProfilePreferences: ProfilePreferences = {
  accentColor: DEFAULT_ACCENT_COLOR,
};

const readInitialAuthState = (): boolean => {
  const token = getStoredToken();
  if (token) {
    return true;
  }
  return false;
};

const AppContent = (): React.ReactElement => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(readInitialAuthState);
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [selectedIncidentTruck, setSelectedIncidentTruck] = React.useState<Truck | null>(null);
  const [orderInCreationId, setOrderInCreationId] = React.useState<number | null>(null);

  const {
    franchisee,
    preferences,
    isLoading: isProfileLoading,
    error: profileError,
    loadFranchisee,
    submitProfile,
    reset: resetProfileState,
  } = useFranchiseeProfile({ initialPreferences: initialProfilePreferences });

  React.useEffect(() => {
    if (isAuthenticated) {
      loadFranchisee().catch(() => undefined);
    } else {
      resetProfileState();
    }
  }, [isAuthenticated, loadFranchisee, resetProfileState]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleTokenChange = (event: Event): void => {
      const customEvent = event as CustomEvent<{ authenticated: boolean }>;
      setIsAuthenticated(customEvent.detail.authenticated);
    };
    window.addEventListener(AUTH_TOKEN_EVENT, handleTokenChange as EventListener);
    return () => {
      window.removeEventListener(AUTH_TOKEN_EVENT, handleTokenChange as EventListener);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
  }, [isAuthenticated]);

  const franchiseeName = franchisee ? `${franchisee.firstName} ${franchisee.lastName}`.trim() : '';

  const handleLogout = (): void => {
    setIsAuthenticated(false);
    setSelectedIncident(null);
    setSelectedIncidentTruck(null);
    setOrderInCreationId(null);
    resetProfileState();
    setStoredToken(null);
    navigate('/');
  };

  const handleSubmitProfile = React.useCallback(
    (payload: ProfileSubmitPayload): Promise<void> => submitProfile(payload),
    [submitProfile],
  );

  const handleStartCreateCustomerOrder = (orderId: number): void => {
    setOrderInCreationId(orderId);
  };

  const handleCustomerOrderCreationFinished = (): void => {
    setOrderInCreationId(null);
  };

  const handleOpenIncidentDetail = (incident: Incident, truck?: Truck | null): void => {
    setSelectedIncident(incident);
    setSelectedIncidentTruck(truck ?? null);
  };
  return (
    <>
      <Header
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onNavigateBackOffice={isAuthenticated ? () => navigate('/admin/dashboard') : undefined}
      />
      <Box component="main">
        <AppRoutes
          isAuthenticated={isAuthenticated}
          franchisee={franchisee}
          preferences={preferences}
          isProfileLoading={isProfileLoading}
          profileError={profileError}
          onSubmitProfile={handleSubmitProfile}
          onStartCreateOrder={handleStartCreateCustomerOrder}
          orderInCreationId={orderInCreationId}
          onCustomerOrderFinished={handleCustomerOrderCreationFinished}
          selectedIncident={selectedIncident}
          selectedIncidentTruck={selectedIncidentTruck}
          onOpenIncidentDetail={handleOpenIncidentDetail}
        />
      </Box>
    </>
  );
};

const App = (): React.ReactElement => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
