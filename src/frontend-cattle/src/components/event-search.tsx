"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Ícone de calendário
import { styled } from '@mui/system';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface EventSearchProps {
  cattle: Cattle[];
}

interface Event {
  id: string;
  cattleId: string;
  cattleName: string;
  tagNumber: string;
  type: string;
  date: string;
  description: string;
  details?: Record<string, any>; // Tipo mais específico para detalhes
}

// Componente Badge para replicar o do shadcn/ui
const CustomEventBadge = styled(Box)<{ eventtypevariant: string }>(({ theme, eventtypevariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[500], // Default fallback

  ...(eventtypevariant === 'default' && {
    backgroundColor: theme.palette.primary.main, // Nascimento, Cobertura
  }),
  ...(eventtypevariant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main, // Mudança de Status, Desmame
  }),
  ...(eventtypevariant === 'outline' && {
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: 'transparent', // Exame de Prenhez
  }),
}));

export function EventSearch({ cattle }: EventSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(""); // Formato yyyy-MM para mês e ano

  // Generate events from cattle data
  const generateEvents = useMemo(() => {
    const events: Event[] = [];

    cattle.forEach((cow) => {
      // Birth events
      events.push({
        id: `birth-${cow.id}`,
        cattleId: cow.id,
        cattleName: cow.name,
        tagNumber: cow.tagNumber,
        type: "Nascimento",
        date: cow.birthDate,
        description: `${cow.name} nasceu`,
        details: { Raça: cow.breed, Sexo: cow.sex === "Male" ? "Macho" : "Fêmea" },
      });

      // Status change events
      if (cow.statusChangeDate && cow.statusChangeReason) {
        const statusTranslation = {
          Active: "Ativo",
          Sold: "Vendido",
          Died: "Morreu",
          Butchered: "Abatido",
          Missing: "Desaparecido",
        };
        events.push({
          id: `status-${cow.id}`,
          cattleId: cow.id,
          cattleName: cow.name,
          tagNumber: cow.tagNumber,
          type: "Mudança de Status",
          date: cow.statusChangeDate,
          description: `Status alterado para ${statusTranslation[cow.status as keyof typeof statusTranslation]}`,
          details: {
            "Novo Status": statusTranslation[cow.status as keyof typeof statusTranslation],
            "Status Anterior": cow.previousStatus
              ? statusTranslation[cow.previousStatus as keyof typeof statusTranslation]
              : "N/A",
            Motivo: cow.statusChangeReason,
          },
        });
      }

      // Pregnancy check events
      if (cow.lastPregnancyCheck) {
        const reproductionTranslation = {
          Pregnant: "Prenhe",
          "Recently Calved": "Pariu Recentemente",
          Empty: "Vazia",
          Unknown: "Desconhecido",
        };
        events.push({
          id: `pregnancy-${cow.id}`,
          cattleId: cow.id,
          cattleName: cow.name,
          tagNumber: cow.tagNumber,
          type: "Exame de Prenhez",
          date: cow.lastPregnancyCheck,
          description: `Exame de prenhez - ${reproductionTranslation[cow.reproductionStatus as keyof typeof reproductionTranslation] || "Desconhecido"}`,
          details: {
            Status: reproductionTranslation[cow.reproductionStatus as keyof typeof reproductionTranslation],
            "Parto Previsto": cow.expectedCalvingDate || "N/A",
          },
        });
      }

      // Breeding events
      if (cow.breedingDate) {
        events.push({
          id: `breeding-${cow.id}`,
          cattleId: cow.id,
          cattleName: cow.name,
          tagNumber: cow.tagNumber,
          type: "Cobertura",
          date: cow.breedingDate,
          description: `${cow.name} foi coberta`,
          details: { "Parto Previsto": cow.expectedCalvingDate || "N/A" },
        });
      }

      // Weaning events
      if (cow.weaningDate) {
        const qualityTranslation = {
          Good: "Boa",
          Normal: "Normal",
          Bad: "Ruim",
        };
        events.push({
          id: `weaning-${cow.id}`,
          cattleId: cow.id,
          cattleName: cow.name,
          tagNumber: cow.tagNumber,
          type: "Desmame",
          date: cow.weaningDate,
          description: `${cow.name} foi desmamado`,
          details: {
            Peso: cow.weaningWeight ? `${cow.weaningWeight} kg` : "N/A",
            Idade: cow.weaningAge ? `${cow.weaningAge} dias` : "N/A",
            Qualidade: qualityTranslation[cow.calfQuality as keyof typeof qualityTranslation] || "N/A",
          },
        });
      }
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cattle]); // Recalcula eventos apenas se 'cattle' mudar

  const filteredEvents = generateEvents.filter((event) => {
    const matchesSearch =
      event.cattleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = eventTypeFilter === "all" || event.type === eventTypeFilter;
    const matchesDate = !dateFilter || event.date.startsWith(dateFilter); // dateFilter é 'yyyy-MM'

    return matchesSearch && matchesType && matchesDate;
  });

  const eventTypes = useMemo(() => {
    const types = [...new Set(generateEvents.map((e) => e.type))];
    return types;
  }, [generateEvents]); // Recalcula tipos de evento apenas se 'generateEvents' mudar

  const getEventColorVariant = (type: string) => {
    switch (type) {
      case "Nascimento":
        return "default";
      case "Mudança de Status":
        return "secondary";
      case "Exame de Prenhez":
        return "outline";
      case "Cobertura":
        return "default";
      case "Desmame":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDateToLocale = (dateString: string) => {
    try {
      if (!dateString) return "-";
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", dateString, error);
      return dateString; // Retorna a string original se houver erro
    }
  };

  return (
    <Card>
      <CardHeader>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Busca de Eventos e Cronologia
        </Typography>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar eventos..."
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
            label="Tipo de Evento"
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          >
            <MenuItem value="all">Todos os Eventos</MenuItem>
            {eventTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="month"
            label="Filtrar por Mês"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{
              shrink: true, // Garante que o label encolha ao selecionar a data
            }}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          />
        </Box>
      </CardHeader>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredEvents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography variant="body1">Nenhum evento encontrado com os critérios especificados.</Typography>
            </Box>
          ) : (
            filteredEvents.map((event) => (
              <Box key={event.id} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CustomEventBadge eventtypevariant={getEventColorVariant(event.type)}>{event.type}</CustomEventBadge>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {event.cattleName} ({event.tagNumber})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <CalendarTodayIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{formatDateToLocale(event.date)}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{event.description}</Typography>
                {event.details && Object.keys(event.details).length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {Object.entries(event.details).map(([key, value]) => (
                      <Typography key={key} variant="caption" color="text.secondary">
                        <Typography component="span" sx={{ fontWeight: 'bold' }}>{key}:</Typography> {value}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
}