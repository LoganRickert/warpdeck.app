import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Tabs, 
  Tab
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
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
  const [tabValue, setTabValue] = useState(0);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ position: 'relative' }}>
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
                '&.MuiButton-outlined:hover': {
                  borderColor: 'primary.main !important',
                  backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
                  color: 'primary.main !important',
                },
                '&:hover': {
                  borderColor: 'primary.main !important',
                  backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
                  color: 'primary.main !important',
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
                '&.MuiButton-outlined:hover': {
                  borderColor: 'text.secondary !important',
                  backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
                },
                '&:hover': {
                  borderColor: 'text.secondary !important',
                  backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Back to Dashboards
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="dashboard editing tabs"
          sx={{
            '& .MuiTab-root': {
              minHeight: '48px',
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Links" {...a11yProps(0)} />
          <Tab label="Dashboard Info" {...a11yProps(1)} />
          <Tab label="Search & Background" {...a11yProps(2)} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <LinkManagement
          links={editingDashboard.links}
          onAddLink={onAddLink}
          onDeleteLink={onDeleteLink}
          onUpdateLink={onUpdateLink}
          onDuplicateLink={onDuplicateLink}
          onReorderLink={onReorderLink}
          isUpdating={isUpdating}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <DashboardInfoEditor
          dashboard={editingDashboard}
          onSave={handleSaveDashboardInfo}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
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
      </TabPanel>
    </Box>
  );
};

export default DashboardEditingView;
