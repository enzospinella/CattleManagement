import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Your main App component
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Optional: for consistent baseline styles

const theme = createTheme({
  // You can customize your theme here
  palette: {
    primary: {
      main: '#1976d2', // Example primary color
    },
    secondary: {
      main: '#dc004e', // Example secondary color
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    action: { // Ensure action palette is defined, though 'selected' is usually there by default
      selected: 'rgba(0, 0, 0, 0.08)', // Default for a light theme
      // You can explicitly define other states if needed
    }
  },
  // ... other theme customizations
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Applies a CSS reset and basic styles */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
