import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Switch,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { Link } from '../../types';

interface LinkEditorProps {
  link: Link;
  onStateChange: (state: Partial<Link>) => void;
  isLoading?: boolean;
}

const LinkEditor: React.FC<LinkEditorProps> = ({
  link,
  onStateChange,
  isLoading,
}) => {
  const [editedLink, setEditedLink] = useState<Partial<Link>>({
    label: link.label || '',
    url: link.url || '',
    icon: link.icon || '',
    description: link.description || '',
    thumbnail: link.thumbnail || '',
    // Initialize new properties with defaults
    colorBar: link.colorBar || '#121212',
    backgroundColor: link.backgroundColor || '',
    textColor: link.textColor || '',
    openInNewTab: link.openInNewTab || false,
    gridColumns: link.gridColumns || 1,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(link.thumbnail || null);

  // Notify parent of state changes
  React.useEffect(() => {
    onStateChange(editedLink);
  }, [editedLink, onStateChange]);

  const handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Automatically upload the file
      try {
        const formData = new FormData();
        formData.append('thumbnail', file);
        
        // Upload the thumbnail and get the URL
        const response = await fetch('/api/upload/thumbnail', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          setEditedLink(prev => ({ ...prev, thumbnail: result.thumbnailUrl }));
          setThumbnailFile(null); // Clear the file since it's uploaded
        } else {
          console.error('Failed to upload thumbnail:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to upload thumbnail:', error);
      }
    }
  };

  const removeThumbnail = () => {
    console.log('Removing thumbnail, current state:', editedLink.thumbnail);
    setEditedLink({ ...editedLink, thumbnail: '' });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    console.log('Thumbnail removed, new state:', { ...editedLink, thumbnail: '' });
  };

  const hasThumbnail = () => {
    return !!(thumbnailPreview || (link.thumbnail && editedLink.thumbnail !== ''));
  };

  return (
    <Box sx={{ pt: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Basic Link Information */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Label"
            value={editedLink.label || ''}
            onChange={(e) => setEditedLink({ ...editedLink, label: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="URL"
            value={editedLink.url || ''}
            onChange={(e) => setEditedLink({ ...editedLink, url: e.target.value })}
            fullWidth
            required
          />
        </Box>

        <TextField
          label="Icon (FontAwesome class)"
          value={editedLink.icon || ''}
          onChange={(e) => setEditedLink({ ...editedLink, icon: e.target.value })}
          fullWidth
          helperText="e.g., 'fa-github', 'fa-twitter' (optional)"
        />

        <TextField
          label="Description"
          value={editedLink.description || ''}
          onChange={(e) => setEditedLink({ ...editedLink, description: e.target.value })}
          fullWidth
          multiline
          rows={2}
        />

        {/* Appearance Customization */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Appearance
          </Typography>
          
          {/* Color Customization */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customize the visual appearance of this link
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Left Border Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={editedLink.colorBar ?? '#121212'}
                    onChange={(e) => setEditedLink({ ...editedLink, colorBar: e.target.value })}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {editedLink.colorBar ?? '#121212'}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  Background Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={editedLink.backgroundColor || '#ffffff'}
                    onChange={(e) => setEditedLink({ ...editedLink, backgroundColor: e.target.value })}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {editedLink.backgroundColor || 'Theme default'}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  Text Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={editedLink.textColor || '#000000'}
                    onChange={(e) => setEditedLink({ ...editedLink, textColor: e.target.value })}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {editedLink.textColor || 'Theme default'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Behavior and Layout */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Control how the link behaves and appears in the grid
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedLink.openInNewTab || false}
                    onChange={(e) => setEditedLink({ ...editedLink, openInNewTab: e.target.checked })}
                  />
                }
                label="Open link in new tab"
              />
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  Grid Span
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={editedLink.gridColumns || 1}
                    onChange={(e) => setEditedLink({ ...editedLink, gridColumns: e.target.value as number })}
                    displayEmpty
                  >
                    <MenuItem value={1}>1 column (normal size)</MenuItem>
                    <MenuItem value={2}>2 columns (wide)</MenuItem>
                    <MenuItem value={3}>3 columns (extra wide)</MenuItem>
                    <MenuItem value={4}>4 columns (full width)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Thumbnail Section */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Thumbnail
          </Typography>
          
          {/* Current Thumbnail Display */}
          {hasThumbnail() && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={thumbnailPreview || link.thumbnail}
                sx={{ width: 48, height: 48 }}
              />
              <Typography variant="body2" color="text.secondary">
                Current thumbnail
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={removeThumbnail}
              >
                Remove
              </Button>
            </Box>
          )}

          {/* Thumbnail Upload */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Change Thumbnail
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleThumbnailChange}
              />
            </Button>
            {thumbnailFile && (
              <Typography variant="body2" color="text.secondary">
                {thumbnailFile.name}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Loading Overlay */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={isLoading || false}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            Downloading favicon...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
            Please wait while we fetch the website icon
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default LinkEditor;
