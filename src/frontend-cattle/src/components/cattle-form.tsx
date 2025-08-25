"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
} from "@mui/material";
// Para o DatePicker, você precisará instalar @mui/x-date-pickers
// npm install @mui/x-date-pickers date-fns (ou luxon, dayjs, moment)
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns'; // Para formatação de datas
import { ptBR } from 'date-fns/locale'; // Para localização em português


// Importe seus tipos Cattle e DefectType
import type { Cattle, DefectType } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface CattleFormProps {
  cattle: Cattle[];
  initialData?: Cattle | null;
  onSubmit: (cattle: Cattle | Omit<Cattle, "id">) => void;
  onCancel: () => void;
}

const defectOptions: DefectType[] = [
  "abortion",
  "violent",
  "leaps",
  "cancer",
  "rotten hoof",
  "milkless",
  "bad mother",
  "wart",
  "depigmented",
  "prolapse",
];

const defectTranslations = {
  abortion: "aborto",
  violent: "violento",
  leaps: "pula",
  cancer: "câncer",
  "rotten hoof": "casco podre",
  milkless: "sem leite",
  "bad mother": "mãe ruim",
  wart: "verruga",
  depigmented: "despigmentado",
  prolapse: "prolapso",
};

export function CattleForm({ cattle, initialData, onSubmit, onCancel }: CattleFormProps) {
  const [formData, setFormData] = useState<Partial<Cattle>>({
    name: "",
    tagNumber: "",
    breed: "",
    sex: "Female",
    birthDate: "",
    weight: 0,
    status: "Active",
    notes: "",
    defects: [],
    defectNotes: "",
    reproductionStatus: "Unknown",
    isWeaned: false,
    ...initialData,
  });

  const [activeTab, setActiveTab] = useState(0); // 0 para "basic", 1 para "reproduction", etc.

  useEffect(() => {
    if (initialData) {
      // Ajustar o formato da data para o DatePicker se necessário
      setFormData({
        ...initialData,
        birthDate: initialData.birthDate ? format(parseISO(initialData.birthDate), 'yyyy-MM-dd') : '',
        lastPregnancyCheck: initialData.lastPregnancyCheck ? format(parseISO(initialData.lastPregnancyCheck), 'yyyy-MM-dd') : '',
        breedingDate: initialData.breedingDate ? format(parseISO(initialData.breedingDate), 'yyyy-MM-dd') : '',
        expectedCalvingDate: initialData.expectedCalvingDate ? format(parseISO(initialData.expectedCalvingDate), 'yyyy-MM-dd') : '',
        weaningDate: initialData.weaningDate ? format(parseISO(initialData.weaningDate), 'yyyy-MM-dd') : '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      statusChangeDate: initialData ? formData.statusChangeDate : format(new Date(), 'yyyy-MM-dd'),
      statusChangeReason: initialData ? formData.statusChangeReason : "Registro inicial",
    };

    if (initialData) {
      onSubmit(submissionData as Cattle);
    } else {
      onSubmit(submissionData as Omit<Cattle, "id">);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { id, value, type, checked } = target;
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

  const handleDefectChange = (defect: DefectType, checked: boolean) => {
    const currentDefects = formData.defects || [];
    if (checked) {
      setFormData({ ...formData, defects: [...currentDefects, defect] });
    } else {
      setFormData({ ...formData, defects: currentDefects.filter((d) => d !== defect) });
    }
  };

  const availableParents = cattle.filter(
    (c) => c.id !== formData.id && c.status === "Active" && (formData.birthDate ? new Date(c.birthDate) < new Date(formData.birthDate) : true),
  );

  const availableMothers = availableParents.filter((c) => c.sex === "Female");
  const availableFathers = availableParents.filter((c) => c.sex === "Male");

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ width: '100%', mb: 4 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="abas de formulário de gado" variant="fullWidth">
            <Tab label="Info Básica" />
            <Tab label="Reprodução" disabled={formData.sex === "Male"} /> {/* Desabilita se for macho */}
            <Tab label="Desmame" />
            <Tab label="Saúde" />
          </Tabs>
        </Box>

        {activeTab === 0 && ( // Info Básica
          <Card sx={{ mb: 4 }}>
            <CardHeader title={<Typography variant="h6">Informações Básicas</Typography>} />
            <CardContent sx={{ '& > :not(style)': { mb: 3 } }}> {/* Espaçamento entre as seções */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  id="name"
                  label="Nome"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <TextField
                  id="tagNumber"
                  label="Número do Brinco"
                  value={formData.tagNumber || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                <TextField
                  id="breed"
                  label="Raça"
                  value={formData.breed || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <TextField
                  id="sex"
                  select
                  label="Sexo"
                  value={formData.sex || "Female"}
                  onChange={(e) => handleSelectChange('sex', e.target.value as "Male" | "Female")}
                  fullWidth
                >
                  <MenuItem value="Male">Macho</MenuItem>
                  <MenuItem value="Female">Fêmea</MenuItem>
                </TextField>
                <TextField
                  id="status"
                  select
                  label="Status"
                  value={formData.status || "Active"}
                  onChange={(e) => handleSelectChange('status', e.target.value as Cattle['status'])}
                  fullWidth
                >
                  <MenuItem value="Active">Ativo</MenuItem>
                  <MenuItem value="Sold">Vendido</MenuItem>
                  <MenuItem value="Died">Morreu</MenuItem>
                  <MenuItem value="Butchered">Abatido</MenuItem>
                  <MenuItem value="Missing">Desaparecido</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <DatePicker
                  label="Data de Nascimento"
                  value={formData.birthDate ? parseISO(formData.birthDate) : null}
                  onChange={(date) => handleDateChange('birthDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <TextField
                  id="weight"
                  label="Peso (kg)"
                  type="number"
                  value={formData.weight || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  id="motherId"
                  select
                  label="Mãe"
                  value={formData.motherId || "none"}
                  onChange={(e) => {
                    const value = e.target.value;
                    const mother = availableMothers.find((c) => c.id === value);
                    setFormData({
                      ...formData,
                      motherId: value === "none" ? undefined : value,
                      motherName: mother?.name || undefined,
                    });
                  }}
                  fullWidth
                >
                  <MenuItem value="none">Nenhuma mãe selecionada</MenuItem>
                  {availableMothers.map((cow) => (
                    <MenuItem key={cow.id} value={cow.id}>
                      {cow.name} ({cow.tagNumber})
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  id="fatherId"
                  select
                  label="Pai"
                  value={formData.fatherId || "none"}
                  onChange={(e) => {
                    const value = e.target.value;
                    const father = availableFathers.find((c) => c.id === value);
                    setFormData({
                      ...formData,
                      fatherId: value === "none" ? undefined : value,
                      fatherName: father?.name || undefined,
                    });
                  }}
                  fullWidth
                >
                  <MenuItem value="none">Nenhum pai selecionado</MenuItem>
                  {availableFathers.map((cow) => (
                    <MenuItem key={cow.id} value={cow.id}>
                      {cow.name} ({cow.tagNumber})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                id="notes"
                label="Observações"
                multiline
                rows={3}
                value={formData.notes || ""}
                onChange={handleChange}
                fullWidth
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 1 && ( // Reprodução
          <Card sx={{ mb: 4 }}>
            <CardHeader title={<Typography variant="h6">Informações de Reprodução</Typography>} />
            <CardContent sx={{ '& > :not(style)': { mb: 3 } }}>
              <TextField
                id="reproductionStatus"
                select
                label="Status Reprodutivo"
                value={formData.reproductionStatus || "Unknown"}
                onChange={(e) => handleSelectChange('reproductionStatus', e.target.value as Cattle['reproductionStatus'])}
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
                value={formData.pregnancyNotes || ""}
                onChange={handleChange}
                fullWidth
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && ( // Desmame
          <Card sx={{ mb: 4 }}>
            <CardHeader title={<Typography variant="h6">Informações de Desmame</Typography>} />
            <CardContent sx={{ '& > :not(style)': { mb: 3 } }}>
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
                      value={formData.calfQuality || "none"}
                      onChange={(e) => handleSelectChange('calfQuality', e.target.value as Cattle['calfQuality'])}
                      fullWidth
                    >
                      <MenuItem value="none">Selecionar qualidade</MenuItem>
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
            </CardContent>
          </Card>
        )}

        {activeTab === 3 && ( // Saúde
          <Card sx={{ mb: 4 }}>
            <CardHeader title={<Typography variant="h6">Saúde e Defeitos</Typography>} />
            <CardContent sx={{ '& > :not(style)': { mb: 3 } }}>
              <Typography variant="subtitle1" gutterBottom>
                Defeitos
              </Typography>
              <FormGroup sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                {defectOptions.map((defect) => (
                  <FormControlLabel
                    key={defect}
                    control={
                      <Checkbox
                        id={defect}
                        checked={formData.defects?.includes(defect) || false}
                        onChange={(e) => handleDefectChange(defect, e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{defectTranslations[defect]}</Typography>}
                  />
                ))}
              </FormGroup>

              <TextField
                id="defectNotes"
                label="Observações dos Defeitos"
                multiline
                rows={3}
                value={formData.defectNotes || ""}
                onChange={handleChange}
                fullWidth
              />
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained">
            {initialData ? "Atualizar" : "Adicionar"} Gado
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
}