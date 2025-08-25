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
import { parseISO, differenceInMonths } from 'date-fns';

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface FirstCalvingAnalysisProps {
  cattle: Cattle[];
}

// Definição da interface para as props personalizadas
interface CustomBadgeProps {
  badgevariant: string;
}

// Componente Badge para replicar o do shadcn/ui
const CustomFirstCalvingBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'badgevariant',
})<CustomBadgeProps>(({ theme, badgevariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[500], // Default color

  // Readiness colors
  ...(badgevariant === 'default' && {
    backgroundColor: theme.palette.success.main, // Pronta
  }),
  ...(badgevariant === 'secondary' && {
    backgroundColor: theme.palette.info.main, // Em Breve
  }),
  ...(badgevariant === 'outline' && {
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
  }),

  // Calf status colors
  ...(badgevariant === 'calf-active' && {
    backgroundColor: theme.palette.primary.main, // Ativo
  }),
  ...(badgevariant === 'calf-destructive' && {
    backgroundColor: theme.palette.error.main, // Não ativo / Morto
  }),
  ...(badgevariant === 'calf-weaned-yes' && {
    backgroundColor: theme.palette.secondary.main, // Desmamado
  }),
}));


export function FirstCalvingAnalysis({ cattle }: FirstCalvingAnalysisProps) {
  // Get heifers (young females that haven't calved yet but are of breeding age)
  const heifers = cattle.filter((c) => {
    const age = calculateAgeInMonths(c.birthDate);
    return (
      c.sex === "Female" &&
      c.status === "Active" &&
      age >= 15 && // At least 15 months old
      !cattle.some((offspring) => offspring.motherId === c.id) // No offspring yet
    );
  });

  // Get first-time mothers (females with exactly one offspring)
  const firstTimeMothers = cattle.filter((c) => {
    const offspring = cattle.filter((offspring) => offspring.motherId === c.id);
    return c.sex === "Female" && offspring.length === 1;
  });

  function calculateAgeInMonths(birthDate: string) {
    const birth = parseISO(birthDate);
    const today = new Date();
    return differenceInMonths(today, birth);
  }

  function getBreedingReadiness(age: number) {
    if (age >= 24) return "Pronta";
    if (age >= 18) return "Em Breve";
    return "Muito Nova";
  }

  function getReadinessColorVariant(readiness: string) {
    switch (readiness) {
      case "Pronta":
        return "default";
      case "Em Breve":
        return "secondary";
      case "Muito Nova":
        return "outline";
      default:
        return "outline";
    }
  }

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
        <CardHeader title={<Typography variant="h6">Análise do Primeiro Parto</Typography>} />
        <CardContent>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2, // Equivalente ao gap-4
            mb: 3, // Equivalente ao mb-6
          }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{heifers.length}</Typography>
              <Typography variant="body2" color="text.secondary">Novilhas</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{firstTimeMothers.length}</Typography>
              <Typography variant="body2" color="text.secondary">Primíparas</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {heifers.filter((h) => getBreedingReadiness(calculateAgeInMonths(h.birthDate)) === "Pronta").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Prontas para Cobertura</Typography>
            </Box>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 700 }} aria-label="tabela de novilhas">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Brinco Nº</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Idade (meses)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Peso (kg)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Raça</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status Cobertura</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status Reprodutivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {heifers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                      Nenhuma novilha encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  heifers.map((heifer) => {
                    const age = calculateAgeInMonths(heifer.birthDate);
                    const readiness = getBreedingReadiness(age);
                    return (
                      <TableRow key={heifer.id}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{heifer.tagNumber}</TableCell>
                        <TableCell>{heifer.name}</TableCell>
                        <TableCell>{age}</TableCell>
                        <TableCell>{heifer.weight}</TableCell>
                        <TableCell>{heifer.breed}</TableCell>
                        <TableCell>
                          <CustomFirstCalvingBadge badgevariant={getReadinessColorVariant(readiness)}>
                            {readiness}
                          </CustomFirstCalvingBadge>
                        </TableCell>
                        <TableCell>
                          <CustomFirstCalvingBadge badgevariant="outline">
                            {translateReproductionStatus(heifer.reproductionStatus)}
                          </CustomFirstCalvingBadge>
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

      {firstTimeMothers.length > 0 && (
        <Card>
          <CardHeader title={<Typography variant="h6">Performance das Primíparas</Typography>} />
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 700 }} aria-label="tabela de primíparas">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Brinco Nº</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Idade no 1º Parto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status da Cria</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Cria Desmamada</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status Atual</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {firstTimeMothers.map((mother) => {
                    const calf = cattle.find((c) => c.motherId === mother.id);
                    const calvingAge = calf
                      ? Math.abs(differenceInMonths(parseISO(mother.birthDate), parseISO(calf.birthDate)))
                      : 0; // Correção para calcular a idade da mãe no parto
                    return (
                      <TableRow key={mother.id}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{mother.tagNumber}</TableCell>
                        <TableCell>{mother.name}</TableCell>
                        <TableCell>{calvingAge} meses</TableCell>
                        <TableCell>
                          <CustomFirstCalvingBadge
                            badgevariant={calf?.status === "Active" ? "calf-active" : "calf-destructive"}
                          >
                            {translateStatus(calf?.status || "Unknown")}
                          </CustomFirstCalvingBadge>
                        </TableCell>
                        <TableCell>
                          <CustomFirstCalvingBadge badgevariant={calf?.isWeaned ? "calf-weaned-yes" : "outline"}>
                            {calf?.isWeaned ? "Sim" : "Não"}
                          </CustomFirstCalvingBadge>
                        </TableCell>
                        <TableCell>
                          <CustomFirstCalvingBadge badgevariant="outline">
                            {translateReproductionStatus(mother.reproductionStatus)}
                          </CustomFirstCalvingBadge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}