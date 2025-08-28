import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface ImageUploadProps {
  label: string;
  onImageChange: (file: File) => void;
  currentImageUrl?: string;
  previewUrl?: string;
  accept?: string;
  uploadEndpoint?: string;
  onUploadSuccess?: (filename: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  onImageChange,
  currentImageUrl,
  previewUrl,
  accept = 'image/*',
  uploadEndpoint,
  onUploadSuccess
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(previewUrl || null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !uploadEndpoint || !onUploadSuccess) return;

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        onUploadSuccess(result.filename || result.thumbnailUrl);
        setImageFile(null);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const hasImage = imagePreview || currentImageUrl;

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <input
          type="file"
          accept={accept}
          onChange={handleImageChange}
          style={{ display: 'none' }}
          id={`${label.toLowerCase().replace(/\s+/g, '-')}-input`}
        />
        <label htmlFor={`${label.toLowerCase().replace(/\s+/g, '-')}-input`}>
          <Button
            variant="outlined"
            component="span"
            sx={{ mb: 2 }}
          >
            Choose Image
          </Button>
        </label>
        
        {hasImage && (
          <Box sx={{ 
            width: '200px', 
            height: '120px', 
            border: '2px dashed #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <img
              src={imagePreview || currentImageUrl}
              alt="Image preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        )}

        {imageFile && uploadEndpoint && onUploadSuccess && (
          <Button
            variant="contained"
            onClick={handleUpload}
            size="small"
          >
            Upload Image
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ImageUpload;
