"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions, // Adicionado para os botões do formulário
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { parseISO, differenceInDays } from 'date-fns';

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface WeightManagementProps {
  cattle: Cattle[];
  onUpdateWeight: (cattle: Cattle) => void;
}

export function WeightManagement({ cattle, onUpdateWeight }: WeightManagementProps) {
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activeCattle = cattle.filter((c) => c.status === "Active");

  const handleUpdateWeightData = (newWeight: number) => {
    if (selectedCattle) {
      const updatedCattle = { ...selectedCattle, weight: newWeight };
      onUpdateWeight(updatedCattle);
      setIsDialogOpen(false);
      setSelectedCattle(null);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = parseISO(birthDate);
    const today = new Date();
    const ageInDays = differenceInDays(today, birth);
    const years = Math.floor(ageInDays / 365);
    const months = Math.floor((ageInDays % 365) / 30);

    if (years > 0) {
      return `${years}a ${months}m`;
    }
    return `${months}m`;
  };

  const getWeightStatus = (cattle: Cattle) => {
    const ageInDays = differenceInDays(new Date(), parseISO(cattle.birthDate));

    // Basic weight guidelines (these would be breed-specific in reality)
    if (ageInDays < 180) {
      // Under 6 months
      return cattle.weight >= 100 ? "Bom" : "Baixo";
    } else if (ageInDays < 365) {
      // 6-12 months
      return cattle.weight >= 200 ? "Bom" : "Baixo";
    } else {
      // Over 1 year
      return cattle.weight >= 400 ? "Bom" : "Baixo";
    }
  };

  return (
    <Box sx={{ '& > :not(style)': { mb: 3 } }}> {/* Equivalente ao space-y-6 */}
      <Card>
        <CardHeader title={<Typography variant="h6">Gestão de Peso</Typography>} />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} aria-label="tabela de gestão de peso">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Brinco Nº</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Idade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Peso Atual</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Raça</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeCattle.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                      Nenhum gado ativo encontrado para gestão de peso.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeCattle.map((cow) => {
                    const weightStatus = getWeightStatus(cow);
                    return (
                      <TableRow key={cow.id}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{cow.tagNumber}</TableCell>
                        <TableCell>{cow.name}</TableCell>
                        <TableCell>{calculateAge(cow.birthDate)}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{cow.weight} kg</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {weightStatus === "Bom" ? (
                              <TrendingUpIcon sx={{ fontSize: 20, color: 'success.main' }} />
                            ) : (
                              <TrendingDownIcon sx={{ fontSize: 20, color: 'error.main' }} />
                            )}
                            <Typography
                              component="span"
                              sx={{ color: weightStatus === "Bom" ? 'success.main' : 'error.main' }}
                            >
                              {weightStatus}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{cow.breed}</TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="editar peso"
                            onClick={() => {
                              setSelectedCattle(cow);
                              setIsDialogOpen(true);
                            }}
                            size="small"
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
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

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Atualizar Peso - {selectedCattle?.name}</DialogTitle>
        <DialogContent dividers>
          {selectedCattle && (
            <WeightForm cattle={selectedCattle} onSubmit={handleUpdateWeightData} onCancel={() => setIsDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// --- Componente WeightForm (sub-componente) ---

interface WeightFormProps {
  cattle: Cattle;
  onSubmit: (weight: number) => void;
  onCancel: () => void;
}

function WeightForm({ cattle, onSubmit, onCancel }: WeightFormProps) {
  const [weight, setWeight] = useState(cattle.weight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(weight);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <TextField
          id="weight"
          label="Novo Peso (kg)"
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          inputProps={{ min: "0", step: "0.1" }} // Equivalente a min e step
          fullWidth
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Peso atual: {cattle.weight} kg
      </Typography>

      <DialogActions sx={{ p: 0, justifyContent: 'flex-end', gap: 1 }}> {/* Use DialogActions para os botões */}
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained">
          Atualizar Peso
        </Button>
      </DialogActions>
    </form>
  );
}