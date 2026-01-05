import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/LogoDNC.svg';

const navLinks: Array<{ key: string; href: string }> = [
  { key: 'navigation.home', href: '#hero' },
  { key: 'navigation.presentation', href: '#presentation' },
  { key: 'navigation.purpose', href: '#purpose' },
  { key: 'navigation.steps', href: '#roadmap' },
  { key: 'navigation.testimonials', href: '#testimonials' },
];

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout?: () => void;
  onNavigateHome?: () => void;
  userLabel?: string;
  onNavigateSignup?: () => void;
  onNavigateBackOffice?: () => void;
}

const Header = ({
  isAuthenticated,
  userLabel,
  onLogout,
}: HeaderProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'fr';
  const profileLabel = userLabel ?? t('navigation.accountLabel');

  const handleLanguageToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextLanguage = event.target.checked ? 'en' : 'fr';
    void i18n.changeLanguage(nextLanguage);
  };

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

  const renderAuthButtons = (afterAction?: () => void) => {
    if (isAuthenticated) {
      return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              onLogout?.();
              afterAction?.();
            }}
          >
            {t('navigation.logout')}
          </Button>
        </Stack>
      );
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              component="img"
              src={logo}
              alt={t('brand.name')}
              sx={{ height: 64, width: 'auto' }}
            />
            <Box>
              <Typography variant="h6" color="text.primary" sx={{ lineHeight: 1 }}>
                {t('brand.name')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('brand.tagline')}
              </Typography>
            </Box>
          </Box>
            <Stack direction="row" spacing={3} alignItems="center">
              {!isAuthenticated}
              {languageSwitch}
              {renderAuthButtons()}
            </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
