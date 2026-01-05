import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { adminFranchiseesApi } from '../../services/api';
import { AdminFranchiseeDetail, Franchisee, ProfilePreferences } from '../../types/api';

const FranchiseeDetailPage = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { franchiseeId } = useParams<{ franchiseeId: string }>();
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'fr-FR';

  const [detail, setDetail] = React.useState<AdminFranchiseeDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDetail = React.useCallback(() => {
    if (!franchiseeId) {
      setError(t('backoffice.franchisees.detail.loadError'));
      setDetail(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    adminFranchiseesApi
      .getById(Number(franchiseeId))
      .then((response) => {
        setDetail(response);
      })
      .catch(() => {
        setDetail(null);
        setError(t('backoffice.franchisees.detail.loadError'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [franchiseeId, t]);

  React.useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const franchisee: Franchisee | undefined = detail?.franchisee ?? (detail as unknown as Franchisee | undefined);
  const preferences: ProfilePreferences | undefined = detail?.preferences ?? (detail as unknown as ProfilePreferences | undefined);

  const formattedJoinDate = franchisee?.createdAt
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(franchisee.createdAt))
    : undefined;

  const notProvided = t('backoffice.franchisees.detail.notProvided');

  const renderField = (label: string, value?: string | null): React.ReactElement => (
    <Stack spacing={0.5}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value && value.trim().length > 0 ? value : notProvided}</Typography>
    </Stack>
  );

  const renderContent = (): React.ReactNode => {
    if (isLoading) {
      return (
        <Stack spacing={2} alignItems="center" py={6}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            {t('backoffice.franchisees.detail.loading')}
          </Typography>
        </Stack>
      );
    }

    if (error) {
      return (
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={() => navigate('/admin/franchisees')}>
            {t('common.back')}
          </Button>
        </Stack>
      );
    }

    if (!franchisee) {
      return null;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('backoffice.franchisees.detail.identity')}
              </Typography>
              <Stack spacing={2}>
                {renderField(t('profile.fields.firstName'), franchisee.firstName)}
                {renderField(t('profile.fields.lastName'), franchisee.lastName)}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('backoffice.franchisees.detail.contact')}
              </Typography>
              <Stack spacing={2}>
                {renderField(t('profile.fields.email'), franchisee.email)}
                {renderField(t('profile.fields.phone'), franchisee.phone)}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('backoffice.franchisees.detail.company')}
              </Typography>
              <Stack spacing={2}>
                {renderField(t('profile.fields.companyName'), franchisee.companyName)}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('backoffice.franchisees.detail.address')}
              </Typography>
              <Stack spacing={2}>{renderField(t('profile.fields.address'), franchisee.address)}</Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <PageHeader
          title={t('backoffice.franchisees.detail.title')}
          caption={formattedJoinDate ? t('backoffice.franchisees.detail.joinedOn', { date: formattedJoinDate }) : undefined}
          backLabel={t('common.back')}
          onBack={() => navigate('/admin/franchisees')}
          actions={[<Button key="refresh" onClick={loadDetail} disabled={isLoading}>{t('common.refresh')}</Button>]}
        />
        {renderContent()}
      </Container>
    </Box>
  );
};

export default FranchiseeDetailPage;
