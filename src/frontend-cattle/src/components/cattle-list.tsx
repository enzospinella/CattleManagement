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
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from '@mui/system';

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface CattleListProps {
  cattle: Cattle[];
  onEdit: (cattle: Cattle) => void;
  onDelete: (id: string) => void;
}

// Componente Badge simples para replicar o do shadcn/ui
const CustomStatusBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'statusvariant',
})<{ statusvariant: "default" | "secondary" | "destructive" | "outline" }>(({ theme, statusvariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: (theme.typography as any).fontWeightMedium,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[500],

  ...(statusvariant === 'default' && {
    backgroundColor: theme.palette.primary.main,
  }),
  ...(statusvariant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main,
  }),
  ...(statusvariant === 'destructive' && {
    backgroundColor: theme.palette.error.main,
  }),
  ...(statusvariant === 'outline' && {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.getContrastText(theme.palette.warning.main),
    border: `1px solid ${theme.palette.warning.dark}`,
  }),
}));

export function CattleList({ cattle, onEdit, onDelete }: CattleListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");

  const filteredCattle = cattle.filter((cow) => {
    const matchesSearch =
      cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cow.tagNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cow.status === statusFilter;
    const matchesBreed = breedFilter === "all" || cow.breed === breedFilter;

    return matchesSearch && matchesStatus && matchesBreed;
  });

  const breeds = [...new Set(cattle.map((c) => c.breed))];
  const statuses = [...new Set(cattle.map((c) => c.status))];

  const getStatusColorVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Sold":
        return "secondary";
      case "Died":
        return "destructive";
      case "Butchered":
        return "outline";
      case "Missing":
        return "destructive";
      default:
        return "default";
    }
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

  const translateSex = (sex: "Male" | "Female") => {
    return sex === "Male" ? "Macho" : "Fêmea";
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const years = Math.floor(ageInDays / 365);
    const months = Math.floor((ageInDays % 365) / 30);

    if (years > 0) {
      return `${years}a ${months}m`;
    }
    return `${months}m`;
  };

  return (
    <Card>
      <CardHeader>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Registros do Gado
        </Typography>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nome ou número do brinco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          >
            <MenuItem value="all">Todos os Status</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {translateStatus(status)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Raça"
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          >
            <MenuItem value="all">Todas as Raças</MenuItem>
            {breeds.map((breed) => (
              <MenuItem key={breed} value={breed}>
                {breed}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </CardHeader>
      <CardContent>
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 650 }} aria-label="tabela de gado">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Brinco Nº</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Raça</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Sexo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Idade</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Peso (kg)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCattle.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
                    Nenhum gado encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCattle.map((cow) => (
                  <TableRow key={cow.id}>
                    <TableCell sx={{ fontWeight: 'medium' }}>{cow.tagNumber}</TableCell>
                    <TableCell>{cow.name}</TableCell>
                    <TableCell>{cow.breed}</TableCell>
                    <TableCell>{translateSex(cow.sex)}</TableCell>
                    <TableCell>{calculateAge(cow.birthDate)}</TableCell>
                    <TableCell>{cow.weight}</TableCell>
                    <TableCell>
                      <CustomStatusBadge statusvariant={getStatusColorVariant(cow.status)}>
                        {translateStatus(cow.status)}
                      </CustomStatusBadge>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          aria-label="editar"
                          onClick={() => onEdit(cow)}
                          size="small"
                          color="primary" // Pode ser 'primary', 'secondary', ou 'default'
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label="deletar"
                          onClick={() => onDelete(cow.id)}
                          size="small"
                          color="error" // 'error' para botões de exclusão
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}