import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; // Usaremos um ícone similar do Material UI

export function Header() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <LocalOfferIcon sx={{ mr: 2, fontSize: 32 }} /> {/* Ajuste o tamanho do ícone */}
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Sistema de Gestão de Gado
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}> {/* Cor para o subtítulo */}
              Acompanhe e gerencie seu rebanho
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}