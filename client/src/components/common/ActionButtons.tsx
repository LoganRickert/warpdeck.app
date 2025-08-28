import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';

interface ActionButtonsProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  loading?: boolean;
  primaryVariant?: 'contained' | 'outlined';
  secondaryVariant?: 'contained' | 'outlined';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled = false,
  secondaryDisabled = false,
  loading = false,
  primaryVariant = 'contained',
  secondaryVariant = 'outlined'
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button
        variant={primaryVariant}
        onClick={onPrimary}
        disabled={primaryDisabled || loading}
        sx={{ 
          minWidth: '140px',
          borderRadius: 2,
          px: 3,
          py: 1.5,
          ...(primaryVariant === 'contained' && {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          })
        }}
      >
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
            Saving...
          </>
        ) : (
          primaryLabel
        )}
      </Button>
      
      {secondaryLabel && onSecondary && (
        <Button
          variant={secondaryVariant}
          onClick={onSecondary}
          disabled={secondaryDisabled || loading}
          sx={{ 
            minWidth: '140px',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'error.main',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'error.main',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {secondaryLabel}
        </Button>
      )}
    </Box>
  );
};

export default ActionButtons;
