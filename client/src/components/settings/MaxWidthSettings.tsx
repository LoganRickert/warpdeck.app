import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  Slider,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Dashboard } from '../../types';

interface MaxWidthSettingsProps {
  dashboard: Dashboard;
  onMaxWidthChange: (maxWidthEnabled: boolean, maxWidth: number) => void;
}

const MaxWidthSettings: React.FC<MaxWidthSettingsProps> = ({
  dashboard,
  onMaxWidthChange,
}) => {
  const [maxWidthEnabled, setMaxWidthEnabled] = useState(
    dashboard.maxWidthEnabled ?? false
  );
  const [maxWidth, setMaxWidth] = useState(
    dashboard.maxWidth ?? 1200
  );

  // Update local state when dashboard prop changes
  useEffect(() => {
    setMaxWidthEnabled(dashboard.maxWidthEnabled ?? false);
    setMaxWidth(dashboard.maxWidth ?? 1200);
  }, [dashboard]);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setMaxWidthEnabled(newValue);
    onMaxWidthChange(newValue, newValue ? maxWidth : 1200);
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setMaxWidth(value);
    onMaxWidthChange(maxWidthEnabled, value);
  };

  const formatWidth = (value: number) => {
    return `${value}px`;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Max Width Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control the maximum width of your dashboard content. This helps maintain readability on wide screens.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={maxWidthEnabled}
              onChange={handleToggleChange}
              color="primary"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#667eea',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#667eea',
                },
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Enable Max Width
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Restrict dashboard content to a maximum width
              </Typography>
            </Box>
          }
          sx={{ alignItems: 'flex-start', mb: 2 }}
        />
      </Box>

      {maxWidthEnabled && (
        <>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Maximum Width
              </Typography>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ 
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: 1,
                  minWidth: 60,
                  textAlign: 'center'
                }}
              >
                {formatWidth(maxWidth)}
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Slider
                value={maxWidth}
                onChange={handleSliderChange}
                min={650}
                max={3840}
                step={10}
                valueLabelDisplay="auto"
                valueLabelFormat={formatWidth}
                marks={[
                  { value: 650, label: '650px' },
                  { value: 1200, label: '1200px' },
                  { value: 1920, label: '1920px' },
                  { value: 3840, label: '3840px' },
                ]}
                sx={{
                  color: '#667eea',
                  height: 8,
                  '& .MuiSlider-thumb': {
                    height: 20,
                    width: 20,
                    backgroundColor: '#667eea',
                    border: '2px solid #fff',
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(102, 126, 234, 0.16)',
                    },
                    '&.Mui-active': {
                      boxShadow: '0 0 0 14px rgba(102, 126, 234, 0.16)',
                    },
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#667eea',
                    height: 8,
                    borderRadius: 4,
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    height: 8,
                    borderRadius: 4,
                  },
                  '& .MuiSlider-mark': {
                    backgroundColor: 'rgba(102, 126, 234, 0.3)',
                    height: 8,
                    width: 2,
                    borderRadius: 1,
                  },
                  '& .MuiSlider-markActive': {
                    backgroundColor: '#667eea',
                  },
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: '#667eea',
                    '&::before': {
                      borderTopColor: '#667eea',
                    },
                  },
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                    marginTop: '12px',
                    whiteSpace: 'nowrap',
                    '&[data-index="0"]': {
                      left: '15px !important',
                    },
                    '&[data-index="3"]': {
                      paddingRight: '20px',
                    },
                  },
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Mobile-friendly
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ultra-wide display
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default MaxWidthSettings;
