import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';
import { styled } from '@mui/system'; // Para o Badge customizado

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface StatusSummaryProps {
  cattle: Cattle[];
}

// Componente Badge simples para replicar o do shadcn/ui
// Adaptação para as variantes de cor que você tinha
const CustomStatusBadge = styled(Box)<{ statusvariant: 'default' | 'secondary' | 'destructive' | 'outline' }>(({ theme, statusvariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white, // Cor do texto padrão para os badges
  backgroundColor: theme.palette.grey[500], // Default color

  ...(statusvariant === 'default' && {
    backgroundColor: theme.palette.primary.main, // Exemplo: azul para ativo
  }),
  ...(statusvariant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main, // Exemplo: roxo para vendido
  }),
  ...(statusvariant === 'destructive' && {
    backgroundColor: theme.palette.error.main, // Vermelho para morreu/desaparecido
  }),
  ...(statusvariant === 'outline' && {
    backgroundColor: theme.palette.warning.main, // Laranja para abatido
    color: theme.palette.getContrastText(theme.palette.warning.main), // Garante contraste
    border: `1px solid ${theme.palette.warning.dark}`,
  }),
}));


export function StatusSummary({ cattle }: StatusSummaryProps) {
  const statusCounts = cattle.reduce(
    (acc, cow) => {
      const statusTranslation = {
        Active: "Ativo",
        Sold: "Vendido",
        Died: "Morreu",
        Butchered: "Abatido",
        Missing: "Desaparecido",
      };
      const translatedStatus = statusTranslation[cow.status as keyof typeof statusTranslation] || cow.status;
      acc[translatedStatus] = (acc[translatedStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const getStatusColorVariant = (status: string) => {
    switch (status) {
      case "Ativo":
        return "default";
      case "Vendido":
        return "secondary";
      case "Morreu":
        return "destructive";
      case "Abatido":
        return "outline";
      case "Desaparecido":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <Typography variant="h6" component="h2">
          Resumo de Status
        </Typography>
      </CardHeader>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <Box key={status} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {status}
              </Typography>
              <CustomStatusBadge statusvariant={getStatusColorVariant(status)}>
                {count} cabeças
              </CustomStatusBadge>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}