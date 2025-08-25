import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Divider, // Adicionado para divisores visuais
} from "@mui/material";
import { styled } from '@mui/system';

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface WeaningWeightIntegrationProps {
  cattle: Cattle[];
}

// Componente Badge para replicar o do shadcn/ui
const CustomPerformanceBadge = styled(Box)<{ performancevariant: string }>(({ theme, performancevariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[500], // Default color

  ...(performancevariant === 'default' && {
    backgroundColor: theme.palette.success.main, // Excelente
  }),
  ...(performancevariant === 'secondary' && {
    backgroundColor: theme.palette.info.main, // Boa
  }),
  ...(performancevariant === 'destructive' && {
    backgroundColor: theme.palette.error.main, // Abaixo da Média
  }),
  ...(performancevariant === 'outline' && { // Para o caso de não haver dados ou fallback
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
  }),
}));

export function WeaningWeightIntegration({ cattle }: WeaningWeightIntegrationProps) {
  const weanedCalves = cattle.filter((c) => c.isWeaned && c.weaningWeight);

  const calculateAverageWeaningWeight = () => {
    if (weanedCalves.length === 0) return 0;
    const totalWeight = weanedCalves.reduce((sum, calf) => sum + (calf.weaningWeight || 0), 0);
    return Math.round(totalWeight / weanedCalves.length);
  };

  const calculateAverageWeaningAge = () => {
    if (weanedCalves.length === 0) return 0;
    const totalAge = weanedCalves.reduce((sum, calf) => sum + (calf.weaningAge || 0), 0);
    return Math.round(totalAge / weanedCalves.length);
  };

  const getWeightPerformance = (weight: number) => {
    const average = calculateAverageWeaningWeight();
    if (average === 0) return "N/A"; // Evitar divisão por zero ou comparação sem média
    if (weight >= average * 1.1) return "Excelente";
    if (weight >= average * 0.9) return "Boa";
    return "Abaixo da Média";
  };

  const getPerformanceColorVariant = (performance: string) => {
    switch (performance) {
      case "Excelente":
        return "default";
      case "Boa":
        return "secondary";
      case "Abaixo da Média":
        return "destructive";
      default:
        return "outline"; // Para "N/A"
    }
  };

  const translateQuality = (quality?: string) => {
    const translations = {
      Good: "Boa",
      Normal: "Normal",
      Bad: "Ruim",
    };
    return translations[quality as keyof typeof translations] || quality;
  };

  const breedStats = weanedCalves.reduce(
    (acc, calf) => {
      if (!acc[calf.breed]) {
        acc[calf.breed] = { count: 0, totalWeight: 0 };
      }
      acc[calf.breed].count++;
      acc[calf.breed].totalWeight += calf.weaningWeight || 0;
      return acc;
    },
    {} as Record<string, { count: number; totalWeight: number }>,
  );

  return (
    <Box sx={{ '& > :not(style)': { mb: 3 } }}> {/* Equivalente ao space-y-6 */}
      {/* Cards de Resumo */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // 1 coluna em telas extra pequenas (mobile)
            md: 'repeat(2, 1fr)', // 2 colunas em telas médias (tablet)
            lg: 'repeat(4, 1fr)', // 4 colunas em telas grandes (desktop)
          },
          gap: 2, // Equivalente ao gap-4
        }}
      >
        <Card>
          <CardHeader title={<Typography variant="subtitle2" color="text.secondary">Total Desmamados</Typography>} sx={{ pb: 1 }} />
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{weanedCalves.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={<Typography variant="subtitle2" color="text.secondary">Peso Médio</Typography>} sx={{ pb: 1 }} />
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{calculateAverageWeaningWeight()} kg</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={<Typography variant="subtitle2" color="text.secondary">Melhor Performance</Typography>} sx={{ pb: 1 }} />
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {weanedCalves.length > 0 ? Math.max(...weanedCalves.map((c) => c.weaningWeight || 0)) : 0} kg
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={<Typography variant="subtitle2" color="text.secondary">Idade Média</Typography>} sx={{ pb: 1 }} />
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {calculateAverageWeaningAge()} dias
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Performance de Desmame por Raça */}
      <Card>
        <CardHeader title={<Typography variant="h6">Performance de Desmame por Raça</Typography>} />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}> {/* Equivalente ao space-y-3 */}
            {Object.entries(breedStats).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Nenhum bezerro desmamado encontrado para análise por raça.
                </Typography>
              ) : (
                Object.entries(breedStats).map(([breed, stats]) => (
                  <Box
                    key={breed}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2, // Equivalente ao p-3
                      bgcolor: 'action.hover', // Equivalente ao bg-muted
                      borderRadius: '8px', // Equivalente ao rounded-lg
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{breed}</Typography>
                      <Typography variant="body2" color="text.secondary">{stats.count} bezerros desmamados</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'semibold' }}>{Math.round(stats.totalWeight / stats.count)} kg</Typography>
                      <Typography variant="body2" color="text.secondary">média</Typography>
                    </Box>
                  </Box>
                ))
              )}
          </Box>
        </CardContent>
      </Card>

      {/* Performance Individual de Desmame */}
      <Card>
        <CardHeader title={<Typography variant="h6">Performance Individual de Desmame</Typography>} />
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2, // Equivalente ao gap-4
            }}
          >
            {weanedCalves.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', gridColumn: '1 / -1', py: 2 }}>
                  Nenhum bezerro desmamado para exibir performance individual.
                </Typography>
              ) : (
                weanedCalves.map((calf) => {
                  const performance = getWeightPerformance(calf.weaningWeight || 0);
                  return (
                    <Box key={calf.id} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{calf.name}</Typography>
                        <CustomPerformanceBadge performancevariant={getPerformanceColorVariant(performance)}>
                          {performance}
                        </CustomPerformanceBadge>
                      </Box>
                      <Box sx={{ '& > :not(style)': { mb: 0.5 }, fontSize: '0.875rem', color: 'text.secondary' }}> {/* Equivalente ao space-y-1 text-sm text-muted-foreground */}
                        <Typography variant="body2">Brinco: {calf.tagNumber}</Typography>
                        <Typography variant="body2">Peso: {calf.weaningWeight} kg</Typography>
                        <Typography variant="body2">Idade: {calf.weaningAge} dias</Typography>
                        <Typography variant="body2">Qualidade: {translateQuality(calf.calfQuality)}</Typography>
                        <Typography variant="body2">Mãe: {calf.motherName || "Desconhecida"}</Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}