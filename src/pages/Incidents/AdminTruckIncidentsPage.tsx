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
import { adminIncidentsApi, adminMaintenanceApi, trucksApi } from '../../services/api';
import { Incident, Truck } from '../../types/api';

interface ResolveDialogState {
  open: boolean;
  incident: Incident | null;
  date: string;
  description: string;
  errors: {
    date?: string;
    description?: string;
  };
  submitting: boolean;
}

const defaultDialogState: ResolveDialogState = {
  open: false,
  incident: null,
  date: '',
  description: '',
  errors: {},
  submitting: false,
};

const AdminTruckIncidentsPage = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [truckDetails, setTruckDetails] = React.useState<Record<number, Truck>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [dialogState, setDialogState] = React.useState<ResolveDialogState>(defaultDialogState);

  const loadIncidents = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminIncidentsApi.list();
      setIncidents(response);
      const fetchableTruckIds = response
        .filter((incident) => incident.truckId && !truckDetails[incident.truckId])
        .map((incident) => incident.truckId);
      if (fetchableTruckIds.length > 0) {
        const uniqueIds = Array.from(new Set(fetchableTruckIds));
        const trucks = await Promise.all(uniqueIds.map((truckId) => trucksApi.getById(truckId)));
        setTruckDetails((prev) => {
          const next = { ...prev };
          trucks.forEach((truck) => {
            next[truck.id] = truck;
          });
          return next;
        });
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('backoffice.incidents.errors.load'));
    } finally {
      setIsLoading(false);
    }
  }, [t, truckDetails]);

  React.useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const paginatedIncidents = React.useMemo(() => {
    const start = page * rowsPerPage;
    return incidents.slice(start, start + rowsPerPage);
  }, [incidents, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number): void => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (isoDate: string): string =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoDate));

  const handleOpenDialog = (incident: Incident): void => {
    setDialogState({
      open: true,
      incident,
      date: new Date().toISOString().slice(0, 10),
      description: '',
      errors: {},
      submitting: false,
    });
  };

  const handleCloseDialog = (): void => {
    setDialogState(defaultDialogState);
  };

  const validateDialog = (): boolean => {
    const errors: ResolveDialogState['errors'] = {};
    if (!dialogState.date) {
      errors.date = t('backoffice.incidents.dialog.errors.date');
    }
    if (!dialogState.description.trim()) {
      errors.description = t('backoffice.incidents.dialog.errors.description');
    }
    setDialogState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleResolve = async (): Promise<void> => {
    if (!dialogState.incident) {
      return;
    }
    if (!validateDialog()) {
      return;
    }
    setDialogState((prev) => ({ ...prev, submitting: true }));
    try {
      await adminMaintenanceApi.create(dialogState.incident.truckId, {
        date: dialogState.date,
        description: dialogState.description.trim(),
      });
      await adminIncidentsApi.resolve(dialogState.incident.id, { status: 'RESOLVED' });
      handleCloseDialog();
      await loadIncidents();
    } catch (resolveError) {
      setDialogState((prev) => ({
        ...prev,
        submitting: false,
        errors: {
          ...prev.errors,
          description:
            resolveError instanceof Error
              ? resolveError.message
              : t('backoffice.incidents.errors.resolve'),
        },
      }));
    }
  };

  const renderStatusChip = (status: Incident['status']): React.ReactElement => {
    const colorMap: Record<Incident['status'], 'warning' | 'info' | 'success'> = {
      OPEN: 'warning',
      IN_PROGRESS: 'info',
      RESOLVED: 'success',
    };
    return <Chip label={t(`backoffice.incidents.status.${status}`)} size="small" color={colorMap[status]} />;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('backoffice.incidents.title')}
          caption={t('backoffice.incidents.subtitle')}
          backLabel={t('common.back')}
          onBack={() => window.history.back()}
          actions={
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadIncidents} disabled={isLoading}>
              {t('common.refresh')}
            </Button>
          }
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
              {t('backoffice.incidents.loading')}
            </Typography>
          </Stack>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('backoffice.incidents.table.id')}</TableCell>
                    <TableCell>{t('backoffice.incidents.table.truck')}</TableCell>
                    <TableCell>{t('backoffice.incidents.table.franchisee')}</TableCell>
                    <TableCell>{t('backoffice.incidents.table.description')}</TableCell>
                    <TableCell>{t('backoffice.incidents.table.status')}</TableCell>
                    <TableCell>{t('backoffice.incidents.table.date')}</TableCell>
                    <TableCell align="right">{t('backoffice.incidents.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedIncidents.map((incident) => {
                    const truck = truckDetails[incident.truckId];
                    const franchiseeLabel = incident.franchiseeName ?? t('common.notProvided');
                    return (
                      <TableRow key={incident.id} hover>
                        <TableCell>#{incident.id}</TableCell>
                        <TableCell>
                          {truck?.plateNumber ?? incident.truckPlateNumber ?? t('backoffice.incidents.table.unknownTruck')}
                        </TableCell>
                        <TableCell>{franchiseeLabel}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap title={incident.description}>
                            {incident.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{renderStatusChip(incident.status)}</TableCell>
                        <TableCell>{formatDate(incident.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            disabled={incident.status === 'RESOLVED'}
                            onClick={() => handleOpenDialog(incident)}
                          >
                            {t('backoffice.incidents.actions.resolve')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedIncidents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {t('backoffice.incidents.empty')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={incidents.length}
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

      <Dialog open={dialogState.open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('backoffice.incidents.dialog.title')}</DialogTitle>
        <DialogContent>
          {dialogState.incident && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label={t('backoffice.incidents.dialog.fields.date')}
                type="date"
                value={dialogState.date}
                error={Boolean(dialogState.errors.date)}
                helperText={dialogState.errors.date}
                onChange={(event) =>
                  setDialogState((prev) => ({ ...prev, date: event.target.value, errors: { ...prev.errors, date: undefined } }))
                }
              />
              <TextField
                label={t('backoffice.incidents.dialog.fields.description')}
                multiline
                minRows={3}
                value={dialogState.description}
                error={Boolean(dialogState.errors.description)}
                helperText={dialogState.errors.description}
                onChange={(event) =>
                  setDialogState((prev) => ({
                    ...prev,
                    description: event.target.value,
                    errors: { ...prev.errors, description: undefined },
                  }))
                }
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.back')}</Button>
          <Button variant="contained" onClick={() => void handleResolve()} disabled={dialogState.submitting}>
            {t('backoffice.incidents.dialog.cta')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTruckIncidentsPage;
