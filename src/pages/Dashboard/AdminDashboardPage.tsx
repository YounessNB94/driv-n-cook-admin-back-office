import React from 'react';
import {Alert, Box, Button, Card, CardContent, CircularProgress, Container, Stack, Typography,} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const AdminDashboardPage = (): React.ReactElement => {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';

    const quickLinks = [
        {key: 'franchisees', label: t('backoffice.dashboard.links.franchisees'), path: '/admin/franchisees'},
        {
            key: 'applications',
            label: t('backoffice.dashboard.links.applications'),
            path: '/admin/franchise-applications'
        },
        {key: 'trucks', label: t('backoffice.dashboard.links.trucks'), path: '/admin/trucks'},
        {key: 'warehouses', label: t('backoffice.dashboard.links.warehouses'), path: '/admin/warehouses'},
        {key: 'supply', label: t('backoffice.dashboard.links.supplyOrders'), path: '/admin/supply-orders'},
        {key: 'appointments', label: t('backoffice.dashboard.links.appointments'), path: '/admin/appointments'},
        {key: 'incidents', label: t('backoffice.dashboard.links.incidents'), path: '/admin/incidents'},
        {key: 'reports', label: t('backoffice.dashboard.links.reports'), path: '/admin/reports'},
    ];

    return (
        <Box sx={{bgcolor: 'background.default', py: {xs: 4, md: 6}}}>
            <Container maxWidth="lg">
                <PageHeader
                    title={t('backoffice.dashboard.title')}
                    caption={t('backoffice.dashboard.subtitle')}
                />
                <Card sx={{mb: 4}}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6">{t('backoffice.dashboard.quickLinks.title')}</Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, minmax(0, 1fr))',
                                        md: 'repeat(4, minmax(0, 1fr))',
                                    },
                                }}
                            >
                                {quickLinks.map((link) => (
                                    <Button key={link.key} variant="outlined" onClick={() => navigate(link.path)}>
                                        {link.label}
                                    </Button>
                                ))}
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default AdminDashboardPage;
