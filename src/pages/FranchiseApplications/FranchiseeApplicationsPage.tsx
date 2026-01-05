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
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { adminFranchiseApplicationsApi } from '../../services/api';
import { AdminFranchiseApplication, FranchiseApplicationStatus } from '../../types/api';

const formatDate = (isoDate: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(isoDate));

const FranchiseeApplicationsPage = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'fr-FR';
  const navigate = useNavigate();
  const [applications, setApplications] = React.useState<AdminFranchiseApplication[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<FranchiseApplicationStatus>('PENDING');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadApplications = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    adminFranchiseApplicationsApi
      .list(statusFilter)
      .then((response) => setApplications(response))
      .catch(() => setError(t('backoffice.franchiseApplications.errors.load')))
      .finally(() => setIsLoading(false));
  }, [statusFilter, t]);

  React.useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleChangePage = (_: unknown, newPage: number): void => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedApplications = React.useMemo(() => {
    const start = page * rowsPerPage;
    return applications.slice(start, start + rowsPerPage);
  }, [applications, page, rowsPerPage]);

  const renderPaidChip = (paid: boolean): React.ReactElement => (
    <Chip
      label={paid ? t('backoffice.franchiseApplications.badges.paid') : t('backoffice.franchiseApplications.badges.unpaid')}
      color={paid ? 'success' : 'default'}
      size="small"
    />
  );

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('backoffice.franchiseApplications.title')}
          caption={t('backoffice.franchiseApplications.subtitle')}
          backLabel={t('common.back')}
          onBack={() => window.history.back()}
          actions={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadApplications} disabled={isLoading}>
                {t('common.refresh')}
              </Button>
            </Stack>
          }
        />

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              select
              label={t('backoffice.franchiseApplications.filters.status')}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as FranchiseApplicationStatus);
                setPage(0);
              }}
              SelectProps={{ native: true }}
              sx={{ width: { xs: '100%', md: 240 } }}
            >
              <option value="PENDING">{t('dashboard.statuses.PENDING')}</option>
              <option value="APPROVED">{t('dashboard.statuses.APPROVED')}</option>
              <option value="REJECTED">{t('dashboard.statuses.REJECTED')}</option>
            </TextField>
          </Stack>
        </Paper>

        {isLoading && (
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {t('backoffice.franchiseApplications.loading')}
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('backoffice.franchiseApplications.table.columns.id')}</TableCell>
                  <TableCell>{t('backoffice.franchiseApplications.table.columns.createdAt')}</TableCell>
                  <TableCell>{t('backoffice.franchiseApplications.table.columns.paid')}</TableCell>
                  <TableCell align="right">{t('backoffice.franchiseApplications.table.columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedApplications.map((application) => (
                  <TableRow key={application.id} hover>
                    <TableCell>#{application.id}</TableCell>
                    <TableCell>{formatDate(application.createdAt, locale)}</TableCell>
                    <TableCell>{renderPaidChip(application.paid)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/admin/franchise-applications/${application.id}`)}>
                        {t('backoffice.franchiseApplications.actions.viewDetail')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && paginatedApplications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {t('backoffice.franchiseApplications.emptyState')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={applications.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage={t('common.rowsPerPage')}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default FranchiseeApplicationsPage;
