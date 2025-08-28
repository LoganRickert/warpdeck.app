import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { Settings as SettingsIcon, Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, DashboardMeta } from '../types';
import { dashboardsApi } from '../api';
import { useState } from 'react';

interface HeaderProps {
  settings: Settings | null;
}

const Header: React.FC<HeaderProps> = ({ settings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'info' | 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleDashboardChange = (event: any) => {
    const slug = event.target.value;
    if (slug) {
      navigate(`/dashboards/${slug}`);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getCurrentDashboardSlug = (): string => {
    if (location.pathname.startsWith('/dashboards/')) {
      return location.pathname.split('/')[2];
    }
    return settings?.defaultDashboardSlug || '';
  };

  if (!settings) return null;

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ 
        minHeight: '48px !important',
        px: { xs: 2, sm: 3 } // 16px on mobile, 24px on larger screens
      }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => {
            const currentSlug = getCurrentDashboardSlug();
            if (currentSlug) {
              navigate(`/dashboards/${currentSlug}`);
            } else {
              navigate('/');
            }
          }}
        >
          WarpDeck
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {location.pathname === '/settings' ? (
            <IconButton
              color="inherit"
              onClick={() => {
                const currentSlug = getCurrentDashboardSlug();
                if (currentSlug) {
                  navigate(`/dashboards/${currentSlug}`);
                } else {
                  navigate('/');
                }
              }}
              size="small"
              title="Go to Dashboard"
            >
              <HomeIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              onClick={handleSettingsClick}
              size="small"
              title="Settings"
            >
              <SettingsIcon />
            </IconButton>
          )}

          {getCurrentDashboardSlug() && (
            <IconButton
              color="inherit"
              onClick={async () => {
                try {
                  const currentSlug = getCurrentDashboardSlug();
                  if (currentSlug) {
                    // Show refresh in progress notification
                    setNotification({
                      open: true,
                      message: 'Refreshing dashboard... Downloading new favicons',
                      severity: 'info'
                    });

                    await dashboardsApi.refresh(currentSlug);
                    
                    // Show success notification
                    setNotification({
                      open: true,
                      message: 'Dashboard refreshed successfully! New favicons downloaded.',
                      severity: 'success'
                    });

                    // Reload the page after a short delay to show the notification
                    setTimeout(() => {
                      window.location.reload();
                    }, 1500);
                  }
                } catch (error) {
                  console.error('Failed to refresh dashboard:', error);
                  // Show error notification
                  setNotification({
                    open: true,
                    message: 'Failed to refresh dashboard. Please try again.',
                    severity: 'error'
                  });
                }
              }}
              size="small"
              title="Refresh Dashboard (Download new favicons)"
            >
              <RefreshIcon />
            </IconButton>
          )}

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={getCurrentDashboardSlug()}
              onChange={handleDashboardChange}
              displayEmpty
              sx={{ color: 'inherit', '& .MuiSelect-icon': { color: 'inherit' } }}
            >
              {settings.dashboards.map((dashboard: DashboardMeta) => (
                <MenuItem key={dashboard.id} value={dashboard.slug}>
                  {dashboard.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Toolbar>

      {/* Notification Toast */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AppBar>
  );
};

export default Header;
