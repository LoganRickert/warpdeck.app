import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { Settings } from '../../types';

interface GlobalSettingsProps {
  settings: Settings;
  onSettingsUpdate: (updates: Partial<Settings>) => Promise<void>;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  settings,
  onSettingsUpdate,
}) => {
  const [editedSettings, setEditedSettings] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update local state when props change
  React.useEffect(() => {
    setEditedSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Find what actually changed
      const changes: Partial<Settings> = {};
      if (editedSettings.defaultTheme !== settings.defaultTheme) {
        changes.defaultTheme = editedSettings.defaultTheme;
      }
      if (editedSettings.defaultDashboardSlug !== settings.defaultDashboardSlug) {
        changes.defaultDashboardSlug = editedSettings.defaultDashboardSlug;
      }

      if (Object.keys(changes).length > 0) {
        await onSettingsUpdate(changes);
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return (
      editedSettings.defaultTheme !== settings.defaultTheme ||
      editedSettings.defaultDashboardSlug !== settings.defaultDashboardSlug
    );
  };

  const handleDefaultDashboardChange = (event: any) => {
    const newSlug = event.target.value;
    if (newSlug) {
      setEditedSettings(prev => ({ ...prev, defaultDashboardSlug: newSlug }));
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ mb: 0 }}>Global Settings</Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            sx={{ 
              minWidth: '140px',
              borderRadius: 2,
              px: 2,
              py: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Theme</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Default Theme</InputLabel>
          <Select
            value={editedSettings.defaultTheme}
            label="Default Theme"
            onChange={(e) => setEditedSettings(prev => ({ ...prev, defaultTheme: e.target.value as 'light' | 'dark' }))}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          Choose the default theme for new users
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Dashboard Settings</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Default Dashboard</InputLabel>
          <Select
            value={editedSettings.defaultDashboardSlug}
            label="Default Dashboard"
            onChange={handleDefaultDashboardChange}
          >
            {editedSettings.dashboards.map((dashboard) => (
              <MenuItem key={dashboard.id} value={dashboard.slug}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {dashboard.title}
                  {dashboard.slug === editedSettings.defaultDashboardSlug && (
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
        {editedSettings.dashboards.length === 0 && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            No dashboards available. Create a dashboard first to set it as default.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default GlobalSettings;
