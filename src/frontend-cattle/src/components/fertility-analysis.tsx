import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface FertilityAnalysisProps {
  cattle: Cattle[];
}

interface FertilityBadgeProps {
  fertilityvariant: 'default' | 'secondary' | 'outline' | 'destructive';
}

// Componente Badge simples para replicar o do shadcn/ui
// Adaptação para as variantes de cor que você tinha
const CustomFertilityBadge = styled(Box)<FertilityBadgeProps>(({ theme, fertilityvariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white, // Cor do texto padrão para os badges
  backgroundColor: theme.palette.grey[500], // Default color

  ...(fertilityvariant === 'default' && {
    backgroundColor: theme.palette.success.main, // Verde para prenhe
  }),
  ...(fertilityvariant === 'secondary' && {
    backgroundColor: theme.palette.info.main, // Azul claro para pariu recentemente
  }),
  ...(fertilityvariant === 'outline' && {
    backgroundColor: theme.palette.warning.main, // Laranja para vazia
    color: theme.palette.getContrastText(theme.palette.warning.main),
    border: `1px solid ${theme.palette.warning.dark}`,
  }),
  ...(fertilityvariant === 'destructive' && {
    backgroundColor: theme.palette.error.main, // Vermelho para desconhecido
  }),
}));

export function FertilityAnalysis({ cattle }: FertilityAnalysisProps) {
  const femaleCattle = cattle.filter((c) => c.sex === "Female" && c.status === "Active");
  const reproductionStats = femaleCattle.reduce(
    (acc, cow) => {
      const statusTranslation = {
        Pregnant: "Prenhe",
        "Recently Calved": "Pariu Recentemente",
        Empty: "Vazia",
        Unknown: "Desconhecido",
      };
      const status = cow.reproductionStatus || "Unknown";
      const translatedStatus = statusTranslation[status as keyof typeof statusTranslation] || status;
      acc[translatedStatus] = (acc[translatedStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const getStatusColorVariant = (status: string) => {
    switch (status) {
      case "Prenhe":
        return "default";
      case "Pariu Recentemente":
        return "secondary";
      case "Vazia":
        return "outline";
      case "Desconhecido":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <Typography variant="h6" component="h2">
          Análise de Fertilidade
        </Typography>
      </CardHeader>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Fêmeas Ativas: {femaleCattle.length}
          </Typography>
          {Object.entries(reproductionStats).map(([status, count]) => (
            <Box key={status} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {status}
              </Typography>
              <CustomFertilityBadge fertilityvariant={getStatusColorVariant(status)}>
                {count} vacas
              </CustomFertilityBadge>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}