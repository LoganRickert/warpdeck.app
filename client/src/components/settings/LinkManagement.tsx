import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon, ContentCopy as ContentCopyIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
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
        icon: link.icon,
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
          <DragIndicatorIcon />
        </Box>
        <ListItemText
          primary={link.label}
          secondary={`${link.url} • ${link.description || 'No description'}`}
        />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            onClick={() => handleEditLink(link.id)}
            title="Edit Link"
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            onClick={() => handleDuplicateLink(link.id)}
            title="Duplicate Link"
            sx={{ mr: 1 }}
          >
            <ContentCopyIcon />
          </IconButton>
          <IconButton
            edge="end"
            onClick={() => onDeleteLink(link.id)}
            title="Delete Link"
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Links ({links.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddLink}
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
