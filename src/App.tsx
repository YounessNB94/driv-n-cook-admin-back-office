import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ProfilePreferences } from './types/api';
import { useFranchiseeProfile, ProfileSubmitPayload } from './hooks/useFranchiseeProfile';
import Header from './components/layout/Header';
import theme from './theme';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const DEFAULT_ACCENT_COLOR = '#2F5D50';

const initialProfilePreferences: ProfilePreferences = {
  accentColor: DEFAULT_ACCENT_COLOR,
};

const AppContent = (): React.ReactElement => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

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

  const franchiseeName = franchisee ? `${franchisee.firstName} ${franchisee.lastName}`.trim() : '';

  const handleLogin = (): void => {
    setIsAuthenticated(true);
    navigate('/profile');
  };

  const handleLogout = (): void => {
    setIsAuthenticated(false);
    resetProfileState();
    navigate('/');
  };

  const handleSubmitProfile = React.useCallback(
    (payload: ProfileSubmitPayload): Promise<void> => submitProfile(payload),
    [submitProfile],
  );
  return (
    <>
      <Header
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onNavigateProfile={isAuthenticated ? () => navigate('/profile') : undefined}
        userLabel={isAuthenticated && franchisee ? franchiseeName : undefined}
        userAvatarUrl={isAuthenticated ? preferences.avatarDataUrl : undefined}
        userAccentColor={isAuthenticated ? preferences.accentColor : undefined}
      />
      <Box component="main">
        <AppRoutes
          isAuthenticated={isAuthenticated}
          franchisee={franchisee}
          preferences={preferences}
          isProfileLoading={isProfileLoading}
          profileError={profileError}
          onSubmitProfile={handleSubmitProfile}
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
