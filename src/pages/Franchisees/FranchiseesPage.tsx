import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { adminFranchiseesApi } from '../../services/api';
import { Franchisee } from '../../types/api';
import React from "react";
import PageHeader from '../../components/common/PageHeader';

const formatDate = (isoDate: string): string => dayjs(isoDate).format('DD/MM/YYYY');

const FranchiseesPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [franchisees, setFranchisees] = React.useState<Franchisee[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const loadFranchisees = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    adminFranchiseesApi
      .list()
      .then((response) => {
        setFranchisees(response);
      })
      .catch(() => {
        setError(t('backoffice.franchisees.loadError'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [t]);

  React.useEffect(() => {
    loadFranchisees();
  }, [loadFranchisees]);

  const handleChangePage = (_: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewProfile = (franchiseeId: number): void => {
    navigate(`/admin/franchisees/${franchiseeId}`);
  };

  const paginatedFranchisees = React.useMemo(() => {
    const start = page * rowsPerPage;
    return franchisees.slice(start, start + rowsPerPage);
  }, [franchisees, page, rowsPerPage]);

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('backoffice.franchisees.title')}
          caption={t('backoffice.franchisees.subtitle')}
          backLabel={t('common.back')}
          onBack={() => window.history.back()}
          actions={
            <Button variant="outlined" onClick={loadFranchisees} disabled={isLoading}>
              {t('common.refresh')}
            </Button>
          }
        />

        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
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
                  <TableCell>{t('backoffice.franchisees.columns.name')}</TableCell>
                  <TableCell>{t('backoffice.franchisees.columns.email')}</TableCell>
                  <TableCell>{t('backoffice.franchisees.columns.company')}</TableCell>
                  <TableCell>{t('backoffice.franchisees.columns.phone')}</TableCell>
                  <TableCell>{t('backoffice.franchisees.columns.createdAt')}</TableCell>
                  <TableCell align="right">{t('backoffice.franchisees.columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFranchisees.map((franchisee) => (
                  <TableRow key={franchisee.id} hover>
                    <TableCell>
                      {franchisee.firstName} {franchisee.lastName}
                    </TableCell>
                    <TableCell>{franchisee.email}</TableCell>
                    <TableCell>{franchisee.companyName}</TableCell>
                    <TableCell>{franchisee.phone ?? t('common.notProvided')}</TableCell>
                    <TableCell>{formatDate(franchisee.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button variant="text" onClick={() => handleViewProfile(franchisee.id)}>
                        {t('backoffice.franchisees.actions.viewProfile')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && paginatedFranchisees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {t('backoffice.franchisees.emptyState')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={franchisees.length}
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

export default FranchiseesPage;

