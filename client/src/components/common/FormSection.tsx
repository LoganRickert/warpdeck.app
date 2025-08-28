import React from 'react';
import { Typography, Paper } from '@mui/material';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  sx?: any;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description, 
  children, 
  sx = {} 
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3, ...sx }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      
      {children}
    </Paper>
  );
};

export default FormSection;
