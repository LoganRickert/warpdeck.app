import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Dashboard } from '../../types';

interface DashboardInfoEditorProps {
  dashboard: Dashboard;
  onSave: (dashboard: Partial<Dashboard>) => Promise<void>;
  onCancel?: () => void;
}

const DashboardInfoEditor: React.FC<DashboardInfoEditorProps> = ({
  dashboard,
  onSave,
  onCancel,
}) => {
  const [editedDashboard, setEditedDashboard] = useState<Dashboard>({
    ...dashboard,
    showCustomBackground: dashboard.showCustomBackground ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update editedDashboard when dashboard prop changes
  useEffect(() => {
    setEditedDashboard({
      ...dashboard,
      showCustomBackground: dashboard.showCustomBackground ?? false,
    });
  }, [dashboard]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave({
        title: editedDashboard.title,
        slug: editedDashboard.slug,
        showSearchBar: editedDashboard.showSearchBar,
        showCustomBackground: editedDashboard.showCustomBackground,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dashboard information');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = editedDashboard.title !== dashboard.title || 
                    editedDashboard.slug !== dashboard.slug ||
                    editedDashboard.showSearchBar !== dashboard.showSearchBar ||
                    editedDashboard.showCustomBackground !== dashboard.showCustomBackground;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ mb: 0 }}>Dashboard Information</Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center'
          }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={saving}
                sx={{ 
                  minWidth: '100px',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'text.secondary',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !hasChanges}
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
              {saving ? 'Saving...' : 'Save Dashboard Info'}
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Dashboard information saved successfully!
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: 2, 
        mb: 3 
      }}>
        <TextField
          label="Title"
          value={editedDashboard.title}
          onChange={(e) => setEditedDashboard({ ...editedDashboard, title: e.target.value })}
          sx={{ flexGrow: 1, minWidth: '250px' }}
        />
        <TextField
          label="Slug"
          value={editedDashboard.slug}
          onChange={(e) => setEditedDashboard({ ...editedDashboard, slug: e.target.value })}
          sx={{ flexGrow: 1, minWidth: '250px' }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={editedDashboard.showSearchBar !== false}
              onChange={(e) => setEditedDashboard({ 
                ...editedDashboard, 
                showSearchBar: e.target.checked 
              })}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#667eea',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  },
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#667eea',
                },
                '& .MuiSwitch-switchBase': {
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          }
          label="Show search bar on this dashboard"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
          When enabled, users will see a search bar at the top of this dashboard. When disabled, the search bar will be hidden.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={editedDashboard.showCustomBackground !== false}
              onChange={(e) => setEditedDashboard({ 
                ...editedDashboard, 
                showCustomBackground: e.target.checked 
              })}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#667eea',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  },
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#667eea',
                },
                '& .MuiSwitch-switchBase': {
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          }
          label="Show custom background on this dashboard"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
          When enabled, you can customize the background with a color or image. When disabled, the default theme background is used.
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Update the basic information for this dashboard. Changes are saved immediately.
      </Typography>
    </Paper>
  );
};

export default DashboardInfoEditor;
