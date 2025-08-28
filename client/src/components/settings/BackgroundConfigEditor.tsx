import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import { BackgroundConfig } from '../../types';
import { FormSection, ColorPicker, ActionButtons, ImageUpload } from '../common';
import { useFormState } from '../../hooks/useFormState';
import { THEME_COLORS, API_ENDPOINTS } from '../../constants';

interface BackgroundConfigEditorProps {
  backgroundConfig?: BackgroundConfig;
  onSave: (backgroundConfig: BackgroundConfig | undefined) => Promise<void>;
}

const BackgroundConfigEditor: React.FC<BackgroundConfigEditorProps> = ({
  backgroundConfig,
  onSave,
}) => {
  const [editedConfig, setEditedConfig] = useState<BackgroundConfig>({
    type: backgroundConfig?.type || 'color',
    value: backgroundConfig?.value || THEME_COLORS.PRIMARY,
    textColor: backgroundConfig?.textColor || THEME_COLORS.PRIMARY
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { saving, error, success, handleSave: saveForm, clearError } = useFormState({
    onSave: async (config: BackgroundConfig | undefined) => {
      if (config?.type === 'image' && imageFile) {
        // Upload image first
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch(API_ENDPOINTS.UPLOAD_BACKGROUND, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const result = await response.json();
        const finalConfig: BackgroundConfig = {
          type: 'image',
          value: result.filename
        };
        
        await onSave(finalConfig);
      } else {
        await onSave(config);
      }
    },
    autoHideSuccess: true,
    successHideDelay: 3000
  });

  // Update editedConfig when backgroundConfig prop changes
  useEffect(() => {
    setEditedConfig({
      type: backgroundConfig?.type || 'color',
      value: backgroundConfig?.value || THEME_COLORS.PRIMARY,
      textColor: backgroundConfig?.textColor || THEME_COLORS.PRIMARY
    });
  }, [backgroundConfig]);

  const handleSave = async () => {
    await saveForm(editedConfig);
  };

  const handleRemoveBackground = async () => {
    // Reset local state to reflect removal
    setEditedConfig({
      type: 'color',
      value: THEME_COLORS.PRIMARY,
      textColor: THEME_COLORS.PRIMARY
    });
    
    // Clear any image file
    setImageFile(null);
    
    await saveForm(undefined);
  };

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setEditedConfig({ type: 'image', value: '' });
  };

  const hasChanges = () => {
    if (backgroundConfig?.type !== editedConfig.type) return true;
    if (backgroundConfig?.value !== editedConfig.value) return true;
    if (backgroundConfig?.textColor !== editedConfig.textColor) return true;
    if (imageFile) return true;
    return false;
  };

  return (
    <FormSection 
      title="Background Configuration"
      description="Choose how to customize the background for this dashboard"
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Background configuration saved successfully!
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <RadioGroup
          value={editedConfig.type}
          onChange={(e) => {
            const newType = e.target.value as 'color' | 'image';
            setEditedConfig({
              type: newType,
              value: newType === 'color' ? THEME_COLORS.PRIMARY : editedConfig.value,
              textColor: editedConfig.textColor || THEME_COLORS.PRIMARY
            });
          }}
          sx={{ mb: 3 }}
        >
          <FormControlLabel 
            value="color" 
            control={<Radio />} 
            label="Solid Color" 
          />
          <FormControlLabel 
            value="image" 
            control={<Radio />} 
            label="Background Image" 
          />
        </RadioGroup>

        {editedConfig.type === 'color' && (
          <ColorPicker
            value={editedConfig.value}
            onChange={(color) => setEditedConfig({ ...editedConfig, value: color })}
            label="Background Color"
            resetValue={THEME_COLORS.PRIMARY}
          />
        )}

        {editedConfig.type === 'image' && (
          <ImageUpload
            label="Background Image"
            onImageChange={handleImageChange}
            currentImageUrl={backgroundConfig?.type === 'image' ? `${API_ENDPOINTS.IMAGES}/${backgroundConfig.value}` : undefined}
          />
        )}

        {/* Text Color Configuration - works for both background types */}
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="body2" gutterBottom>
            Header Text Color
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the color for the dashboard title and header text to ensure good readability
          </Typography>
          <ColorPicker
            value={editedConfig.textColor || THEME_COLORS.PRIMARY}
            onChange={(color) => setEditedConfig({ ...editedConfig, textColor: color })}
            label=""
            showReset={false}
            resetValue={THEME_COLORS.PRIMARY}
          />
        </Box>
      </Box>

      <ActionButtons
        primaryLabel="Save Background"
        onPrimary={handleSave}
        secondaryLabel="Remove Background"
        onSecondary={handleRemoveBackground}
        primaryDisabled={!hasChanges()}
        loading={saving}
      />
    </FormSection>
  );
};

export default BackgroundConfigEditor;
