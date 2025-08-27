import React from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { Settings } from '../../types';

interface GlobalSettingsProps {
  settings: Settings;
  onSettingsUpdate: (updates: Partial<Settings>) => void;
  onSuccess?: (message: string) => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  settings,
  onSettingsUpdate,
  onSuccess,
}) => {
  const handleDefaultDashboardChange = async (event: any) => {
    const newSlug = event.target.value;
    if (newSlug && newSlug !== settings.defaultDashboardSlug) {
      // Validate that the selected dashboard exists
      const dashboardExists = settings.dashboards.some(d => d.slug === newSlug);
      if (dashboardExists) {
        const selectedDashboard = settings.dashboards.find(d => d.slug === newSlug);
        onSettingsUpdate({ defaultDashboardSlug: newSlug });
        
        // Show success message
        if (onSuccess && selectedDashboard) {
          onSuccess(`"${selectedDashboard.title}" is now the default dashboard`);
        }
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Global Settings</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Theme</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Default Theme</InputLabel>
          <Select
            value={settings.defaultTheme}
            label="Default Theme"
            onChange={(e) => onSettingsUpdate({ defaultTheme: e.target.value as 'light' | 'dark' })}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Dashboard Settings</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Default Dashboard</InputLabel>
          <Select
            value={settings.defaultDashboardSlug}
            label="Default Dashboard"
            onChange={handleDefaultDashboardChange}
          >
            {settings.dashboards.map((dashboard) => (
              <MenuItem key={dashboard.id} value={dashboard.slug}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {dashboard.title}
                  {dashboard.slug === settings.defaultDashboardSlug && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        backgroundColor: 'primary.main', 
                        color: 'white', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1,
                        fontSize: '0.7rem'
                      }}
                    >
                      Default
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          This dashboard will be displayed when the application first loads
        </Typography>
        {settings.dashboards.length === 0 && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            No dashboards available. Create a dashboard first to set it as default.
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Directories</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Dashboards Directory"
            value={settings.dashboardsDir}
            onChange={(e) => onSettingsUpdate({ dashboardsDir: e.target.value })}
            fullWidth
            helperText="Directory where dashboard files are stored"
          />
          <TextField
            label="Uploads Directory"
            value={settings.uploadsDir}
            onChange={(e) => onSettingsUpdate({ uploadsDir: e.target.value })}
            fullWidth
            helperText="Directory where uploaded files (thumbnails) are stored"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default GlobalSettings;
