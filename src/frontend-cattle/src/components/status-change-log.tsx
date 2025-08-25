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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description'; // Substitui FileText
import { styled } from '@mui/system';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importe o tipo Cattle da sua definição central
import type { Cattle } from '../pages/HomePage'; // Ajuste o caminho conforme a localização do seu tipo Cattle

interface StatusChangeLogProps {
  cattle: Cattle[];
}

// Componente Badge para replicar o do shadcn/ui
const CustomStatusChangeBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'badgevariant',
})<{ badgevariant?: string }>(({ theme, badgevariant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[500], // Default fallback

  // Cores para o Status (mesmo do StatusSummary)
  ...(badgevariant === 'default' && {
    backgroundColor: theme.palette.primary.main, // Ativo, Inicial, Reativado
  }),
  ...(badgevariant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main, // Vendido, Venda
  }),
  ...(badgevariant === 'destructive' && {
    backgroundColor: theme.palette.error.main, // Morreu, Desaparecido, Óbito, Perda
  }),
  ...(badgevariant === 'outline' && {
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: 'transparent', // Abatido
  }),
}));


export function StatusChangeLog({ cattle }: StatusChangeLogProps) {
  // Filter cattle that have status change information
  const statusChanges = cattle
    .filter((c) => c.statusChangeDate && c.statusChangeReason)
    .sort((a, b) => parseISO(b.statusChangeDate!).getTime() - parseISO(a.statusChangeDate!).getTime());

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
        return "outline";
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

  const formatDateToLocale = (dateString: string) => {
    try {
      if (!dateString) return "-";
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", dateString, error);
      return dateString;
    }
  };

  const getChangeType = (current: string, previous?: string) => {
    if (!previous) return "Inicial";
    if (current === "Active") return "Reativado";
    if (current === "Sold") return "Venda";
    if (current === "Died") return "Óbito";
    if (current === "Butchered") return "Abate";
    if (current === "Missing") return "Perda";
    return "Mudança de Status";
  };

  const getChangeTypeColorVariant = (changeType: string) => {
    switch (changeType) {
      case "Inicial":
        return "default";
      case "Reativado":
        return "default";
      case "Venda":
        return "secondary";
      case "Óbito":
        return "destructive";
      case "Abate":
        return "outline";
      case "Perda":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Group by month for summary
  const monthlyStats = statusChanges.reduce(
    (acc, cattle) => {
      const month = cattle.statusChangeDate!.substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, byStatus: {} as Record<string, number> };
      }
      acc[month].total++;
      acc[month].byStatus[cattle.status] = (acc[month].byStatus[cattle.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, { total: number; byStatus: Record<string, number> }>,
  );

  const currentMonth = format(new Date(), 'yyyy-MM');


  return (
    <Box sx={{ '& > :not(style)': { mb: 3 } }}> {/* Equivalente ao space-y-6 */}
      {/* Cards de Resumo */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // 1 coluna em telas extra pequenas (mobile)
            md: 'repeat(2, 1fr)', // 2 colunas em telas médias (tablet)
            lg: 'repeat(4, 1fr)', // 4 colunas em telas grandes (desktop)
          },
          gap: 2, // Equivalente ao gap-4
        }}
      >
        <Card>
          <CardHeader title={<Typography variant="subtitle2" color="text.secondary">Total de Mudanças</Typography>} sx={{ pb: 1 }} />
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{statusChanges.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={<Typography variant="subtitle2" color="text.secondary">Este Mês</Typography>} sx={{ pb: 1 }} />
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {monthlyStats[currentMonth]?.total || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={<Typography variant="subtitle2" color="text.secondary">Vendas Recentes</Typography>} sx={{ pb: 1 }} />
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{statusChanges.filter((c) => c.status === "Sold").length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={<Typography variant="subtitle2" color="text.secondary">Perdas</Typography>} sx={{ pb: 1 }} />
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {statusChanges.filter((c) => c.status === "Died" || c.status === "Missing").length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Histórico de Mudanças de Status */}
      <Card>
        <CardHeader title={<Typography variant="h6">Histórico de Mudanças de Status</Typography>} />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 800 }} aria-label="tabela de histórico de status">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Brinco Nº</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Mudança</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>De</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Para</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statusChanges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                      Nenhuma mudança de status registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  statusChanges.map((cattle) => {
                    const changeType = getChangeType(cattle.status, cattle.previousStatus);
                    return (
                      <TableRow key={`${cattle.id}-${cattle.statusChangeDate}`}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <CalendarTodayIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2">{formatDateToLocale(cattle.statusChangeDate!)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{cattle.tagNumber}</TableCell>
                        <TableCell>{cattle.name}</TableCell>
                        <TableCell>
                          <CustomStatusChangeBadge badgevariant={getChangeTypeColorVariant(changeType)}>
                            {changeType}
                          </CustomStatusChangeBadge>
                        </TableCell>
                        <TableCell>
                          {cattle.previousStatus ? (
                            <CustomStatusChangeBadge badgevariant={getStatusColorVariant(cattle.previousStatus)}>
                              {translateStatus(cattle.previousStatus)}
                            </CustomStatusChangeBadge>
                          ) : (
                            <Typography component="span" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <CustomStatusChangeBadge badgevariant={getStatusColorVariant(cattle.status)}>
                            {translateStatus(cattle.status)}
                          </CustomStatusChangeBadge>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, maxWidth: 250 }}> {/* max-w-xs */}
                            <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5, flexShrink: 0 }} />
                            <Typography variant="body2">{cattle.statusChangeReason}</Typography>
                          </Box>
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

      {/* Resumo Mensal */}
      {Object.keys(monthlyStats).length > 0 && (
        <Card>
          <CardHeader title={<Typography variant="h6">Resumo Mensal</Typography>} />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}> {/* Equivalente ao space-y-4 */}
              {Object.entries(monthlyStats)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6) // Mostra os últimos 6 meses
                .map(([month, stats]) => (
                  <Box key={month} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: ptBR, /* capitalize: true */ })} {/* Para o mês com primeira letra maiúscula */}
                      </Typography>
                      <CustomStatusChangeBadge badgevariant="outline">
                        {stats.total} mudanças
                      </CustomStatusChangeBadge>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}> {/* Equivalente ao flex flex-wrap gap-2 */}
                      {Object.entries(stats.byStatus).map(([status, count]) => (
                        <CustomStatusChangeBadge key={status} badgevariant={getStatusColorVariant(status)}>
                          {translateStatus(status)}: {count}
                        </CustomStatusChangeBadge>
                      ))}
                    </Box>
                  </Box>
                ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}