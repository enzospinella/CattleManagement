// src/App.tsx
"use client";

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material"; // Assuming you're using Box from MUI

// Importações dos seus layouts e páginas/componentes
import MainLayout from './layouts/MainLayout';
import HomePageContent from './pages/HomePage';

// Importe seus componentes de rota
import { CattleList } from './components/cattle-list';
import { PregnancyManagement } from './components/pragnancy-management';
import { WeaningManagement } from './components/weaning-management';
import { WeightManagement } from './components/weight-management';
import { MaternalHistory } from './components/maternal-history';
import { FirstCalvingAnalysis } from './components/first-calving-analysis';
import { WeaningWeightIntegration } from './components/weaning-weight-integration';
import { EventSearch } from './components/event-search';
import { StatusChangeLog } from './components/status-change-log';

// Seus tipos (melhor se estivessem em um arquivo types.ts separado)
export type DefectType =
  | "abortion" | "violent" | "leaps" | "cancer" | "rotten hoof" | "milkless"
  | "bad mother" | "wart" | "depigmented" | "prolapse";

export interface Cattle {
  id: string; name: string; tagNumber: string; breed: string;
  sex: "Male" | "Female"; birthDate: string; weight: number;
  motherId?: string; motherName?: string; fatherId?: string; fatherName?: string;
  notes?: string; status: "Active" | "Sold" | "Died" | "Butchered" | "Missing";
  defects?: DefectType[]; defectNotes?: string; statusChangeDate?: string;
  statusChangeReason?: string; previousStatus?: string;
  reproductionStatus?: "Unknown" | "Pregnant" | "Empty" | "Recently Calved";
  lastPregnancyCheck?: string; expectedCalvingDate?: string; breedingDate?: string;
  pregnancyNotes?: string; isWeaned?: boolean; weaningDate?: string;
  weaningWeight?: number; weaningAge?: number; calfQuality?: "Good" | "Normal" | "Bad";
  weaningNotes?: string;
}

// Dados de exemplo
const sampleCattle: Cattle[] = [
  { id: "1", name: "Estrela", tagNumber: "001", breed: "Nelore", sex: "Female", birthDate: "2020-03-15", weight: 450, status: "Active", reproductionStatus: "Pregnant", expectedCalvingDate: "2024-08-15", lastPregnancyCheck: "2024-01-15", breedingDate: "2023-11-15", notes: "Vaca de boa linhagem, primeira cria aos 24 meses" },
  { id: "2", name: "Touro Forte", tagNumber: "002", breed: "Angus", sex: "Male", birthDate: "2019-05-20", weight: 650, status: "Active", notes: "Reprodutor principal do rebanho" },
  { id: "3", name: "Bezerro da Estrela", tagNumber: "003", breed: "Nelore", sex: "Male", birthDate: "2023-08-20", weight: 180, status: "Active", motherId: "1", motherName: "Estrela", fatherId: "2", fatherName: "Touro Forte", isWeaned: true, weaningDate: "2024-01-20", weaningWeight: 160, weaningAge: 153, calfQuality: "Good", weaningNotes: "Desmame realizado com sucesso" },
  { id: "4", name: "Morena", tagNumber: "004", breed: "Brahman", sex: "Female", birthDate: "2021-01-10", weight: 420, status: "Active", reproductionStatus: "Empty", lastPregnancyCheck: "2024-01-10", notes: "Necessita nova cobertura" },
  { id: "5", name: "Vendida 2023", tagNumber: "005", breed: "Nelore", sex: "Female", birthDate: "2020-07-12", weight: 380, status: "Sold", statusChangeDate: "2023-12-15", statusChangeReason: "Venda para outro produtor", previousStatus: "Active" },
];

function App() {
  const [cattle, setCattle] = useState<Cattle[]>(sampleCattle);

  const handleAddCattle = (newCattle: Omit<Cattle, "id">) => {
    const newId = Date.now().toString();
    const cattleToAdd: Cattle = { ...newCattle, id: newId };
    setCattle((prev) => [...prev, cattleToAdd]);
  };

  const handleUpdateCattle = (updatedCattle: Cattle) => {
    setCattle((prev) => prev.map((c) => (c.id === updatedCattle.id ? updatedCattle : c)));
  };

  const handleDeleteCattle = (id: string) => {
    setCattle((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Router> {/* This is the crucial wrapper */}
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route
            path="dashboard"
            element={
              <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
                <HomePageContent
                  cattle={cattle}
                  handleAddCattle={handleAddCattle}
                  handleUpdateCattle={handleUpdateCattle}
                  handleDeleteCattle={handleDeleteCattle}
                />
              </Box>
            }
          />

          <Route
            path="cattle"
            element={
              <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
                <CattleList
                  cattle={cattle}
                  onEdit={() => {
                    // Logic to open edit form (e.g., navigate to dashboard with item ID, or open a separate modal)
                    console.log("Edit from CattleList initiated. Consider linking to the form.");
                  }}
                  onDelete={handleDeleteCattle}
                />
              </Box>
            }
          />
          <Route
            path="pregnancy"
            element={
              <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
                <PregnancyManagement cattle={cattle} onUpdatePregnancy={handleUpdateCattle} />
              </Box>
            }
          />
          <Route
            path="weaning"
            element={
              <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
                <WeaningManagement cattle={cattle} onUpdateWeaning={handleUpdateCattle} />
              </Box>
            }
          />
          <Route
            path="weight"
            element={
              <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
                <WeightManagement cattle={cattle} onUpdateWeight={handleUpdateCattle} />
              </Box>
            }
          />
          <Route
            path="maternal"
            element={
              <Box sx={{ "& > :not(style)": { mb: 3 }, p: 4, maxWidth: "1200px", mx: "auto" }}>
                <MaternalHistory cattle={cattle} />
                <FirstCalvingAnalysis cattle={cattle} />
                <WeaningWeightIntegration cattle={cattle} />
              </Box>
            }
          />
          <Route
            path="events"
            element={
              <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
                <EventSearch cattle={cattle} />
              </Box>
            }
          />
          <Route
            path="reports"
            element={
              <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
                <StatusChangeLog cattle={cattle} />
              </Box>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;