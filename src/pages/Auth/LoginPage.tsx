import React from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api';
import { ApiError, setStoredToken } from '../../services/httpClient';
import { FranchiseeLoginRequest } from '../../types/api';

interface LoginPageProps {
  onSuccess?: () => void;
}

const MAX_LENGTH = {
  email: 320,
  passwordMin: 8,
};

type LoginField = 'email' | 'password';

type FormErrors = Partial<Record<LoginField, string>>;

const initialValues: Record<LoginField, string> = {
  email: '',
  password: '',
};

const LoginPage = ({ onSuccess }: LoginPageProps): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleChange = (field: LoginField) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!values.email.trim()) {
      nextErrors.email = t('auth.login.validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = t('auth.login.validation.email');
    } else if (values.email.length > MAX_LENGTH.email) {
      nextErrors.email = t('auth.login.validation.maxLength', { count: MAX_LENGTH.email });
    }

    if (!values.password.trim()) {
      nextErrors.password = t('auth.login.validation.required');
    } else if (values.password.length < MAX_LENGTH.passwordMin) {
      nextErrors.password = t('auth.login.validation.passwordLength', { count: MAX_LENGTH.passwordMin });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const payload: FranchiseeLoginRequest = {
      email: values.email,
      password: values.password,
    };

    authApi
      .login(payload)
      .then((response) => {
        setStoredToken(response.accessToken);
        navigate('/dashboard');
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch((error: unknown) => {
        const messageKey = error instanceof ApiError && error.status === 400
          ? 'auth.login.messages.errorInvalid'
          : 'auth.login.messages.errorGeneric';
        setSubmitError(t(messageKey));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleBack = (): void => {
    navigate('/');
  };

  const handleNavigateSignup = (): void => {
    navigate('/signup');
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>

          <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h3">{t('auth.login.title')}</Typography>
              <Typography variant="body1" color="text.secondary">
              </Typography>
              {submitError && <Alert severity="error">{submitError}</Alert>}
            </Stack>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label={t('auth.login.fields.email.label')}
                  placeholder={t('auth.login.fields.email.placeholder')}
                  value={values.email}
                  onChange={handleChange('email')}
                  type="email"
                  autoComplete="email"
                  required
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
                <TextField
                  fullWidth
                  label={t('auth.login.fields.password.label')}
                  placeholder={t('auth.login.fields.password.placeholder')}
                  value={values.password}
                  onChange={handleChange('password')}
                  type="password"
                  autoComplete="current-password"
                  required
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                />
              </Stack>

              <Stack spacing={2} sx={{ mt: 4 }}>
                 <Button type="submit" variant="contained" color="secondary" size="large" disabled={isSubmitting}>
                   {isSubmitting ? t('auth.login.cta.loading') : t('auth.login.cta.submit')}
                 </Button>
                <Button variant="text" onClick={handleNavigateSignup}>
                  {t('auth.login.cta.goSignup')}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoginPage;
