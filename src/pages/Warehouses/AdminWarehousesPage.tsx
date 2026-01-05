import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
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
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/common/PageHeader';
import { warehousesApi } from '../../services/api';
import { InventoryItem, Warehouse } from '../../types/api';

interface InventoryState {
  loading: boolean;
  error: string | null;
  items: InventoryItem[];
}

interface RestockFormState {
  mode: 'update' | 'create';
  warehouseId: number | null;
  itemId?: number;
  name: string;
  unit: string;
  quantity: string;
  submitting: boolean;
  error?: string;
}

const defaultRestockFormState: RestockFormState = {
  mode: 'update',
  warehouseId: null,
  itemId: undefined,
  name: '',
  unit: 'kg',
  quantity: '',
  submitting: false,
};

const AdminWarehousesPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [inventoryWarehouse, setInventoryWarehouse] = React.useState<Warehouse | null>(null);
  const [inventoryState, setInventoryState] = React.useState<InventoryState>({ loading: false, error: null, items: [] });
  const [restockDialog, setRestockDialog] = React.useState<RestockFormState>(defaultRestockFormState);

  const loadWarehouses = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await warehousesApi.list();
      setWarehouses(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('backoffice.warehouses.errors.load'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const handleChangePage = (_: unknown, newPage: number): void => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchInventoryItems = React.useCallback(
    async (warehouse: Warehouse): Promise<void> => {
      setInventoryState({ loading: true, error: null, items: [] });
      try {
        const items = await warehousesApi.inventory(warehouse.id);
        setInventoryState({ loading: false, error: null, items });
      } catch (loadError) {
        setInventoryState({
          loading: false,
          error: loadError instanceof Error ? loadError.message : t('backoffice.warehouses.errors.inventory'),
          items: [],
        });
      }
    },
    [t],
  );

  const openInventoryDialog = async (warehouse: Warehouse): Promise<void> => {
    setInventoryWarehouse(warehouse);
    await fetchInventoryItems(warehouse);
  };

  const closeInventoryDialog = (): void => {
    setInventoryWarehouse(null);
    setInventoryState({ loading: false, error: null, items: [] });
  };

  const openRestockDialog = (warehouse: Warehouse, item?: InventoryItem): void => {
    setRestockDialog({
      mode: item ? 'update' : 'create',
      warehouseId: warehouse.id,
      itemId: item?.id,
      name: item?.name ?? '',
      unit: item?.unit ?? 'kg',
      quantity: item ? String(item.availableQuantity) : '',
      submitting: false,
      error: undefined,
    });
  };

  const closeRestockDialog = (): void => setRestockDialog(defaultRestockFormState);

  const handleRestockSubmit = async (): Promise<void> => {
    if (!restockDialog.warehouseId) {
      return;
    }
    const quantityValue = Number(restockDialog.quantity);
    if (restockDialog.mode === 'update' && Number.isNaN(quantityValue)) {
      setRestockDialog((prev) => ({ ...prev, error: t('backoffice.warehouses.restock.errors.quantity') }));
      return;
    }
    setRestockDialog((prev) => ({ ...prev, submitting: true, error: undefined }));
    try {
      if (restockDialog.mode === 'update' && restockDialog.itemId) {
        await warehousesApi.updateInventoryItem(restockDialog.warehouseId, restockDialog.itemId, {
          availableQuantity: quantityValue,
        });
      } else {
        await warehousesApi.createInventoryItem(restockDialog.warehouseId, {
          name: restockDialog.name,
          unit: restockDialog.unit,
          availableQuantity: Number(restockDialog.quantity) || 0,
        });
      }
      if (inventoryWarehouse && inventoryWarehouse.id === restockDialog.warehouseId) {
        await fetchInventoryItems(inventoryWarehouse);
      }
      closeRestockDialog();
    } catch (submitError) {
      setRestockDialog((prev) => ({
        ...prev,
        submitting: false,
        error: submitError instanceof Error ? submitError.message : t('backoffice.warehouses.restock.errors.generic'),
      }));
    }
  };

  const paginatedWarehouses = React.useMemo(() => {
    const start = page * rowsPerPage;
    return warehouses.slice(start, start + rowsPerPage);
  }, [warehouses, page, rowsPerPage]);

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('backoffice.warehouses.title')}
          caption={t('backoffice.warehouses.subtitle')}
          backLabel={t('common.back')}
          onBack={() => window.history.back()}
          actions={
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadWarehouses} disabled={isLoading}>
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
              {t('backoffice.warehouses.loading')}
            </Typography>
          </Stack>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('backoffice.warehouses.table.name')}</TableCell>
                    <TableCell>{t('backoffice.warehouses.table.address')}</TableCell>
                    <TableCell>{t('backoffice.warehouses.table.phone')}</TableCell>
                    <TableCell align="right">{t('backoffice.warehouses.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedWarehouses.map((warehouse) => (
                    <TableRow key={warehouse.id} hover>
                      <TableCell>{warehouse.name}</TableCell>
                      <TableCell>{warehouse.address}</TableCell>
                      <TableCell>{warehouse.phone ?? t('common.notProvided')}</TableCell>
                      <TableCell align="right">
                        <Button variant="text" size="small" onClick={() => void openInventoryDialog(warehouse)}>
                          {t('backoffice.warehouses.actions.viewStock')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedWarehouses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {t('backoffice.warehouses.empty')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={warehouses.length}
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

      <Dialog open={Boolean(inventoryWarehouse)} onClose={closeInventoryDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {inventoryWarehouse?.name}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('backoffice.warehouses.drawer.subtitle')}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => inventoryWarehouse && openRestockDialog(inventoryWarehouse)}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('backoffice.warehouses.actions.createStock')}
          </Button>
          {inventoryState.loading ? (
            <Stack direction="row" spacing={1} alignItems="center" py={2}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                {t('backoffice.warehouses.drawer.loading')}
              </Typography>
            </Stack>
          ) : inventoryState.error ? (
            <Alert severity="error">{inventoryState.error}</Alert>
          ) : inventoryState.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('backoffice.warehouses.drawer.empty')}
            </Typography>
          ) : (
            <List>
              {inventoryState.items.map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <Button size="small" onClick={() => inventoryWarehouse && openRestockDialog(inventoryWarehouse, item)}>
                      {t('backoffice.warehouses.actions.restock')}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={`${item.name} · ${item.availableQuantity} ${item.unit}`}
                    secondary={t('backoffice.warehouses.drawer.itemSubtitle', { id: item.id })}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInventoryDialog}>{t('common.back')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={restockDialog.warehouseId !== null} onClose={closeRestockDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {restockDialog.mode === 'update'
            ? t('backoffice.warehouses.restock.titleUpdate')
            : t('backoffice.warehouses.restock.titleCreate')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {restockDialog.mode === 'create' && (
            <TextField
              label={t('backoffice.warehouses.restock.fields.name')}
              value={restockDialog.name}
              onChange={(event) => setRestockDialog((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
            />
          )}
          {restockDialog.mode === 'create' && (
            <TextField
              select
              label={t('backoffice.warehouses.restock.fields.unit')}
              value={restockDialog.unit}
              onChange={(event) => setRestockDialog((prev) => ({ ...prev, unit: event.target.value }))}
              fullWidth
            >
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="pcs">pcs</MenuItem>
            </TextField>
          )}
          <TextField
            label={t('backoffice.warehouses.restock.fields.quantity')}
            type="number"
            value={restockDialog.quantity}
            onChange={(event) => setRestockDialog((prev) => ({ ...prev, quantity: event.target.value }))}
            fullWidth
          />
          {restockDialog.error && (
            <Alert severity="error" variant="outlined">
              {restockDialog.error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRestockDialog}>{t('common.back')}</Button>
          <Button variant="contained" onClick={() => void handleRestockSubmit()} disabled={restockDialog.submitting}>
            {restockDialog.mode === 'update'
              ? t('backoffice.warehouses.restock.ctaUpdate')
              : t('backoffice.warehouses.restock.ctaCreate')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWarehousesPage;
