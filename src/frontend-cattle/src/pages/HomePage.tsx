"use client";

import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { StatsCards } from "../components/stats-cards";
import { StatusSummary } from "../components/status-summary";
import { FertilityAnalysis } from "../components/fertility-analysis";
import { CattleForm } from "../components/cattle-form";

export type DefectType =
  | "abortion"
  | "violent"
  | "leaps"
  | "cancer"
  | "rotten hoof"
  | "milkless"
  | "bad mother"
  | "wart"
  | "depigmented"
  | "prolapse";

export interface Cattle {
  id: string;
  name: string;
  tagNumber: string;
  breed: string;
  sex: "Male" | "Female";
  birthDate: string;
  weight: number;
  motherId?: string;
  motherName?: string;
  fatherId?: string;
  fatherName?: string;
  notes?: string;
  status: "Active" | "Sold" | "Died" | "Butchered" | "Missing";
  defects?: DefectType[];
  defectNotes?: string;
  statusChangeDate?: string;
  statusChangeReason?: string;
  previousStatus?: string;
  reproductionStatus?: "Unknown" | "Pregnant" | "Empty" | "Recently Calved";
  lastPregnancyCheck?: string;
  expectedCalvingDate?: string;
  breedingDate?: string;
  pregnancyNotes?: string;
  isWeaned?: boolean;
  weaningDate?: string;
  weaningWeight?: number;
  weaningAge?: number;
  calfQuality?: "Good" | "Normal" | "Bad";
  weaningNotes?: string;
}

interface HomePageContentProps {
  cattle: Cattle[];
  handleAddCattle: (newCattle: Omit<Cattle, "id">) => void;
  handleUpdateCattle: (updatedCattle: Cattle) => void;
  handleDeleteCattle: (id: string) => void;
}

function HomePageContent({ cattle, handleAddCattle, handleUpdateCattle, handleDeleteCattle }: HomePageContentProps) {
  // Removed local cattle state since the data is now passed as props.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);

  const handleEditCattle = (cattleToEdit: Cattle) => {
    setEditingCattle(cattleToEdit);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (cattleData: Cattle | Omit<Cattle, "id">) => {
    if ("id" in cattleData) {
      handleUpdateCattle(cattleData);
    } else {
      handleAddCattle(cattleData);
    }
    setIsFormOpen(false);
    setEditingCattle(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCattle(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box component="main" sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Painel de Controle
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie seu rebanho de forma eficiente
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsFormOpen(true)}>
            Adicionar Gado
          </Button>
        </Box>

        <Box sx={{ "& > :not(style)": { mb: 3 } }}>
          <StatsCards cattle={cattle} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
            <StatusSummary cattle={cattle} />
            <FertilityAnalysis cattle={cattle} />
          </Box>
        </Box>

        <Dialog open={isFormOpen} onClose={handleFormCancel} maxWidth="md" fullWidth>
          <DialogTitle>{editingCattle ? "Editar" : "Adicionar"} Gado</DialogTitle>
          <DialogContent>
            <CattleForm
              cattle={cattle}
              initialData={editingCattle}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default HomePageContent;