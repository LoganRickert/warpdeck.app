import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { dashboardsApi, settingsApi } from '../api';
import { Dashboard, CreateDashboardRequest, CreateLinkRequest, Settings } from '../types';
import {
  DashboardManagement,
  DashboardEditor,
  LinkManagement,
  LinkEditor,
  GlobalSettings,
  SettingsTabs,
  TabPanel
} from '../components/settings';
import { useSettings } from '../App';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
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

  // Form states
  const [dashboardForm, setDashboardForm] = useState<CreateDashboardRequest>({
    title: '',
    slug: '',
  });
  const [linkForm, setLinkForm] = useState<CreateLinkRequest>({
    label: '',
    url: '',
    icon: '',
    description: '',
    thumbnail: '',
    // New customization properties with defaults
    colorBar: '#121212',
    backgroundColor: '',
    textColor: '',
    openInNewTab: false,
    gridColumns: 1,
  });

  useEffect(() => {
    loadDashboards();
  }, []);

  const handleImportDashboard = async (importedDashboard: Dashboard) => {
    try {
      // Import the dashboard using the dedicated import API
      const newDashboard = await dashboardsApi.import(importedDashboard);
      
      // Add to local state
      setDashboards([...dashboards, newDashboard]);
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
      
      setSuccess('Dashboard order updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder dashboards');
      // Revert to original order on error
      loadDashboards();
    }
  };

  const loadDashboards = async () => {
    try {
      setLoading(true);
      const dashboardsData = await dashboardsApi.getAll();
      setDashboards(dashboardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDashboard = async (dashboard: Dashboard) => {
    if (window.confirm(`Are you sure you want to delete "${dashboard.title}"? This action cannot be undone.`)) {
      try {
        await dashboardsApi.delete(dashboard.slug);
        setDashboards(dashboards.filter(d => d.id !== dashboard.id));
        
        // Refresh settings to get updated defaultDashboardSlug if needed
        if (settings && settings.defaultDashboardSlug === dashboard.slug) {
          try {
            const updatedSettings = await settingsApi.get();
            updateSettings(updatedSettings);
          } catch (err) {
            console.warn('Failed to refresh settings after dashboard deletion:', err);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete dashboard');
      }
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!editingDashboard) return;
    
    if (window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      try {
        await dashboardsApi.deleteLink(editingDashboard.slug, linkId);
        const updatedDashboard = {
          ...editingDashboard,
          links: editingDashboard.links.filter(l => l.id !== linkId)
        };
        setEditingDashboard(updatedDashboard);
        setDashboards(dashboards.map(d => d.id === editingDashboard.id ? updatedDashboard : d));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete link');
      }
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
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
            <>
              <DashboardEditor
                dashboard={editingDashboard}
                onSave={async (updatedDashboard) => {
                  try {
                    // Use the original slug (editingDashboard.slug) not the updated slug
                    await dashboardsApi.update(editingDashboard.slug, updatedDashboard);
                    setDashboards(dashboards.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
                    
                    // Refresh settings context so header dropdown shows updated names
                    if (settings) {
                      const updatedSettings = { ...settings };
                      const dashboardIndex = updatedSettings.dashboards.findIndex(d => d.id === updatedDashboard.id);
                      if (dashboardIndex !== -1) {
                        updatedSettings.dashboards[dashboardIndex].title = updatedDashboard.title;
                        updatedSettings.dashboards[dashboardIndex].slug = updatedDashboard.slug;
                        updateSettings(updatedSettings);
                      }
                    }
                    
                    setEditingDashboard(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to update dashboard');
                  }
                }}
                onCancel={() => setEditingDashboard(null)}
              />
              <LinkManagement
                links={editingDashboard.links}
                onAddLink={() => setLinkDialog(true)}
                onDeleteLink={handleDeleteLink}
                onUpdateLink={handleUpdateLink}
                onDuplicateLink={handleDuplicateLink}
                onReorderLink={handleReorderLink}
                isUpdating={isDownloadingFavicon}
              />
            </>
          ) : (
            <DashboardManagement
              dashboards={dashboards}
              onAddDashboard={() => setDashboardDialog(true)}
              onEditDashboard={setEditingDashboard}
              onDeleteDashboard={(dashboardId) => {
                const dashboard = dashboards.find(d => d.id === dashboardId);
                if (dashboard) {
                  handleDeleteDashboard(dashboard);
                }
              }}
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
              onSuccess={(message) => {
                setSuccess(message);
                setTimeout(() => setSuccess(null), 3000);
              }}
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
      <Dialog open={linkDialog} onClose={() => setLinkDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add New Link</DialogTitle>
        <DialogContent>
          <LinkEditor
            link={{
              id: '',
              label: '',
              url: '',
              icon: '',
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
          <Button onClick={() => setLinkDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
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
                  icon: '', 
                  description: '', 
                  thumbnail: '',
                  colorBar: '#121212',
                  backgroundColor: '',
                  textColor: '',
                  openInNewTab: false,
                  gridColumns: 1,
                });
                setLinkDialog(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to add link');
              } finally {
                setIsDownloadingFavicon(false);
              }
            }}
            variant="contained"
            disabled={!linkForm.label || !linkForm.url}
          >
            Add Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
