import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';
import { styled } from '@mui/system'; // Para o Badge customizado
import PeopleIcon from '@mui/icons-material/People'; // Ícone para Total de Gado
import FavoriteIcon from '@mui/icons-material/Favorite'; // Ícone para Vacas Prenhes
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly'; // Ícone para Bezerros Desmamados
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Ícone para Taxa de Ativos

// Importe o tipo Cattle da sua definição central (app/page ou onde você a mover para ser global)
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface StatsCardsProps {
  cattle: Cattle[];
}

// Componente Badge simples para replicar o do shadcn/ui
interface CustomBadgeProps {
  variant: 'secondary' | 'outline' | 'default';
}

const CustomBadge = styled(Box, { shouldForwardProp: (prop) => prop !== 'variant' })<CustomBadgeProps>(({ theme, variant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  marginTop: theme.spacing(1),
  ...(variant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  }),
  ...(variant === 'outline' && {
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
  }),
  // Default e outros podem ser adicionados aqui ou usar as cores do tema
  ...(variant === 'default' && {
    backgroundColor: theme.palette.action.selected, // Um cinza claro
    color: theme.palette.text.primary,
  }),
}));

export function StatsCards({ cattle }: StatsCardsProps) {
  const totalCattle = cattle.length;
  const activeCattle = cattle.filter((c) => c.status === "Active").length;
  const pregnantCattle = cattle.filter((c) => c.reproductionStatus === "Pregnant").length;
  const weanedCalves = cattle.filter((c) => c.isWeaned).length;

  const stats = [
    {
      title: "Total de Gado",
      value: totalCattle,
      icon: PeopleIcon, // Material UI icon
      description: `${activeCattle} ativos`,
      color: "default" as const,
    },
    {
      title: "Vacas Prenhes",
      value: pregnantCattle,
      icon: FavoriteIcon, // Material UI icon
      description: "Esperando bezerros",
      color: "secondary" as const,
    },
    {
      title: "Bezerros Desmamados",
      value: weanedCalves,
      icon: ChildFriendlyIcon, // Material UI icon
      description: "Desmamados com sucesso",
      color: "outline" as const,
    },
    {
      title: "Taxa de Ativos",
      value: `${totalCattle > 0 ? Math.round((activeCattle / totalCattle) * 100) : 0}%`, // Evita divisão por zero
      icon: TrendingUpIcon, // Material UI icon
      description: "Do rebanho total",
      color: "default" as const,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3, // Espaçamento entre os cards
        gridTemplateColumns: {
          xs: '1fr', // 1 coluna em telas extra pequenas (mobile)
          md: 'repeat(2, 1fr)', // 2 colunas em telas médias (tablet)
          lg: 'repeat(4, 1fr)', // 4 colunas em telas grandes (desktop)
        },
      }}
    >
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} sx={{ minWidth: 275 }}>
            <CardHeader
              title={
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                  {stat.title}
                </Typography>
              }
              action={
                <IconComponent sx={{ fontSize: 20, color: 'text.secondary' }} /> // Ajuste do tamanho e cor do ícone
              }
              sx={{ pb: 1 }} // Padding bottom
            />
            <CardContent>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <CustomBadge variant={stat.color}>
                {stat.description}
              </CustomBadge>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}