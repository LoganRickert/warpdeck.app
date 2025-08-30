import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, ContentCopy as ContentCopyIcon, DragIndicator as DragIndicatorIcon, Add as AddIcon } from '@mui/icons-material';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '../../types';
import LinkEditor from './LinkEditor';

interface LinkManagementProps {
  links: Link[];
  onAddLink: () => void;
  onDeleteLink: (linkId: string) => void;
  onUpdateLink: (linkId: string, updates: Partial<Link>) => void;
  onDuplicateLink: (linkId: string) => void;
  onReorderLink: (oldIndex: number, newIndex: number) => void;
  isUpdating?: boolean;
}

const LinkManagement: React.FC<LinkManagementProps> = ({
  links,
  onAddLink,
  onDeleteLink,
  onUpdateLink,
  onDuplicateLink,
  onReorderLink,
  isUpdating,
}) => {
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingLinkState, setEditingLinkState] = useState<Partial<Link>>({});
  const [duplicatingLinkId, setDuplicatingLinkId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = links.findIndex(link => link.id === active.id);
      const newIndex = links.findIndex(link => link.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderLink(oldIndex, newIndex);
      }
    }
  };

  const handleEditLink = (linkId: string) => {
    setEditingLinkId(linkId);
    const link = links.find(l => l.id === linkId);
    if (link) {
      setEditingLinkState({
        label: link.label,
        url: link.url,
        description: link.description,
        thumbnail: link.thumbnail,
        // Include new customization properties
        colorBar: link.colorBar,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor,
        openInNewTab: link.openInNewTab,
        gridColumns: link.gridColumns,
      });
    }
  };

  const handleSaveLink = (linkId: string, updates: Partial<Link>) => {
    onUpdateLink(linkId, updates);
    setEditingLinkId(null);
    setEditingLinkState({});
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
    setEditingLinkState({});
  };

  const handleDuplicateLink = (linkId: string) => {
    setDuplicatingLinkId(linkId);
  };

  const confirmDuplicate = () => {
    if (duplicatingLinkId) {
      onDuplicateLink(duplicatingLinkId);
      setDuplicatingLinkId(null);
    }
  };

  const cancelDuplicate = () => {
    setDuplicatingLinkId(null);
  };

  const editingLink = editingLinkId ? links.find(l => l.id === editingLinkId) : null;

  // Sortable list item component
  const SortableListItem = ({ link }: { link: Link }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: link.id });

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
            <DragIndicatorIcon />
          </Box>
          <ListItemText
            primary={
              <Typography variant="body1" component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {link.label}
              </Typography>
            }
            secondary={
              <>
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    display: 'block', 
                    mb: 0.5,
                    wordBreak: 'break-all',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  {link.url}
                </Typography>
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    display: 'block',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {link.description || 'No description'}
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
              onClick={() => handleEditLink(link.id)}
              title="Edit Link"
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
              onClick={() => handleDuplicateLink(link.id)}
              title="Duplicate Link"
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
              <ContentCopyIcon />
            </IconButton>
            <IconButton
              edge="end"
              onClick={() => onDeleteLink(link.id)}
              title="Delete Link"
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
            onClick={() => handleEditLink(link.id)}
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
            onClick={() => handleDuplicateLink(link.id)}
            startIcon={<ContentCopyIcon />}
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
            Duplicate
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onDeleteLink(link.id)}
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

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h6">Links ({links.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddLink}
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
          Add Link
        </Button>
      </Box>

      <Box sx={{ mb: 2, p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          💡 Drag the <DragIndicatorIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', mx: 0.5 }} /> icon to reorder links
        </Typography>
      </Box>

      <List>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map(link => link.id)}
            strategy={verticalListSortingStrategy}
          >
            {links.map((link) => (
                              <SortableListItem key={link.id} link={link} />
            ))}
          </SortableContext>
        </DndContext>
      </List>

      {/* Edit Link Dialog */}
      <Dialog 
        open={!!editingLinkId} 
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Link</DialogTitle>
        <DialogContent>
          {editingLink && (
            <LinkEditor
              link={editingLink}
              onStateChange={setEditingLinkState}
              isLoading={isUpdating}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button 
            onClick={() => {
              if (editingLinkId && editingLinkState.label && editingLinkState.url) {
                handleSaveLink(editingLinkId, editingLinkState);
              }
            }}
            variant="contained"
            disabled={!editingLinkState.label || !editingLinkState.url}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Link Confirmation Dialog */}
      <Dialog 
        open={!!duplicatingLinkId} 
        onClose={cancelDuplicate}
        maxWidth="sm"
      >
        <DialogTitle>Duplicate Link</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to duplicate this link? A copy will be created below the original link.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDuplicate}>Cancel</Button>
          <Button 
            onClick={confirmDuplicate}
            variant="contained"
            color="primary"
          >
            Duplicate
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LinkManagement;
