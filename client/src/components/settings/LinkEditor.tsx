import React, { useState, useCallback, useRef } from 'react';
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
  
  // Debounced version of onStateChange to prevent excessive re-renders
  const debouncedOnStateChange = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedUpdate = useCallback((newState: Partial<Link>) => {
    if (debouncedOnStateChange.current) {
      clearTimeout(debouncedOnStateChange.current);
    }
    debouncedOnStateChange.current = setTimeout(() => {
      onStateChange(newState);
    }, 300); // 300ms delay
  }, [onStateChange]);
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debouncedOnStateChange.current) {
        clearTimeout(debouncedOnStateChange.current);
      }
    };
  }, []);



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
          const newState = { ...editedLink, thumbnail: result.thumbnailUrl };
          setEditedLink(newState);
          debouncedUpdate(newState);
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
    const newState = { ...editedLink, thumbnail: '' };
    setEditedLink(newState);
    debouncedUpdate(newState);
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const hasThumbnail = () => {
    return !!(thumbnailPreview || (link.thumbnail && editedLink.thumbnail !== ''));
  };

  return (
    <Box sx={{ pt: 1, position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Basic Link Information */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2 
        }}>
          <TextField
            label="Label"
            value={editedLink.label || ''}
            onChange={(e) => {
              const newState = { ...editedLink, label: e.target.value };
              setEditedLink(newState);
              debouncedUpdate(newState);
            }}
            sx={{ flexGrow: 1, minWidth: '250px' }}
            required
          />
          <TextField
            label="URL"
            value={editedLink.url || ''}
            onChange={(e) => {
              const newState = { ...editedLink, url: e.target.value };
              setEditedLink(newState);
              debouncedUpdate(newState);
            }}
            sx={{ flexGrow: 1, minWidth: '250px' }}
            required
          />
        </Box>

        <TextField
          label="Description"
          value={editedLink.description || ''}
          onChange={(e) => {
            const newState = { ...editedLink, description: e.target.value };
            setEditedLink(newState);
            debouncedUpdate(newState);
          }}
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
                    onChange={(e) => {
                      const newState = { ...editedLink, colorBar: e.target.value };
                      setEditedLink(newState);
                      debouncedUpdate(newState);
                    }}
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
                    onChange={(e) => {
                      const newState = { ...editedLink, backgroundColor: e.target.value };
                      setEditedLink(newState);
                      debouncedUpdate(newState);
                    }}
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
                    onChange={(e) => {
                      const newState = { ...editedLink, textColor: e.target.value };
                      setEditedLink(newState);
                      debouncedUpdate(newState);
                    }}
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
                    onChange={(e) => {
                      const newState = { ...editedLink, openInNewTab: e.target.checked };
                      setEditedLink(newState);
                      debouncedUpdate(newState);
                    }}
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
                    onChange={(e) => {
                      const newState = { ...editedLink, gridColumns: e.target.value as number };
                      setEditedLink(newState);
                      debouncedUpdate(newState);
                    }}
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
      
      {/* Loading Overlay - Full Screen within Dialog */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: (theme) => theme.zIndex.modal + 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'scale(0.95)',
              },
              '100%': {
                opacity: 1,
                transform: 'scale(1)',
              },
            },
          }}
        >
          <Box sx={{ textAlign: 'center', p: 4, maxWidth: 400 }}>
            <Box sx={{ 
              position: 'relative',
              mb: 3,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -20,
                left: -20,
                right: -20,
                bottom: -20,
                background: 'radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite',
              },
              '@keyframes pulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  opacity: 0.5,
                },
                '50%': {
                  transform: 'scale(1.1)',
                  opacity: 0.8,
                },
              },
            }}>
              <CircularProgress 
                color="primary" 
                size={80} 
                thickness={4}
                sx={{ 
                  color: '#667eea',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            </Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Downloading favicon...
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
              Please wait while we fetch the website icon
            </Typography>
            {editedLink.url && (
              <Box sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                p: 2, 
                borderRadius: 1, 
                mb: 2,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
              }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                  {editedLink.url}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              This may take a few seconds
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LinkEditor;
