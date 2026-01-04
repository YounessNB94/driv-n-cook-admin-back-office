import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/images/LogoDNC.svg';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  userLabel?: string;
  onNavigateProfile?: () => void;
  userAvatarUrl?: string;
  userAccentColor?: string;
}

const Header = ({
  isAuthenticated,
  onLogin,
  onLogout,
  userLabel,
  onNavigateProfile,
  userAvatarUrl,
  userAccentColor,
}: HeaderProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'fr';
  const profileLabel = userLabel ?? t('navigation.accountLabel');

  const handleLanguageToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextLanguage = event.target.checked ? 'en' : 'fr';
    void i18n.changeLanguage(nextLanguage);
  };

  const handleNavigateProfile = (): void => {
    if (onNavigateProfile) {
      onNavigateProfile();
    }
  };

  const avatarNode = userAvatarUrl ? (
    <Avatar
      src={userAvatarUrl}
      alt={profileLabel}
      sx={{ width: 32, height: 32 }}
    />
  ) : (
    <AccountCircleOutlinedIcon sx={{ color: userAccentColor ?? theme.palette.primary.main }} />
  );


  const languageSwitch = (
    <FormControlLabel
      control={
        <Switch
          color="secondary"
          checked={currentLang === 'en'}
          onChange={handleLanguageToggle}
          inputProps={{ 'aria-label': t('navigation.language') }}
        />
      }
      label={`${currentLang === 'en' ? 'EN' : 'FR'}`}
      labelPlacement="start"
      sx={{ ml: 2 }}
    />
  );

  const profileBadge = (
    <Button
      variant="text"
      color="primary"
      startIcon={avatarNode}
      onClick={handleNavigateProfile}
      disabled={!onNavigateProfile}
      sx={{
        fontWeight: 600,
        textTransform: 'none',
        border: '1px solid',
        borderColor: userAccentColor ?? theme.palette.primary.main,
        borderRadius: '999px',
        pl: 1.5,
        pr: 2,
        color: userAccentColor ?? theme.palette.primary.main,
      }}
    >
      {profileLabel}
    </Button>
  );

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          {profileBadge}
          <Button variant="contained" color="secondary" onClick={onLogout} fullWidth={!isDesktop}>
            {t('navigation.logout')}
          </Button>
        </Stack>
      );
    }

    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
        <Button variant="text" color="primary" onClick={onLogin} fullWidth={!isDesktop}>
          {t('navigation.login')}
        </Button>
      </Stack>
    );
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            component="img"
            src={logo}
            alt={t('brand.name')}
            sx={{ height: 56, width: 'auto' }}
          />
          <Box>
            <Typography variant="overline" color="secondary" sx={{ letterSpacing: 2 }}>
              {t('navigation.backOffice')}
            </Typography>
            <Typography variant="h6" color="text.primary" sx={{ lineHeight: 1 }}>
              {t('brand.name')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('brand.tagline')}
            </Typography>
          </Box>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 3 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          width={{ xs: '100%', sm: 'auto' }}
        >
          {languageSwitch}
          {renderAuthButtons()}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
