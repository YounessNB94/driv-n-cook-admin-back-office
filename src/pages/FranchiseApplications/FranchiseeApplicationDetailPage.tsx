import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/common/PageHeader';
import { adminFranchiseApplicationsApi } from '../../services/api';
import { AdminFranchiseApplicationDetail, FranchiseApplicationStatus } from '../../types/api';

const FranchiseeApplicationDetailPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = React.useState<AdminFranchiseApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialog, setDialog] = React.useState<{ action: FranchiseApplicationStatus; open: boolean }>({
    action: 'APPROVED',
    open: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadDetail = React.useCallback(() => {
    if (!applicationId) {
      setError(t('backoffice.franchiseApplications.errors.invalidId'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    adminFranchiseApplicationsApi
      .getById(Number(applicationId))
      .then((response) => setApplication(response))
      .catch(() => setError(t('backoffice.franchiseApplications.errors.loadDetail')))
      .finally(() => setIsLoading(false));
  }, [applicationId, t]);

  React.useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleConfirmStatus = (status: FranchiseApplicationStatus): void => {
    setDialog({ action: status, open: true });
  };

  const closeDialog = (): void => setDialog((prev) => ({ ...prev, open: false }));

  const submitStatus = (): void => {
    if (!application || !applicationId) {
      return;
    }
    setIsSubmitting(true);
    adminFranchiseApplicationsApi
      .updateStatus(Number(applicationId), dialog.action)
      .then((updated) => {
        setApplication(updated);
        closeDialog();
      })
      .catch(() => setError(t('backoffice.franchiseApplications.errors.updateStatus')))
      .finally(() => setIsSubmitting(false));
  };

  const infoRows: Array<{ label: string; value?: string }> = [
    {
      label: t('backoffice.franchiseApplications.detail.createdAt'),
      value: application?.createdAt ? new Date(application.createdAt).toLocaleString() : undefined,
    },
    {
      label: t('backoffice.franchiseApplications.detail.updatedAt'),
      value: application?.updatedAt ? new Date(application.updatedAt).toLocaleString() : undefined,
    },
    {
      label: t('backoffice.franchiseApplications.detail.note'),
      value: application?.note ?? t('common.notProvided'),
    },
  ];

  const renderCard = (title: string, rows: Array<{ label: string; value?: string }>): React.ReactElement => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Stack spacing={1}>
          {rows.map((row) => (
            <Stack key={row.label} spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                {row.label}
              </Typography>
              <Typography variant="body1">{row.value ?? t('common.notProvided')}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  const renderContent = (): React.ReactNode => {
    if (isLoading) {
      return (
        <Stack alignItems="center" spacing={2} py={6}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            {t('backoffice.franchiseApplications.loadingDetail')}
          </Typography>
        </Stack>
      );
    }

    if (error) {
      return (
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={() => navigate('/admin/franchise-applications')}>
            {t('common.back')}
          </Button>
        </Stack>
      );
    }

    if (!application) {
      return null;
    }

    return (
      <Stack spacing={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderCard(t('backoffice.franchiseApplications.detail.infoSection'), infoRows)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderCard(t('backoffice.franchiseApplications.detail.paymentSection'), [
              {
                label: t('backoffice.franchiseApplications.detail.paid'),
                value: application.paid ? t('backoffice.franchiseApplications.badges.paid') : t('backoffice.franchiseApplications.badges.unpaid'),
              },
              {
                label: t('backoffice.franchiseApplications.detail.paymentMethod'),
                value: application.paymentMethod ? t(`franchiseApplications.paymentMethods.${application.paymentMethod}`) : undefined,
              },
            ])}
          </Grid>
        </Grid>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Button
            variant="contained"
            color="success"
            disabled={isSubmitting}
            onClick={() => handleConfirmStatus('APPROVED')}
          >
            {t('backoffice.franchiseApplications.actions.approve')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isSubmitting}
            onClick={() => handleConfirmStatus('REJECTED')}
          >
            {t('backoffice.franchiseApplications.actions.reject')}
          </Button>
        </Stack>
      </Stack>
    );
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('backoffice.franchiseApplications.detail.title')}
          caption={application ? t('backoffice.franchiseApplications.detail.subtitle', { id: application.id }) : undefined}
          backLabel={t('common.back')}
          onBack={() => navigate('/admin/franchise-applications')}
          actions={
            <Button onClick={loadDetail} disabled={isLoading}>
              {t('common.refresh')}
            </Button>
          }
        />
        {renderContent()}
      </Container>

      <Dialog open={dialog.open} onClose={closeDialog}>
        <DialogTitle>
          {dialog.action === 'APPROVED'
            ? t('backoffice.franchiseApplications.dialog.approveTitle')
            : t('backoffice.franchiseApplications.dialog.rejectTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialog.action === 'APPROVED'
              ? t('backoffice.franchiseApplications.dialog.approveMessage')
              : t('backoffice.franchiseApplications.dialog.rejectMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{t('common.back')}</Button>
          <Button variant="contained" color={dialog.action === 'APPROVED' ? 'success' : 'error'} onClick={submitStatus} disabled={isSubmitting}>
            {t('backoffice.franchiseApplications.dialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FranchiseeApplicationDetailPage;
