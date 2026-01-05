import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/common/PageHeader';
import { adminAppointmentsApi, adminFranchiseesApi, warehousesApi } from '../../services/api';
import { Appointment, AppointmentType, Franchisee, Warehouse } from '../../types/api';

interface FiltersState {
  from: string;
  to: string;
  type?: AppointmentType;
  warehouseId?: string;
}

const AdminAppointmentsPage = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [franchisees, setFranchisees] = React.useState<Franchisee[]>([]);
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [filters, setFilters] = React.useState<FiltersState>({ from: '', to: '' });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const franchiseeMap = React.useMemo(() => new Map(franchisees.map((franchisee) => [franchisee.id, franchisee])), [franchisees]);
  const warehouseMap = React.useMemo(() => new Map(warehouses.map((warehouse) => [warehouse.id, warehouse])), [warehouses]);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = {
        from: filters.from || undefined,
        to: filters.to || undefined,
        type: filters.type,
        warehouseId: filters.warehouseId ? Number(filters.warehouseId) : undefined,
      };
      const [appointmentsResponse, franchiseesResponse, warehousesResponse] = await Promise.all([
        adminAppointmentsApi.list(apiFilters),
        adminFranchiseesApi.list(),
        warehousesApi.list(),
      ]);
      setAppointments(appointmentsResponse);
      setFranchisees(franchiseesResponse);
      setWarehouses(warehousesResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('backoffice.appointments.errors.load'));
    } finally {
      setIsLoading(false);
    }
  }, [filters, t]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChangePage = (_: unknown, newPage: number): void => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: keyof FiltersState, value: string): void => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const formatDate = (isoDate: string): string =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoDate));

  const paginatedAppointments = React.useMemo(() => {
    const start = page * rowsPerPage;
    return appointments.slice(start, start + rowsPerPage);
  }, [appointments, page, rowsPerPage]);

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('backoffice.appointments.title')}
          caption={t('backoffice.appointments.subtitle')}
          backLabel={t('common.back')}
          onBack={() => window.history.back()}
          actions={
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={isLoading}>
              {t('common.refresh')}
            </Button>
          }
        />

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              type="date"
              label={t('backoffice.appointments.filters.from')}
              InputLabelProps={{ shrink: true }}
              value={filters.from}
              onChange={(event) => handleFilterChange('from', event.target.value)}
              fullWidth
            />
            <TextField
              type="date"
              label={t('backoffice.appointments.filters.to')}
              InputLabelProps={{ shrink: true }}
              value={filters.to}
              onChange={(event) => handleFilterChange('to', event.target.value)}
              fullWidth
            />
            <TextField
              select
              label={t('backoffice.appointments.filters.type')}
              value={filters.type ?? ''}
              onChange={(event) => handleFilterChange('type', event.target.value)}
              fullWidth
            >
              <MenuItem value="">
                <em>{t('common.notProvided')}</em>
              </MenuItem>
              <MenuItem value="SUPPLY_PICKUP">{t('appointments.typeOptions.SUPPLY_PICKUP')}</MenuItem>
              <MenuItem value="TRUCK_PICKUP">{t('appointments.typeOptions.TRUCK_PICKUP')}</MenuItem>
            </TextField>
            <TextField
              select
              label={t('backoffice.appointments.filters.warehouse')}
              value={filters.warehouseId ?? ''}
              onChange={(event) => handleFilterChange('warehouseId', event.target.value)}
              fullWidth
            >
              <MenuItem value="">
                <em>{t('common.notProvided')}</em>
              </MenuItem>
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={String(warehouse.id)}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center" py={4}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {t('backoffice.appointments.loading')}
            </Typography>
          </Stack>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('backoffice.appointments.table.datetime')}</TableCell>
                    <TableCell>{t('backoffice.appointments.table.type')}</TableCell>
                    <TableCell>{t('backoffice.appointments.table.warehouse')}</TableCell>
                    <TableCell>{t('backoffice.appointments.table.franchisee')}</TableCell>
                    <TableCell>{t('backoffice.appointments.table.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAppointments.map((appointment) => {
                    const franchisee = appointment.franchiseeId ? franchiseeMap.get(appointment.franchiseeId) : undefined;
                    const warehouse = appointment.warehouseId ? warehouseMap.get(appointment.warehouseId) : undefined;
                    return (
                      <TableRow key={appointment.id} hover>
                        <TableCell>{formatDate(appointment.datetime)}</TableCell>
                        <TableCell>
                          <Chip label={t(`appointments.typeOptions.${appointment.type}`)} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{warehouse ? warehouse.name : t('common.notProvided')}</TableCell>
                        <TableCell>
                          {franchisee ? (
                            <Stack>
                              <Typography variant="body2">{franchisee.companyName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {franchisee.firstName} {franchisee.lastName} · {franchisee.phone ?? franchisee.email}
                              </Typography>
                            </Stack>
                          ) : (
                            t('common.notProvided')
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={t(`appointments.statusOptions.${appointment.status}`)} size="small" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedAppointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {t('backoffice.appointments.empty')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={appointments.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage={t('common.rowsPerPage')}
            />
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AdminAppointmentsPage;
