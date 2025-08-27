import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
} from '@mui/material';
import { Dashboard } from '../../types';

interface DashboardEditorProps {
  dashboard: Dashboard;
  onSave: (dashboard: Dashboard) => void;
  onCancel: () => void;
}

const DashboardEditor: React.FC<DashboardEditorProps> = ({
  dashboard,
  onSave,
  onCancel,
}) => {
  const [editedDashboard, setEditedDashboard] = React.useState<Dashboard>(dashboard);

  const handleSave = () => {
    onSave(editedDashboard);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Editing: {dashboard.title}</Typography>
        <Button
          variant="outlined"
          onClick={onCancel}
        >
          Back to Dashboards
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Dashboard Information</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Title"
            value={editedDashboard.title}
            onChange={(e) => setEditedDashboard({ ...editedDashboard, title: e.target.value })}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Slug"
            value={editedDashboard.slug}
            onChange={(e) => setEditedDashboard({ ...editedDashboard, slug: e.target.value })}
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Paper>
    </Box>
  );
};

export default DashboardEditor;
