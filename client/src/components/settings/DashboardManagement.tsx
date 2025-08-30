import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
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
  onDeleteDashboard: (dashboard: Dashboard) => void;
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
  onDeleteDashboard: (dashboard: Dashboard) => void;
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
      sx={{
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        backgroundColor: isDragging ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
        borderRadius: 2,
        boxShadow: isDragging ? '0 8px 25px rgba(102, 126, 234, 0.2)' : 'none',
        mb: 1,
        border: '1px solid',
        borderColor: isDragging ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(102, 126, 234, 0.1)',
          transform: 'translateY(-1px)',
        },
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
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
            p: 0.5,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: 'primary.main',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <DragIcon />
        </Box>
        <ListItemText
          primary={
            <Typography variant="body1" component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {dashboard.title}
            </Typography>
          }
          secondary={
            <>
              <Typography 
                variant="body2" 
                component="span" 
                sx={{ 
                  display: 'inline-block', 
                  width: '80px', 
                  mr: 1,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: 1,
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textAlign: 'center',
                }}
              >
                Links: {dashboard.links.length}
              </Typography>
              <Typography 
                variant="body2" 
                component="span" 
                sx={{ 
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                }}
              >
                Slug: {dashboard.slug}
              </Typography>
            </>
          }
        />
        {/* Desktop buttons - hidden on mobile */}
        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' }, 
          gap: 1,
          alignItems: 'center'
        }}>
          <IconButton
            edge="end"
            onClick={() => onDownloadDashboard(dashboard)}
            title="Download Dashboard JSON"
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                color: 'primary.main',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <DownloadIcon />
          </IconButton>
          <IconButton
            edge="end"
            onClick={() => onEditDashboard(dashboard)}
            title="Edit Dashboard"
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                color: 'primary.main',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            onClick={() => onDeleteDashboard(dashboard)}
            title="Delete Dashboard"
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                color: 'error.main',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Mobile buttons - shown below content on mobile */}
      <Box sx={{ 
        display: { xs: 'flex', sm: 'none' }, 
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'center',
        mt: 1.5,
        pt: 1.5,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100%',
      }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onDownloadDashboard(dashboard)}
          startIcon={<DownloadIcon />}
          sx={{ 
            color: 'text.secondary',
            borderColor: 'rgba(102, 126, 234, 0.3)',
            borderRadius: 2,
            px: 2,
            py: 1,
            minWidth: '100px',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: 'primary.main',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Download
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onEditDashboard(dashboard)}
          startIcon={<EditIcon />}
          sx={{ 
            color: 'text.secondary',
            borderColor: 'rgba(102, 126, 234, 0.3)',
            borderRadius: 2,
            px: 2,
            py: 1,
            minWidth: '100px',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: 'primary.main',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onDeleteDashboard(dashboard)}
          startIcon={<DeleteIcon />}
          sx={{ 
            color: 'error.main',
            borderColor: 'rgba(244, 67, 54, 0.3)',
            borderRadius: 2,
            px: 2,
            py: 1,
            minWidth: '100px',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: 'error.main',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Delete
        </Button>
      </Box>
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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ mb: 0 }}>Manage Dashboards</Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center'
          }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ 
                minWidth: '140px',
                borderRadius: 2,
                px: 2,
                py: 1,
                borderColor: 'rgba(102, 126, 234, 0.3)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'text.secondary',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
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
              Add Dashboard
            </Button>
          </Box>
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
