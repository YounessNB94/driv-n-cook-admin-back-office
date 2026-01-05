import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '../../components/common/PageHeader';
import { adminFranchiseesApi, adminReportsApi } from '../../services/api';
import { Franchisee, ReportType } from '../../types/api';

const AdminReportsPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const [franchisees, setFranchisees] = React.useState<Franchisee[]>([]);
  const [selectedFranchiseeId, setSelectedFranchiseeId] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadFranchisees = async (): Promise<void> => {
      try {
        const response = await adminFranchiseesApi.list();
        setFranchisees(response);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t('backoffice.adminReports.errors.loadFranchisees'));
      }
    };

    loadFranchisees().catch(() => {
      /* handled in loadFranchisees */
    });
  }, [t]);

  const handleSubmit = async (): Promise<void> => {
    if (!selectedFranchiseeId) {
      setError(t('backoffice.adminReports.validation.franchisee')); // Ensure error message for missing selection.
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        franchiseeId: Number(selectedFranchiseeId),
        type: 'REVENUE' as ReportType,
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      };

      const { blob, fileName } = await adminReportsApi.requestReport(payload);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName ?? 'report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(t('backoffice.adminReports.messages.success'));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('backoffice.adminReports.errors.generate'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="sm">
        <PageHeader
          title={t('backoffice.adminReports.title')}
          caption={t('backoffice.adminReports.subtitle')}
          backLabel={t('common.back')}
          onBack={() => window.history.back()}
        />

        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Typography variant="body1" color="text.secondary">
              {t('backoffice.adminReports.helper')}
            </Typography>

            <TextField
              select
              label={t('backoffice.adminReports.fields.franchisee')}
              value={selectedFranchiseeId}
              onChange={(event): void => setSelectedFranchiseeId(event.target.value)}
              fullWidth
            >
              <MenuItem value="" disabled>
                {t('backoffice.adminReports.placeholders.franchisee')}
              </MenuItem>
              {franchisees.map((franchisee) => (
                <MenuItem key={franchisee.id} value={String(franchisee.id)}>
                  {franchisee.companyName} — {franchisee.firstName} {franchisee.lastName}
                </MenuItem>
              ))}
            </TextField>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage(null)}>
                {successMessage}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
              onClick={() => void handleSubmit()}
              disabled={isLoading || !selectedFranchiseeId}
            >
              {isLoading ? t('backoffice.adminReports.actions.generating') : t('backoffice.adminReports.actions.generate')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminReportsPage;

