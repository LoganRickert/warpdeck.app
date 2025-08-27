import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import { settingsApi, dashboardsApi } from './api';

const AppRouter: React.FC = () => {
  const [defaultRoute, setDefaultRoute] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineDefaultRoute = async () => {
      try {
        const [settings, dashboards] = await Promise.all([
          settingsApi.get(),
          dashboardsApi.getAll()
        ]);

        if (dashboards.length === 0) {
          // No dashboards exist, show settings
          setDefaultRoute(<SettingsPage />);
        } else if (settings.defaultDashboardSlug) {
          // Default dashboard is set, redirect to it
          const defaultDashboard = dashboards.find((d: any) => d.slug === settings.defaultDashboardSlug);
          if (defaultDashboard) {
            setDefaultRoute(<Navigate to={`/dashboards/${settings.defaultDashboardSlug}`} replace />);
          } else {
            // Default dashboard doesn't exist, show first dashboard
            setDefaultRoute(<Navigate to={`/dashboards/${dashboards[0].slug}`} replace />);
          }
        } else {
          // No default dashboard set, show first dashboard
          setDefaultRoute(<Navigate to={`/dashboards/${dashboards[0].slug}`} replace />);
        }
      } catch (error) {
        console.error('Failed to determine default route:', error);
        setDefaultRoute(<SettingsPage />);
      } finally {
        setLoading(false);
      }
    };

    determineDefaultRoute();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={defaultRoute} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/dashboards/:slug" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
