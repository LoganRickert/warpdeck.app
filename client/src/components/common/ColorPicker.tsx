import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  resetValue?: string;
  onReset?: () => void;
  showReset?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  resetValue = '#667eea',
  onReset,
  showReset = true
}) => {
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange(resetValue);
    }
  };

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '50px',
            height: '50px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
        {showReset && (
          <Button
            size="small"
            variant="outlined"
            onClick={handleReset}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            Reset to Theme
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ColorPicker;
