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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from '@mui/system';

// Para o DatePicker, você precisará instalar @mui/x-date-pickers
// npm install @mui/x-date-pickers date-fns (ou luxon, dayjs, moment)
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO, differenceInDays } from 'date-fns'; // Para formatação e cálculo de datas
import { ptBR } from 'date-fns/locale'; // Para localização em português

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface PregnancyManagementProps {
  cattle: Cattle[];
  onUpdatePregnancy: (cattle: Cattle) => void;
}

// Componente Badge simples para replicar o do shadcn/ui
const CustomPregnancyBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'pregnancyvariant',
})<{ pregnancyvariant: string }>(({ theme, pregnancyvariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[500], // Default color

  ...(pregnancyvariant === 'default' && {
    backgroundColor: theme.palette.success.main, // Verde para Prenhe
  }),
  ...(pregnancyvariant === 'secondary' && {
    backgroundColor: theme.palette.info.main, // Azul claro para Pariu Recentemente
  }),
  ...(pregnancyvariant === 'outline' && {
    backgroundColor: theme.palette.warning.main, // Laranja para Vazia
    color: theme.palette.getContrastText(theme.palette.warning.main),
    border: `1px solid ${theme.palette.warning.dark}`,
  }),
  ...(pregnancyvariant === 'destructive' && {
    backgroundColor: theme.palette.error.main, // Vermelho para Desconhecido
  }),
}));

export function PregnancyManagement({ cattle, onUpdatePregnancy }: PregnancyManagementProps) {
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtrar apenas fêmeas ativas para a gestão de prenhez
  const femaleCattle = cattle.filter((c) => c.sex === "Female" && c.status === "Active");

  const handleUpdatePregnancyData = (updatedData: Partial<Cattle>) => {
    if (selectedCattle) {
      const updatedCattle = { ...selectedCattle, ...updatedData };
      onUpdatePregnancy(updatedCattle);
      setIsDialogOpen(false);
      setSelectedCattle(null);
    }
  };

  const calculateDaysToCalving = (expectedDate: string) => {
    const today = new Date();
    const calving = parseISO(expectedDate); // Usar parseISO para strings ISO
    return differenceInDays(calving, today);
  };

  const getStatusColorVariant = (status?: string) => {
    switch (status) {
      case "Pregnant":
        return "default";
      case "Recently Calved":
        return "secondary";
      case "Empty":
        return "outline";
      case "Unknown":
        return "destructive";
      default:
        return "default";
    }
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ '& > :not(style)': { mb: 3 } }}> {/* Equivalente ao space-y-6 */}
        <Card>
          <CardHeader title={<Typography variant="h6">Gestão de Prenhez</Typography>} />
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }} aria-label="tabela de gestão de prenhez">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Brinco Nº</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Último Exame</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Parto Previsto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Dias para Parto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {femaleCattle.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                        Nenhuma fêmea ativa encontrada para gestão de prenhez.
                      </TableCell>
                    </TableRow>
                  ) : (
                    femaleCattle.map((cow) => {
                      const daysToCalving = cow.expectedCalvingDate
                        ? calculateDaysToCalving(cow.expectedCalvingDate)
                        : null;
                      return (
                        <TableRow key={cow.id}>
                          <TableCell sx={{ fontWeight: 'medium' }}>{cow.tagNumber}</TableCell>
                          <TableCell>{cow.name}</TableCell>
                          <TableCell>
                            <CustomPregnancyBadge pregnancyvariant={getStatusColorVariant(cow.reproductionStatus)}>
                              {translateReproductionStatus(cow.reproductionStatus)}
                            </CustomPregnancyBadge>
                          </TableCell>
                          <TableCell>{cow.lastPregnancyCheck || "Não examinada"}</TableCell>
                          <TableCell>{cow.expectedCalvingDate || "Não definido"}</TableCell>
                          <TableCell>
                            {daysToCalving !== null ? (
                              <Typography
                                component="span"
                                sx={{
                                  color: daysToCalving <= 30 && daysToCalving >= 0 ? 'error.main' : 'inherit', // Vermelho para <= 30 dias e não negativo
                                  fontWeight: daysToCalving <= 30 && daysToCalving >= 0 ? 'bold' : 'normal',
                                }}
                              >
                                {daysToCalving >= 0 ? `${daysToCalving} dias` : `Atrasado ${Math.abs(daysToCalving)} dias`}
                              </Typography>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              aria-label="editar prenhez"
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

        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Atualizar Status de Prenhez - {selectedCattle?.name}</DialogTitle>
          <DialogContent dividers> {/* Adiciona um divisor sob o título */}
            {selectedCattle && (
              <PregnancyForm
                cattle={selectedCattle}
                onSubmit={handleUpdatePregnancyData}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setSelectedCattle(null); // Limpar seleção ao cancelar
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

// --- Componente PregnancyForm (sub-componente) ---

interface PregnancyFormProps {
  cattle: Cattle;
  onSubmit: (data: Partial<Cattle>) => void;
  onCancel: () => void;
}

function PregnancyForm({ cattle, onSubmit, onCancel }: PregnancyFormProps) {
  const [formData, setFormData] = useState<Partial<Cattle>>({
    reproductionStatus: cattle.reproductionStatus || "Unknown",
    lastPregnancyCheck: cattle.lastPregnancyCheck || "",
    expectedCalvingDate: cattle.expectedCalvingDate || "",
    breedingDate: cattle.breedingDate || "",
    pregnancyNotes: cattle.pregnancyNotes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleDateChange = (id: string, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [id]: date ? format(date, 'yyyy-MM-dd') : '',
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ '& > :not(style)': { mb: 3 } }}> {/* Espaçamento entre os campos */}
        <TextField
          id="reproductionStatus"
          select
          label="Status Reprodutivo"
          value={formData.reproductionStatus}
          onChange={(e) => setFormData({ ...formData, reproductionStatus: e.target.value as Cattle['reproductionStatus'] })}
          fullWidth
        >
          <MenuItem value="Unknown">Desconhecido</MenuItem>
          <MenuItem value="Pregnant">Prenhe</MenuItem>
          <MenuItem value="Empty">Vazia</MenuItem>
          <MenuItem value="Recently Calved">Pariu Recentemente</MenuItem>
        </TextField>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <DatePicker
            label="Último Exame de Prenhez"
            value={formData.lastPregnancyCheck ? parseISO(formData.lastPregnancyCheck) : null}
            onChange={(date) => handleDateChange('lastPregnancyCheck', date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <DatePicker
            label="Data da Cobertura"
            value={formData.breedingDate ? parseISO(formData.breedingDate) : null}
            onChange={(date) => handleDateChange('breedingDate', date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Box>

        {formData.reproductionStatus === "Pregnant" && (
          <DatePicker
            label="Data Prevista do Parto"
            value={formData.expectedCalvingDate ? parseISO(formData.expectedCalvingDate) : null}
            onChange={(date) => handleDateChange('expectedCalvingDate', date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        )}

        <TextField
          id="pregnancyNotes"
          label="Observações da Prenhez"
          multiline
          rows={3}
          value={formData.pregnancyNotes}
          onChange={(e) => setFormData({ ...formData, pregnancyNotes: e.target.value })}
          fullWidth
        />
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