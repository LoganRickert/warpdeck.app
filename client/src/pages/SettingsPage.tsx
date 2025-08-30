import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import { dashboardsApi } from '../api';
import { Dashboard, CreateDashboardRequest, CreateLinkRequest, Settings } from '../types';
import {
  DashboardManagement,
  DashboardEditingView,
  LinkEditor,
  GlobalSettings,
  SettingsTabs,
  TabPanel
} from '../components/settings';
import { useSettings } from '../App';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [dashboardDialog, setDashboardDialog] = useState(false);
  const [linkDialog, setLinkDialog] = useState(false);
  const [isDownloadingFavicon, setIsDownloadingFavicon] = useState(false);
  
  // Delete confirmation dialog states
  const [deleteDashboardDialog, setDeleteDashboardDialog] = useState<Dashboard | null>(null);
  const [deleteLinkDialog, setDeleteLinkDialog] = useState<{ dashboard: Dashboard; linkId: string } | null>(null);

  // Form states
  const [dashboardForm, setDashboardForm] = useState<CreateDashboardRequest>({
    title: '',
    slug: '',
  });
  const [linkForm, setLinkForm] = useState<CreateLinkRequest>({
    label: '',
    url: '',
    description: '',
    thumbnail: '',
    // New customization properties with defaults
    colorBar: '#121212',
    backgroundColor: '',
    textColor: '',
    openInNewTab: false,
    gridColumns: 1,
  });

  const loadDashboards = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardsData = await dashboardsApi.getAll();
      setDashboards(dashboardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboards();
  }, []);

  // Handle dashboard query parameter to automatically open dashboard editing
  useEffect(() => {
    const dashboardSlug = searchParams.get('dashboard');
    if (dashboardSlug && dashboards.length > 0) {
      const dashboardToEdit = dashboards.find(d => d.slug === dashboardSlug);
      if (dashboardToEdit) {
        setEditingDashboard(dashboardToEdit);
        // Clear the URL parameter to avoid re-triggering on navigation
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('dashboard');
        window.history.replaceState({}, '', `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`);
      }
    }
  }, [searchParams, dashboards]);

  const handleImportDashboard = async (importedDashboard: Dashboard) => {
    try {
      // Import the dashboard using the dedicated import API
      const newDashboard = await dashboardsApi.import(importedDashboard);
      
      // Add to local state
      setDashboards([...dashboards, newDashboard]);
      
      // Update the global settings context so the header dropdown shows the new dashboard
      if (settings && settings.dashboards) {
        const updatedSettings = { ...settings };
        updatedSettings.dashboards = [
          ...updatedSettings.dashboards,
          {
            id: newDashboard.id,
            slug: newDashboard.slug,
            title: newDashboard.title
          }
        ];
        updateSettings(updatedSettings);
      }
      
      setSuccess(`Dashboard "${importedDashboard.title}" imported successfully!`);
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import dashboard');
    }
  };

  const handleReorderDashboards = async (reorderedDashboards: Dashboard[]) => {
    try {
      // Update local state immediately for responsive UI
      setDashboards(reorderedDashboards);
      
      // Send reorder request to server
      const dashboardIds = reorderedDashboards.map(d => d.id);
      await dashboardsApi.reorder(dashboardIds);
      
      // Update the global settings context so the header dropdown reflects the new order
      if (settings && settings.dashboards) {
        const updatedSettings = { ...settings };
        updatedSettings.dashboards = reorderedDashboards.map(d => ({
          id: d.id,
          slug: d.slug,
          title: d.title
        }));
        updateSettings(updatedSettings);
      }
      
      setSuccess('Dashboard order updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder dashboards');
      // Revert to original order on error
      loadDashboards();
    }
  };

    const handleDeleteDashboard = (dashboard: Dashboard) => {
    setDeleteDashboardDialog(dashboard);
  };

  const confirmDeleteDashboard = async () => {
    if (!deleteDashboardDialog) return;
    
    try {
      await dashboardsApi.delete(deleteDashboardDialog.slug);
      setDashboards(dashboards.filter(d => d.id !== deleteDashboardDialog.id));
      
      // Update the global settings context so the header dropdown reflects the deletion
      if (settings && settings.dashboards) {
        const updatedSettings = { ...settings };
        updatedSettings.dashboards = updatedSettings.dashboards.filter(d => d.id !== deleteDashboardDialog.id);
        
        // If this was the default dashboard, clear the default
        if (updatedSettings.defaultDashboardSlug === deleteDashboardDialog.slug) {
          updatedSettings.defaultDashboardSlug = '';
        }
        
        updateSettings(updatedSettings);
      }
      
      setDeleteDashboardDialog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dashboard');
    }
  };

  const handleDeleteLink = (linkId: string) => {
    if (!editingDashboard) return;
    setDeleteLinkDialog({ dashboard: editingDashboard, linkId });
  };

  const confirmDeleteLink = async () => {
    if (!deleteLinkDialog) return;
    
    try {
      await dashboardsApi.deleteLink(deleteLinkDialog.dashboard.slug, deleteLinkDialog.linkId);
      const updatedDashboard = {
        ...deleteLinkDialog.dashboard,
        links: deleteLinkDialog.dashboard.links.filter(l => l.id !== deleteLinkDialog.linkId)
      };
      setEditingDashboard(updatedDashboard);
      setDashboards(dashboards.map(d => d.id === deleteLinkDialog.dashboard.id ? updatedDashboard : d));
      setDeleteLinkDialog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  const handleUpdateLink = async (linkId: string, updates: Partial<any>) => {
    if (!editingDashboard) return;
    
    try {
      await dashboardsApi.updateLink(editingDashboard.slug, linkId, updates);
      const updatedDashboard = {
        ...editingDashboard,
        links: editingDashboard.links.map(l => 
          l.id === linkId ? { ...l, ...updates } : l
        )
      };
      setEditingDashboard(updatedDashboard);
      setDashboards(dashboards.map(d => d.id === editingDashboard.id ? updatedDashboard : d));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  const handleDuplicateLink = async (linkId: string) => {
    if (!editingDashboard) return;
    
    try {
      const originalLink = editingDashboard.links.find(l => l.id === linkId);
      if (!originalLink) return;
      
      // Create a duplicate link with a new ID and modified label
      const duplicateLink = {
        ...originalLink,
        id: '', // Will be generated by the server
        label: `${originalLink.label} (Copy)`,
      };
      
      // Add the duplicate link
      await dashboardsApi.addLink(editingDashboard.slug, duplicateLink);
      
      // Refresh the dashboard to get the updated state
      const updatedDashboard = await dashboardsApi.getBySlug(editingDashboard.slug);
      setEditingDashboard(updatedDashboard);
      setDashboards(dashboards.map(d => d.id === editingDashboard.id ? updatedDashboard : d));
      setSuccess('Link duplicated successfully!');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate link');
    }
  };

  const handleReorderLink = async (oldIndex: number, newIndex: number) => {
    if (!editingDashboard) return;
    
    try {
      // Create a new array with the reordered links
      const reorderedLinks = [...editingDashboard.links];
      const [movedLink] = reorderedLinks.splice(oldIndex, 1);
      reorderedLinks.splice(newIndex, 0, movedLink);
      
      // Update the dashboard with the new order
      const updatedDashboard = {
        ...editingDashboard,
        links: reorderedLinks,
      };
      
      // Save to server
      await dashboardsApi.update(editingDashboard.slug, updatedDashboard);
      
      // Update local state
      setEditingDashboard(updatedDashboard);
      setDashboards(dashboards.map(d => d.id === editingDashboard.id ? updatedDashboard : d));
      
      setSuccess('Link order updated successfully!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder links');
    }
  };

  const handleSettingsUpdate = async (updates: Partial<Settings>) => {
    try {
      await updateSettings(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  // Safety timeout: prevent loading state from getting stuck
  useEffect(() => {
    let timeoutId: number;
    if (isDownloadingFavicon) {
      timeoutId = window.setTimeout(() => {
        setIsDownloadingFavicon(false);
      }, 10000); // 10 second timeout (reduced from 30)
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isDownloadingFavicon]);

  // Ensure loading state is reset when dialog closes
  const handleCloseLinkDialog = () => {
    setLinkDialog(false);
    setIsDownloadingFavicon(false);
    
    // Reset form to prevent stale data
    setLinkForm({
      label: '',
      url: '',
      description: '',
      thumbnail: '',
      colorBar: '#121212',
      backgroundColor: '',
      textColor: '',
      openInNewTab: false,
      gridColumns: 1,
    });
  };

  const handleAddLink = async () => {
    if (!editingDashboard) return;
    
    try {
      setIsDownloadingFavicon(true);
      
      await dashboardsApi.addLink(editingDashboard.slug, linkForm);
      
      const updatedDashboard = await dashboardsApi.getBySlug(editingDashboard.slug);
      
      setEditingDashboard(updatedDashboard);
      setDashboards(dashboards.map(d => d.id === editingDashboard.id ? updatedDashboard : d));
      setLinkForm({ 
        label: '', 
        url: '', 
        description: '', 
        thumbnail: '',
        colorBar: '#121212',
        backgroundColor: '',
        textColor: '',
        openInNewTab: false,
        gridColumns: 1,
      });
      
      handleCloseLinkDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link');
      setIsDownloadingFavicon(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: 1200, 
      mx: 'auto' 
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.75rem', sm: '2.125rem' },
          mb: { xs: 2, sm: 3 }
        }}
      >
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <SettingsTabs value={tabValue} onChange={setTabValue}>
        <TabPanel value={tabValue} index={0}>
          {editingDashboard ? (
            <DashboardEditingView
              dashboard={editingDashboard}
              onSaveDashboardInfo={async (updates) => {
                try {
                  // Use the original slug (editingDashboard.slug) not the updated slug
                  await dashboardsApi.update(editingDashboard.slug, updates);
                  const updatedDashboard = { ...editingDashboard, ...updates };
                  setDashboards(dashboards.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
                  setEditingDashboard(updatedDashboard);
                  
                  // Refresh settings context so header dropdown shows updated names
                  if (settings && settings.dashboards) {
                    const updatedSettings = { ...settings };
                    const dashboardIndex = updatedSettings.dashboards.findIndex(d => d.id === updatedDashboard.id);
                    if (dashboardIndex !== -1) {
                      updatedSettings.dashboards[dashboardIndex].title = updatedDashboard.title;
                      updatedSettings.dashboards[dashboardIndex].slug = updatedDashboard.slug;
                      updateSettings(updatedSettings);
                    }
                  }
                } catch (err) {
                  throw new Error('Failed to update dashboard information');
                }
              }}
              onSaveSearchConfig={async (searchConfig) => {
                try {
                  await dashboardsApi.update(editingDashboard.slug, { searchConfig });
                  const updatedDashboard = { ...editingDashboard, searchConfig };
                  setDashboards(dashboards.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
                  setEditingDashboard(updatedDashboard);
                } catch (err) {
                  throw new Error('Failed to update search configuration');
                }
              }}
              onCancel={() => setEditingDashboard(null)}
              onAddLink={() => setLinkDialog(true)}
              onDeleteLink={handleDeleteLink}
              onUpdateLink={handleUpdateLink}
              onDuplicateLink={handleDuplicateLink}
              onReorderLink={handleReorderLink}
              isUpdating={isDownloadingFavicon}
            />
          ) : (
            <DashboardManagement
              dashboards={dashboards}
              onAddDashboard={() => setDashboardDialog(true)}
              onEditDashboard={setEditingDashboard}
              onDeleteDashboard={handleDeleteDashboard}
              onImportDashboard={handleImportDashboard}
              onReorderDashboards={handleReorderDashboards}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {settings && (
            <GlobalSettings
              settings={settings}
              onSettingsUpdate={handleSettingsUpdate}
            />
          )}
        </TabPanel>
      </SettingsTabs>

      {/* Add Dashboard Dialog */}
      <Dialog open={dashboardDialog} onClose={() => setDashboardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Dashboard</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={dashboardForm.title}
              onChange={(e) => setDashboardForm({ ...dashboardForm, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Slug"
              value={dashboardForm.slug}
              onChange={(e) => setDashboardForm({ ...dashboardForm, slug: e.target.value })}
              fullWidth
              helperText="URL-friendly identifier (e.g., 'work', 'personal')"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDashboardDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              try {
                const newDashboard = await dashboardsApi.create(dashboardForm);
                setDashboards([...dashboards, newDashboard]);
                
                // Update the global settings context so the header dropdown shows the new dashboard
                if (settings && settings.dashboards) {
                  const updatedSettings = { ...settings };
                  updatedSettings.dashboards = [
                    ...updatedSettings.dashboards,
                    {
                      id: newDashboard.id,
                      slug: newDashboard.slug,
                      title: newDashboard.title
                    }
                  ];
                  updateSettings(updatedSettings);
                }
                
                setDashboardForm({ title: '', slug: '' });
                setDashboardDialog(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create dashboard');
              }
            }}
            variant="contained"
            disabled={!dashboardForm.title || !dashboardForm.slug}
          >
            Create Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog 
        open={linkDialog} 
        onClose={handleCloseLinkDialog} 
        maxWidth="lg" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            animation: isDownloadingFavicon ? 'dialogPulse 2s ease-in-out infinite' : 'none',
            '@keyframes dialogPulse': {
              '0%, 100%': {
                boxShadow: '0 11px 15px -7px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12)',
              },
              '50%': {
                boxShadow: '0 11px 15px -7px rgba(102, 126, 234, 0.3), 0 24px 38px 3px rgba(102, 126, 234, 0.2), 0 9px 46px 8px rgba(102, 126, 234, 0.1)',
              },
            },
          },
        }}
      >
        <DialogTitle>
          Add New Link
          {isDownloadingFavicon && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mt: 1,
              animation: 'slideDown 0.3s ease-out',
              '@keyframes slideDown': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-10px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}>
              <CircularProgress 
                size={16} 
                sx={{ 
                  color: '#667eea',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Downloading favicon...
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <LinkEditor
            link={{
              id: '',
              label: '',
              url: '',
              description: '',
              thumbnail: '',
              colorBar: '#121212',
              backgroundColor: '',
              textColor: '',
              openInNewTab: false,
              gridColumns: 1,
            }}
            onStateChange={(updates) => {
              setLinkForm(prev => ({ ...prev, ...updates }));
            }}
            isLoading={isDownloadingFavicon}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkDialog}>Cancel</Button>
          <Button
            onClick={handleAddLink}
            variant="contained"
            disabled={!linkForm.label || !linkForm.url}
          >
            Add Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dashboard Confirmation Dialog */}
      <Dialog
        open={!!deleteDashboardDialog}
        onClose={() => setDeleteDashboardDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Dashboard</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDashboardDialog?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDashboardDialog(null)}>Cancel</Button>
          <Button
            onClick={confirmDeleteDashboard}
            variant="contained"
            color="error"
          >
            Delete Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Link Confirmation Dialog */}
      <Dialog
        open={!!deleteLinkDialog}
        onClose={() => setDeleteLinkDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Link</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this link? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteLinkDialog(null)}>Cancel</Button>
          <Button
            onClick={confirmDeleteLink}
            variant="contained"
            color="error"
          >
            Delete Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
