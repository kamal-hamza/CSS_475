import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, icon, actions }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2,
        mb: 4,
        p: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, rgba(1, 51, 105, 0.4) 0%, rgba(15, 23, 42, 0) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #013369 0%, #001E3C 100%)',
              color: 'white',
              boxShadow: '0 8px 16px -4px rgba(1, 51, 105, 0.5)',
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 32 } })}
          </Box>
        )}
        <Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 0.5,
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {actions && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
