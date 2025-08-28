import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardInfoEditor from './DashboardInfoEditor';
import SearchConfigEditor from './SearchConfigEditor';
import BackgroundConfigEditor from './BackgroundConfigEditor';
import LinkManagement from './LinkManagement';
import { Dashboard } from '../../types';

interface DashboardEditingViewProps {
  dashboard: Dashboard;
  onSaveDashboardInfo: (updates: Partial<Dashboard>) => Promise<void>;
  onSaveSearchConfig: (searchConfig: any) => Promise<void>;
  onCancel: () => void;
  onAddLink: () => void;
  onDeleteLink: (linkId: string) => void;
  onUpdateLink: (linkId: string, updates: Partial<any>) => void;
  onDuplicateLink: (linkId: string) => void;
  onReorderLink: (oldIndex: number, newIndex: number) => void;
  isUpdating: boolean;
}

const DashboardEditingView: React.FC<DashboardEditingViewProps> = ({
  dashboard,
  onSaveDashboardInfo,
  onSaveSearchConfig,
  onCancel,
  onAddLink,
  onDeleteLink,
  onUpdateLink,
  onDuplicateLink,
  onReorderLink,
  isUpdating,
}) => {
  const navigate = useNavigate();
  const [editingDashboard, setEditingDashboard] = useState<Dashboard>(dashboard);

  // Update editingDashboard when dashboard prop changes
  useEffect(() => {
    setEditingDashboard(dashboard);
  }, [dashboard]);

  const handleSaveDashboardInfo = async (updates: Partial<Dashboard>) => {
    await onSaveDashboardInfo(updates);
    // Update local state after successful save
    setEditingDashboard(prev => ({ ...prev, ...updates }));
  };

  const handleNavigateToDashboard = () => {
    navigate(`/dashboards/${dashboard.slug}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ mb: 0 }}>Editing: {dashboard.title}</Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center'
          }}>
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={handleNavigateToDashboard}
              sx={{ 
                minWidth: '140px',
                borderRadius: 2,
                px: 2,
                py: 1,
                borderColor: 'rgba(102, 126, 234, 0.3)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  color: 'primary.main',
                },
                transition: 'all 0.2s ease',
              }}
            >
              View Dashboard
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onCancel}
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
                },
                transition: 'all 0.2s ease',
              }}
            >
              Back to Dashboards
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Dashboard Information Editor */}
      <DashboardInfoEditor
        dashboard={editingDashboard}
        onSave={handleSaveDashboardInfo}
      />

      {/* Search Configuration Editor */}
      {editingDashboard.showSearchBar !== false && (
        <SearchConfigEditor
          searchConfig={editingDashboard.searchConfig || { openInNewTab: false, searchEngine: 'google' }}
          onSave={onSaveSearchConfig}
        />
      )}

      {/* Background Configuration Editor */}
      {editingDashboard.showCustomBackground && (
        <BackgroundConfigEditor
          backgroundConfig={editingDashboard.backgroundConfig}
          onSave={async (backgroundConfig) => {
            await onSaveDashboardInfo({ backgroundConfig });
          }}
        />
      )}

      {/* Link Management */}
      <LinkManagement
        links={editingDashboard.links}
        onAddLink={onAddLink}
        onDeleteLink={onDeleteLink}
        onUpdateLink={onUpdateLink}
        onDuplicateLink={onDuplicateLink}
        onReorderLink={onReorderLink}
        isUpdating={isUpdating}
      />
    </Box>
  );
};

export default DashboardEditingView;
