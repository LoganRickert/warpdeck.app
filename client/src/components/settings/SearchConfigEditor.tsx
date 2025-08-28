import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { SearchConfig } from '../../types';

interface SearchConfigEditorProps {
  searchConfig: SearchConfig;
  onSave: (searchConfig: SearchConfig) => Promise<void>;
  onCancel?: () => void;
}

const SearchConfigEditor: React.FC<SearchConfigEditorProps> = ({
  searchConfig,
  onSave,
  onCancel,
}) => {
  const [editedConfig, setEditedConfig] = useState<SearchConfig>(searchConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave(editedConfig);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save search configuration');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(editedConfig) !== JSON.stringify(searchConfig);

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
          <Typography variant="h6" sx={{ mb: 0 }}>Search Configuration</Typography>
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
              {saving ? 'Saving...' : 'Save Search Config'}
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
          Search configuration saved successfully!
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={editedConfig.openInNewTab}
              onChange={(e) => setEditedConfig({
                ...editedConfig,
                openInNewTab: e.target.checked
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
          label="Open search results in new tab"
        />
        
        <FormControl fullWidth>
          <InputLabel>Search Engine</InputLabel>
          <Select
            value={editedConfig.searchEngine}
            label="Search Engine"
            onChange={(e) => setEditedConfig({
              ...editedConfig,
              searchEngine: e.target.value as 'google' | 'duckduckgo' | 'bing'
            })}
          >
            <MenuItem value="google">Google</MenuItem>
            <MenuItem value="duckduckgo">DuckDuckGo</MenuItem>
            <MenuItem value="bing">Bing</MenuItem>
          </Select>
        </FormControl>
        
        <Typography variant="body2" color="text.secondary">
          Configure how the search bar behaves on this dashboard. Changes are saved immediately.
        </Typography>
      </Box>
    </Paper>
  );
};

export default SearchConfigEditor;
