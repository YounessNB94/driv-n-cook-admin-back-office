import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  caption?: string;
  backLabel?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, caption, backLabel, onBack, actions }: PageHeaderProps): React.ReactElement => {
  const renderedActions = React.Children.toArray(actions);
  const showBackButton = Boolean(onBack && backLabel);

  return (
    <Stack spacing={caption ? 0.5 : 1} mb={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={1} flex={1} minWidth={0}>
          <Typography variant="h4">{title}</Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          alignItems="center"
        >
          {renderedActions.map((action, index) => (
            <Box key={`header-action-${index}`} sx={{ display: 'inline-flex' }}>
              {action}
            </Box>
          ))}
          {showBackButton && (
            <Button variant="outlined" color="primary" onClick={onBack}>
              {backLabel}
            </Button>
          )}
        </Stack>
      </Stack>
      {caption && (
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      )}
    </Stack>
  );
};

export default PageHeader;
