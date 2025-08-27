import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Download as DownloadIcon, Upload as UploadIcon, DragIndicator as DragIcon } from '@mui/icons-material';
import { Dashboard } from '../../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper function to generate unique IDs
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface DashboardManagementProps {
  dashboards: Dashboard[];
  onAddDashboard: () => void;
  onEditDashboard: (dashboard: Dashboard) => void;
  onDeleteDashboard: (dashboardId: string) => void;
  onImportDashboard?: (dashboard: Dashboard) => void;
  onReorderDashboards?: (dashboards: Dashboard[]) => void;
}

// Sortable dashboard item component
const SortableDashboardItem = ({ 
  dashboard, 
  onEditDashboard, 
  onDeleteDashboard, 
  onDownloadDashboard 
}: { 
  dashboard: Dashboard;
  onEditDashboard: (dashboard: Dashboard) => void;
  onDeleteDashboard: (dashboardId: string) => void;
  onDownloadDashboard: (dashboard: Dashboard) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dashboard.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      divider
      sx={{
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
        borderRadius: isDragging ? 1 : 0,
        boxShadow: isDragging ? 3 : 'none',
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: 'flex',
          alignItems: 'center',
          mr: 2,
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          color: 'text.secondary',
        }}
      >
        <DragIcon />
      </Box>
      <ListItemText
        primary={dashboard.title}
        secondary={`Slug: ${dashboard.slug} • Links: ${dashboard.links.length}`}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          onClick={() => onDownloadDashboard(dashboard)}
          title="Download Dashboard JSON"
          sx={{ mr: 1 }}
        >
          <DownloadIcon />
        </IconButton>
        <IconButton
          edge="end"
          onClick={() => onEditDashboard(dashboard)}
          title="Edit Dashboard"
          sx={{ mr: 1 }}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          edge="end"
          onClick={() => onDeleteDashboard(dashboard.id)}
          title="Delete Dashboard"
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const DashboardManagement: React.FC<DashboardManagementProps> = ({
  dashboards,
  onAddDashboard,
  onEditDashboard,
  onDeleteDashboard,
  onImportDashboard,
  onReorderDashboards,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorderDashboards) {
      const oldIndex = dashboards.findIndex(d => d.id === active.id);
      const newIndex = dashboards.findIndex(d => d.id === over?.id);
      
      const reorderedDashboards = arrayMove(dashboards, oldIndex, newIndex);
      onReorderDashboards(reorderedDashboards);
    }
  };

  const handleDownloadDashboard = (dashboard: Dashboard) => {
    // Create a blob with the dashboard JSON data
    const jsonData = JSON.stringify(dashboard, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dashboard.slug}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportDashboard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImportDashboard) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedDashboard = JSON.parse(e.target?.result as string) as Dashboard;
          
          // Generate new UUID and update dashboard properties
          const newDashboard: Dashboard = {
            ...importedDashboard,
            id: generateId(), // Generate new ID to avoid conflicts
            links: importedDashboard.links.map(link => ({
              ...link,
              id: generateId() // Generate new ID for each link as well
            }))
          };
          
          onImportDashboard(newDashboard);
        } catch (error) {
          console.error('Failed to parse dashboard JSON:', error);
          alert('Invalid dashboard JSON file');
        }
      };
      reader.readAsText(file);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Manage Dashboards</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
          >
            Import Dashboard
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleImportDashboard}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddDashboard}
          >
            Add Dashboard
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={dashboards.map(d => d.id)}
            strategy={verticalListSortingStrategy}
          >
            <List>
              {dashboards.map((dashboard) => (
                <SortableDashboardItem
                  key={dashboard.id}
                  dashboard={dashboard}
                  onEditDashboard={onEditDashboard}
                  onDeleteDashboard={onDeleteDashboard}
                  onDownloadDashboard={handleDownloadDashboard}
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>
      </Paper>
    </Box>
  );
};

export default DashboardManagement;
