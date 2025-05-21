import React from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import { Router } from './routes';

function App() {

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});


  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router/>
      </ThemeProvider>
    </>
  );
}

export default App;