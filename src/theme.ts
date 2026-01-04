import { createTheme } from '@mui/material/styles';

const ecoDeliPalette = {
  deepForest: '#1b4d3e',
  moss: '#4f7a65',
  clay: '#d9822b',
  sand: '#f9f5ed',
  charcoal: '#1f2a24',
};

const theme = createTheme({
  palette: {
    primary: {
      main: ecoDeliPalette.deepForest,
      light: '#3b6f5d',
      dark: '#0f362c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: ecoDeliPalette.clay,
      light: '#f0a554',
      dark: '#a45618',
      contrastText: '#1f1509',
    },
    background: {
      default: ecoDeliPalette.sand,
      paper: '#ffffff',
    },
    text: {
      primary: ecoDeliPalette.charcoal,
      secondary: ecoDeliPalette.moss,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Segoe UI", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
      color: ecoDeliPalette.moss,
    },
    body1: {
      lineHeight: 1.6,
      color: ecoDeliPalette.charcoal,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: '1.75rem',
          paddingBlock: '0.75rem',
        },
      },
    },
  },
});

export default theme;
