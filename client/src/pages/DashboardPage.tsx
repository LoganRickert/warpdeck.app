import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import DashboardGrid from '../components/DashboardGrid';
import { dashboardsApi } from '../api';
import { Dashboard } from '../types';

const DashboardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardsApi.getBySlug(slug);
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [slug]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Dashboard not found. Please check the URL or go to{' '}
          <a href="/" style={{ color: 'inherit' }}>
            settings
          </a>{' '}
          to manage your dashboards.
        </Typography>
      </Box>
    );
  }

  if (!dashboard) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <Box sx={{ 
        p: 2, 
        pb: 0, 
        textAlign: 'left',
        mb: 2
      }}>
        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
          {dashboard.title}
        </Typography>
        {dashboard.links.length === 0 && (
          <Typography variant="body1" color="text.secondary">
            No links in this dashboard yet. Go to settings to add some!
          </Typography>
        )}
      </Box>
      
      {dashboard.links.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          minHeight: 'calc(100vh - 200px)', // Account for header and title
          width: '100%'
        }}>
          <Box sx={{ width: '100%' }}>
            <DashboardGrid dashboard={dashboard} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
