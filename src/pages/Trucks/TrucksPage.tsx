import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/common/PageHeader';
import { adminFranchiseesApi, adminTrucksApi, warehousesApi } from '../../services/api';
import { Franchisee, Truck, TruckCreatePayload, TruckPatch, TruckStatus, Warehouse } from '../../types/api';

interface TruckFormState {
  plateNumber: string;
  currentWarehouseId: string;
  status: TruckStatus;
  name?: string;
}

const defaultFormState: TruckFormState = {
  plateNumber: '',
  currentWarehouseId: '',
  status: 'IN_SERVICE',
  name: '',
};

const TrucksPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const [trucks, setTrucks] = React.useState<Truck[]>([]);
  const [franchisees, setFranchisees] = React.useState<Franchisee[]>([]);
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isCreateDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<TruckFormState>(defaultFormState);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [trucksResponse, franchiseesResponse, warehousesResponse] = await Promise.all([
        adminTrucksApi.list(),
        adminFranchiseesApi.list(),
        warehousesApi.list(),
      ]);
      setTrucks(trucksResponse);
      setFranchisees(franchiseesResponse);
      setWarehouses(warehousesResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChangePage = (_: unknown, newPage: number): void => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreateDialog = (): void => {
    setFormState(defaultFormState);
    setFormError(null);
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = (): void => {
    setCreateDialogOpen(false);
  };

  const handleFormChange = (field: keyof TruckFormState) => (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>): void => {
    const value = event.target.value as string;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleCreateTruck = async (): Promise<void> => {
    if (!formState.plateNumber.trim() || !formState.currentWarehouseId) {
      setFormError(t('backoffice.trucks.create.validation.required'));
      return;
    }
    const payload: TruckCreatePayload = {
      plateNumber: formState.plateNumber.trim(),
      currentWarehouseId: Number(formState.currentWarehouseId),
      status: formState.status,
      name: formState.name?.trim() || undefined,
    };
    setIsSubmitting(true);
    try {
      await adminTrucksApi.create(payload);
      handleCloseDialog();
      await loadData();
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : String(createError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignFranchisee = async (truckId: number, franchiseeId: number): Promise<void> => {
    try {
      await adminTrucksApi.update(truckId, { assignedFranchiseeId: franchiseeId });
      await loadData();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : String(assignError));
    }
  };

  const handleUnassignFranchisee = async (truckId: number): Promise<void> => {
    try {
      await adminTrucksApi.update(truckId, { assignedFranchiseeId: null, status: 'IN_SERVICE' });
      await loadData();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : String(assignError));
    }
  };

  const handleWarehouseChange = async (truckId: number, warehouseId: number): Promise<void> => {
    try {
      await adminTrucksApi.update(truckId, { currentWarehouseId: warehouseId });
      await loadData();
    } catch (warehouseError) {
      setError(warehouseError instanceof Error ? warehouseError.message : String(warehouseError));
    }
  };

  const getAssignedFranchiseeLabel = (franchiseeId: number): string => {
    const franchisee = franchisees.find((candidate) => candidate.id === franchiseeId);
    if (franchisee) {
      return `${franchisee.firstName} ${franchisee.lastName}`.trim();
    }
    return t('backoffice.trucks.assignedLabel', { id: franchiseeId });
  };

  const sortedTrucks = React.useMemo(() => {
    return [...trucks].sort((a, b) => {
      const aAssigned = Boolean(a.assignedFranchiseeId);
      const bAssigned = Boolean(b.assignedFranchiseeId);
      if (aAssigned !== bAssigned) {
        return aAssigned ? -1 : 1;
      }
      return a.plateNumber.localeCompare(b.plateNumber);
    });
  }, [trucks]);

  const paginatedTrucks = React.useMemo(() => {
    const start = page * rowsPerPage;
    return sortedTrucks.slice(start, start + rowsPerPage);
  }, [sortedTrucks, page, rowsPerPage]);

  const renderStatusChip = (status?: TruckStatus): React.ReactElement => {
    const colorMap: Record<TruckStatus, 'default' | 'success' | 'warning'> = {
      ASSIGNED: 'success',
      IN_SERVICE: 'default',
      IN_REPAIR: 'warning',
    };
    if (!status) {
      return <Chip label={t('backoffice.trucks.status.unknown')} size="small" />;
    }
    return <Chip label={t(`backoffice.trucks.status.${status}`)} color={colorMap[status]} size="small" />;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('backoffice.trucks.title')}
          caption={t('backoffice.trucks.subtitle')}
          actions={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={isLoading}>
                {t('common.refresh')}
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
                {t('backoffice.trucks.actions.newTruck')}
              </Button>
            </Stack>
          }
          backLabel={t('common.back')}
          onBack={() => window.history.back()}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center" py={4}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {t('backoffice.trucks.loading')}
            </Typography>
          </Stack>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('backoffice.trucks.table.plate')}</TableCell>
                    <TableCell>{t('backoffice.trucks.table.status')}</TableCell>
                    <TableCell>{t('backoffice.trucks.table.warehouse')}</TableCell>
                    <TableCell>{t('backoffice.trucks.table.assigned')}</TableCell>
                    <TableCell align="right">{t('backoffice.trucks.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTrucks.map((truck) => (
                    <TableRow key={truck.id} hover>
                      <TableCell>{truck.plateNumber}</TableCell>
                      <TableCell>{renderStatusChip(truck.status)}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <Select
                            value={truck.currentWarehouseId ?? ''}
                            onChange={(event) => handleWarehouseChange(truck.id, Number(event.target.value))}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>{t('backoffice.trucks.warehouse.unassigned')}</em>
                            </MenuItem>
                            {warehouses.map((warehouse) => (
                              <MenuItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {truck.assignedFranchiseeId ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={getAssignedFranchiseeLabel(truck.assignedFranchiseeId)}
                              color="success"
                              size="small"
                            />
                            <Button size="small" onClick={() => handleUnassignFranchisee(truck.id)}>
                              {t('backoffice.trucks.actions.unassign')}
                            </Button>
                          </Stack>
                        ) : (
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                              value=""
                              onChange={(event) => handleAssignFranchisee(truck.id, Number(event.target.value))}
                              displayEmpty
                            >
                              <MenuItem value="">
                                <em>{t('backoffice.trucks.assign.placeholder')}</em>
                              </MenuItem>
                              {franchisees.map((franchisee) => (
                                <MenuItem key={franchisee.id} value={franchisee.id}>
                                  {franchisee.firstName} {franchisee.lastName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell align="right">—</TableCell>
                    </TableRow>
                  ))}
                  {paginatedTrucks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {t('backoffice.trucks.empty')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={sortedTrucks.length}
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

      <Dialog open={isCreateDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('backoffice.trucks.create.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('backoffice.trucks.create.plate')}
              value={formState.plateNumber}
              onChange={(event) => {
                setFormState((prev) => ({ ...prev, plateNumber: event.target.value }));
                setFormError(null);
              }}
              required
            />
            <TextField
              label={t('backoffice.trucks.create.name')}
              value={formState.name}
              onChange={(event) => {
                setFormState((prev) => ({ ...prev, name: event.target.value }));
                setFormError(null);
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="truck-status-label">{t('backoffice.trucks.create.status')}</InputLabel>
              <Select
                labelId="truck-status-label"
                value={formState.status}
                label={t('backoffice.trucks.create.status')}
                onChange={(event: SelectChangeEvent<TruckStatus>) => {
                  setFormState((prev) => ({ ...prev, status: event.target.value as TruckStatus }));
                  setFormError(null);
                }}
              >
                <MenuItem value="ASSIGNED">{t('backoffice.trucks.status.ASSIGNED')}</MenuItem>
                <MenuItem value="IN_SERVICE">{t('backoffice.trucks.status.IN_SERVICE')}</MenuItem>
                <MenuItem value="IN_REPAIR">{t('backoffice.trucks.status.IN_REPAIR')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="truck-warehouse-label">{t('backoffice.trucks.create.warehouse')}</InputLabel>
              <Select
                labelId="truck-warehouse-label"
                value={formState.currentWarehouseId}
                label={t('backoffice.trucks.create.warehouse')}
                onChange={(event: SelectChangeEvent<string>) => {
                  setFormState((prev) => ({ ...prev, currentWarehouseId: event.target.value }));
                  setFormError(null);
                }}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={String(warehouse.id)}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formError && (
              <Alert severity="error">{formError}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.back')}</Button>
          <Button variant="contained" onClick={handleCreateTruck} disabled={isSubmitting}>
            {t('backoffice.trucks.create.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrucksPage;
