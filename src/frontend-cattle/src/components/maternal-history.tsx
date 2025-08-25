"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import { styled } from '@mui/system';
import { parseISO, differenceInYears } from 'date-fns'; // Usaremos differenceInYears para idade em anos

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface MaternalHistoryProps {
  cattle: Cattle[];
}

// Componente Badge simples para replicar o do shadcn/ui
// Adaptação para as variantes de cor que você tinha
const CustomMaternalBadge = styled(Box)<{ badgevariant: string }>(({ theme, badgevariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[500], // Default color

  // Cores para a taxa de desmame
  ...(badgevariant === 'default' && {
    backgroundColor: theme.palette.success.main, // Bom (>= 80%)
  }),
  ...(badgevariant === 'secondary' && {
    backgroundColor: theme.palette.info.main, // Médio (>= 60%)
  }),
  ...(badgevariant === 'destructive' && {
    backgroundColor: theme.palette.error.main, // Ruim (< 60%)
  }),

  // Cores para o status reprodutivo (seja diferente das taxas)
  ...(badgevariant === 'status-pregnant' && {
    backgroundColor: theme.palette.primary.main, // Prenhe
  }),
  ...(badgevariant === 'status-outline' && {
    border: `1px solid ${theme.palette.divider}`, // Vazia / Outros
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
  }),

  // Cores para status da cria
  ...(badgevariant === 'calf-status-active' && {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  }),
  ...(badgevariant === 'calf-status-weaned' && {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  }),
}));


export function MaternalHistory({ cattle }: MaternalHistoryProps) {
  // Get all mothers (females that have offspring)
  const mothers = cattle.filter((c) => c.sex === "Female" && cattle.some((offspring) => offspring.motherId === c.id));

  const getMaternalStats = (mother: Cattle) => {
    const offspring = cattle.filter((c) => c.motherId === mother.id);
    const weanedOffspring = offspring.filter((c) => c.isWeaned);
    const activeOffspring = offspring.filter((c) => c.status === "Active");

    return {
      totalOffspring: offspring.length,
      weanedOffspring: weanedOffspring.length,
      activeOffspring: activeOffspring.length,
      weaningRate: offspring.length > 0 ? Math.round((weanedOffspring.length / offspring.length) * 100) : 0,
    };
  };

  const calculateAgeInYears = (birthDate: string) => {
    const birth = parseISO(birthDate);
    const today = new Date();
    return differenceInYears(today, birth);
  };

  const translateReproductionStatus = (status?: string) => {
    const translations = {
      Pregnant: "Prenhe",
      "Recently Calved": "Pariu Recentemente",
      Empty: "Vazia",
      Unknown: "Desconhecido",
    };
    return translations[status as keyof typeof translations] || "Desconhecido";
  };

  const translateStatus = (status: string) => {
    const translations = {
      Active: "Ativo",
      Sold: "Vendido",
      Died: "Morreu",
      Butchered: "Abatido",
      Missing: "Desaparecido",
    };
    return translations[status as keyof typeof translations] || status;
  };

  return (
    <Box sx={{ '& > :not(style)': { mb: 3 } }}> {/* Equivalente ao space-y-6 */}
      <Card>
        <CardHeader title={<Typography variant="h6">Histórico de Performance Maternal</Typography>} />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 800 }} aria-label="tabela de histórico maternal">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Brinco Nº</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Idade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Raça</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Crias</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Crias Ativas</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Desmamadas</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Taxa Desmame</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status Atual</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mothers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>
                      Nenhuma vaca com histórico maternal encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  mothers.map((mother) => {
                    const stats = getMaternalStats(mother);
                    const weaningBadgeVariant =
                      stats.weaningRate >= 80 ? "default" : stats.weaningRate >= 60 ? "secondary" : "destructive";
                    const reproductionBadgeVariant =
                      mother.reproductionStatus === "Pregnant" ? "status-pregnant" : "status-outline";

                    return (
                      <TableRow key={mother.id}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{mother.tagNumber}</TableCell>
                        <TableCell>{mother.name}</TableCell>
                        <TableCell>{calculateAgeInYears(mother.birthDate)} anos</TableCell>
                        <TableCell>{mother.breed}</TableCell>
                        <TableCell>{stats.totalOffspring}</TableCell>
                        <TableCell>{stats.activeOffspring}</TableCell>
                        <TableCell>{stats.weanedOffspring}</TableCell>
                        <TableCell>
                          <CustomMaternalBadge badgevariant={weaningBadgeVariant}>
                            {stats.weaningRate}%
                          </CustomMaternalBadge>
                        </TableCell>
                        <TableCell>
                          <CustomMaternalBadge badgevariant={reproductionBadgeVariant}>
                            {translateReproductionStatus(mother.reproductionStatus)}
                          </CustomMaternalBadge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={<Typography variant="h6">Detalhes das Crias</Typography>} />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}> {/* Equivalente ao space-y-4 */}
            {mothers.map((mother) => {
              const offspring = cattle.filter((c) => c.motherId === mother.id);
              if (offspring.length === 0) return null;

              return (
                <Box key={mother.id} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'semibold', mb: 1 }}>
                    {mother.name} ({mother.tagNumber}) - {offspring.length} crias
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 1, // Equivalente ao gap-2
                  }}>
                    {offspring.map((calf) => (
                      <Box key={calf.id} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1, // Equivalente ao p-2
                        bgcolor: 'action.hover', // Equivalente ao bg-muted
                        borderRadius: '4px',
                      }}>
                        <Typography variant="body2">
                          {calf.name} ({calf.tagNumber})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}> {/* Equivalente ao space-x-1 */}
                          <CustomMaternalBadge badgevariant="calf-status-active">
                            {translateStatus(calf.status)}
                          </CustomMaternalBadge>
                          {calf.isWeaned && (
                            <CustomMaternalBadge badgevariant="calf-status-weaned">
                              Desmamado
                            </CustomMaternalBadge>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
            {mothers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Não há vacas com histórico maternal para exibir detalhes das crias.
                </Typography>
              )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}