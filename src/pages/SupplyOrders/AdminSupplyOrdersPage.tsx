import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/common/PageHeader';
import { adminFranchiseesApi, adminSupplyOrdersApi, warehousesApi } from '../../services/api';
import { Franchisee, SupplyOrder, Warehouse } from '../../types/api';

const useLookup = <T extends { id: number }>(items: T[]): Record<number, T> => {
  return React.useMemo(() => {
    const map: Record<number, T> = {};
    items.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [items]);
};

const AdminSupplyOrdersPage = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';
  const [orders, setOrders] = React.useState<SupplyOrder[]>([]);
  const [franchisees, setFranchisees] = React.useState<Franchisee[]>([]);
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const franchiseeLookup = useLookup(franchisees);
  const warehouseLookup = useLookup(warehouses);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersResponse, franchiseesResponse, warehousesResponse] = await Promise.all([
        adminSupplyOrdersApi.listConfirmed(),
        adminFranchiseesApi.list(),
        warehousesApi.list(),
      ]);
      setOrders(ordersResponse);
      setFranchisees(franchiseesResponse);
      setWarehouses(warehousesResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('backoffice.supplyOrders.errors.load'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChangePage = (_: unknown, newPage: number): void => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateIso?: string): string => {
    if (!dateIso) {
      return '—';
    }
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateIso));
  };

  const handleMarkReady = async (orderId: number): Promise<void> => {
    try {
      await adminSupplyOrdersApi.update(orderId, { status: 'READY' });
      await loadData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t('backoffice.supplyOrders.errors.update'));
    }
  };

  const paginatedOrders = React.useMemo(() => {
    const start = page * rowsPerPage;
    return orders.slice(start, start + rowsPerPage);
  }, [orders, page, rowsPerPage]);

  const paymentChip = (paid: boolean): React.ReactElement => (
    <Chip
      label={paid ? t('backoffice.supplyOrders.badges.paid') : t('backoffice.supplyOrders.badges.unpaid')}
      color={paid ? 'success' : 'default'}
      size="small"
    />
  );

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('backoffice.supplyOrders.title')}
          caption={t('backoffice.supplyOrders.subtitle')}
          backLabel={t('common.back')}
          onBack={() => window.history.back()}
          actions={
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={isLoading}>
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
              {t('backoffice.supplyOrders.loading')}
            </Typography>
          </Stack>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('backoffice.supplyOrders.table.code')}</TableCell>
                    <TableCell>{t('backoffice.supplyOrders.table.franchisee')}</TableCell>
                    <TableCell>{t('backoffice.supplyOrders.table.warehouse')}</TableCell>
                    <TableCell>{t('backoffice.supplyOrders.table.paid')}</TableCell>
                    <TableCell>{t('backoffice.supplyOrders.table.updatedAt')}</TableCell>
                    <TableCell align="right">{t('backoffice.supplyOrders.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const franchisee = order.franchiseeId ? franchiseeLookup[order.franchiseeId] : undefined;
                    const warehouse = order.pickupWarehouseId ? warehouseLookup[order.pickupWarehouseId] : undefined;
                    return (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.code ?? `#${order.id}`}</TableCell>
                        <TableCell>
                          {franchisee ? `${franchisee.companyName} (${franchisee.firstName} ${franchisee.lastName})` : t('common.notProvided')}
                        </TableCell>
                        <TableCell>{warehouse ? warehouse.name : t('common.notProvided')}</TableCell>
                        <TableCell>{paymentChip(order.paid)}</TableCell>
                        <TableCell>{formatDate(order.updatedAt)}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={order.status !== 'CONFIRMED'}
                            onClick={() => handleMarkReady(order.id)}
                          >
                            {t('backoffice.supplyOrders.actions.markReady')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {t('backoffice.supplyOrders.empty')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={orders.length}
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

export default AdminSupplyOrdersPage;

