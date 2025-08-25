import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Tabs, Tab } from '@mui/material';
import { Header } from '../components/header'; // Importe o Header do seu local correto

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determina a aba ativa com base na rota
  // Se estiver na raiz "/", ou em "/dashboard", 'dashboard' será o valor
  const activeTab = location.pathname.split("/")[1] || "dashboard";

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(`/${newValue}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Fixo no topo */}
      <Header />

      {/* AppBar com as Tabs de Navegação */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'center' }}> {/* Centraliza as tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="navegação do sistema de gado"
          >
            <Tab label="Painel" value="dashboard" component={Link} to="/dashboard" />
            <Tab label="Gado" value="cattle" component={Link} to="/cattle" />
            <Tab label="Prenhez" value="pregnancy" component={Link} to="/pregnancy" />
            <Tab label="Desmame" value="weaning" component={Link} to="/weaning" />
            <Tab label="Peso" value="weight" component={Link} to="/weight" />
            <Tab label="Maternal" value="maternal" component={Link} to="/maternal" />
            <Tab label="Eventos" value="events" component={Link} to="/events" />
            <Tab label="Relatórios" value="reports" component={Link} to="/reports" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Conteúdo das Rotas Aninhadas */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* Aqui o conteúdo da rota aninhada será renderizado */}
      </Box>
    </Box>
  );
}

export default MainLayout;
