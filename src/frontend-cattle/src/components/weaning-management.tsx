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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from '@mui/system';

// Para o DatePicker, você precisará ter @mui/x-date-pickers e uma lib de datas
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface WeaningManagementProps {
  cattle: Cattle[];
  onUpdateWeaning: (cattle: Cattle) => void;
}

// Componente Badge para replicar o do shadcn/ui
const CustomWeaningStatusBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'weaningstatusvariant',
})<{ weaningstatusvariant: string }>(({ theme, weaningstatusvariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[500], // Default color

  ...(weaningstatusvariant === 'default' && {
    backgroundColor: theme.palette.success.main, // Desmamado
  }),
  ...(weaningstatusvariant === 'secondary' && {
    backgroundColor: theme.palette.info.main, // Pronto
  }),
  ...(weaningstatusvariant === 'outline' && {
    backgroundColor: theme.palette.warning.main, // Muito Novo (similar ao outline do shadcn com cor de aviso)
    color: theme.palette.getContrastText(theme.palette.warning.main),
    border: `1px solid ${theme.palette.warning.dark}`,
  }),
}));

export function WeaningManagement({ cattle, onUpdateWeaning }: WeaningManagementProps) {
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter for calves (young cattle that could be weaned)
  const calves = cattle.filter((c) => {
    const birthDate = parseISO(c.birthDate); // Use parseISO
    const today = new Date();
    const ageInDays = differenceInDays(today, birthDate); // Calculate age in days
    return ageInDays <= 365 && c.status === "Active"; // Calves under 1 year
  });

  const calculateAgeInDays = (birthDate: string) => {
    const birth = parseISO(birthDate);
    const today = new Date();
    return differenceInDays(today, birth);
  };

  const handleUpdateWeaningData = (updatedData: Partial<Cattle>) => {
    if (selectedCattle) {
      const updatedCattle = { ...selectedCattle, ...updatedData };
      onUpdateWeaning(updatedCattle);
      setIsDialogOpen(false);
      setSelectedCattle(null);
    }
  };

  const getWeaningStatus = (calf: Cattle) => {
    if (calf.isWeaned) return "Desmamado";
    const age = calculateAgeInDays(calf.birthDate);
    if (age >= 180) return "Pronto";
    return "Muito Novo";
  };

  const getStatusColorVariant = (status: string) => {
    switch (status) {
      case "Desmamado":
        return "default";
      case "Pronto":
        return "secondary";
      case "Muito Novo":
        return "outline";
      default:
        return "default";
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ '& > :not(style)': { mb: 3 } }}> {/* Equivalente ao space-y-6 */}
        <Card>
          <CardHeader title={<Typography variant="h6">Gestão de Desmame</Typography>} />
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 700 }} aria-label="tabela de gestão de desmame">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Brinco Nº</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Idade (dias)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mãe</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data Desmame</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Peso Desmame</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Qualidade</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>
                        Nenhum bezerro ativo encontrado para gestão de desmame.
                      </TableCell>
                    </TableRow>
                  ) : (
                    calves.map((calf) => (
                      <TableRow key={calf.id}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{calf.tagNumber}</TableCell>
                        <TableCell>{calf.name}</TableCell>
                        <TableCell>{calculateAgeInDays(calf.birthDate)}</TableCell>
                        <TableCell>{calf.motherName || "Desconhecida"}</TableCell>
                        <TableCell>
                          <CustomWeaningStatusBadge weaningstatusvariant={getStatusColorVariant(getWeaningStatus(calf))}>
                            {getWeaningStatus(calf)}
                          </CustomWeaningStatusBadge>
                        </TableCell>
                        <TableCell>{calf.weaningDate || "-"}</TableCell>
                        <TableCell>{calf.weaningWeight ? `${calf.weaningWeight} kg` : "-"}</TableCell>
                        <TableCell>{translateQuality(calf.calfQuality) || "-"}</TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="editar desmame"
                            onClick={() => {
                              setSelectedCattle(calf);
                              setIsDialogOpen(true);
                            }}
                            size="small"
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Atualizar Status de Desmame - {selectedCattle?.name}</DialogTitle>
          <DialogContent dividers>
            {selectedCattle && (
              <WeaningForm
                cattle={selectedCattle}
                onSubmit={handleUpdateWeaningData}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setSelectedCattle(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

// --- Componente WeaningForm (sub-componente) ---

interface WeaningFormProps {
  cattle: Cattle;
  onSubmit: (data: Partial<Cattle>) => void;
  onCancel: () => void;
}

function WeaningForm({ cattle, onSubmit, onCancel }: WeaningFormProps) {
  const [formData, setFormData] = useState<Partial<Cattle>>({
    isWeaned: cattle.isWeaned || false,
    weaningDate: cattle.weaningDate || "",
    weaningWeight: cattle.weaningWeight || 0,
    weaningAge: cattle.weaningAge || 0,
    calfQuality: cattle.calfQuality || "Normal",
    weaningNotes: cattle.weaningNotes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (id: string, value: string | number | boolean | null | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDateChange = (id: string, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [id]: date ? format(date, 'yyyy-MM-dd') : '',
    }));
  };


  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ '& > :not(style)': { mb: 3 } }}>
        <FormControlLabel
          control={
            <Checkbox
              id="isWeaned"
              checked={formData.isWeaned || false}
              onChange={(e) => handleSelectChange('isWeaned', e.target.checked)}
            />
          }
          label="Está Desmamado"
        />

        {formData.isWeaned && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <DatePicker
                label="Data do Desmame"
                value={formData.weaningDate ? parseISO(formData.weaningDate) : null}
                onChange={(date) => handleDateChange('weaningDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TextField
                id="weaningWeight"
                label="Peso no Desmame (kg)"
                type="number"
                value={formData.weaningWeight || ""}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                id="weaningAge"
                label="Idade no Desmame (dias)"
                type="number"
                value={formData.weaningAge || ""}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                id="calfQuality"
                select
                label="Qualidade do Bezerro"
                value={formData.calfQuality || "Normal"}
                onChange={(e) => handleSelectChange('calfQuality', e.target.value as Cattle['calfQuality'])}
                fullWidth
              >
                <MenuItem value="Good">Boa</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="Bad">Ruim</MenuItem>
              </TextField>
            </Box>

            <TextField
              id="weaningNotes"
              label="Observações do Desmame"
              multiline
              rows={3}
              value={formData.weaningNotes || ""}
              onChange={handleChange}
              fullWidth
            />
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button type="button" variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained">
          Atualizar
        </Button>
      </Box>
    </form>
  );
}