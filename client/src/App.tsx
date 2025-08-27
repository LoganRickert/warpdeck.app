import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import AppRouter from './router';
import { settingsApi, dashboardsApi } from './api';
import { Settings } from './types';

// Create context for settings
interface SettingsContextType {
  settings: Settings | null;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  // Create theme dynamically based on themeMode
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: themeMode,
        primary: {
          main: '#121212',
        },
        secondary: {
          main: '#424242',
        },
        // Ensure text colors are set for both themes to prevent flashing
        text: {
          primary: themeMode === 'dark' ? '#ffffff' : '#000000',
          secondary: themeMode === 'dark' ? '#cccccc' : '#666666',
        },
        background: {
          default: themeMode === 'dark' ? '#121212' : '#ffffff',
          paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              minHeight: '48px',
              backgroundColor: '#121212',
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              color: themeMode === 'dark' ? '#ffffff' : '#000000',
              '&.Mui-selected': {
                color: themeMode === 'dark' ? '#ffffff' : '#121212',
                backgroundColor: themeMode === 'dark' ? '#424242' : '#f5f5f5',
              },
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? '#424242' : '#f5f5f5',
              },
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              backgroundColor: themeMode === 'dark' ? '#ffffff' : '#121212',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              // Only override colors for specific button types, let theme handle defaults
              '&.MuiButton-outlined': {
                color: themeMode === 'dark' ? '#ffffff' : '#000000',
                borderColor: themeMode === 'dark' ? '#ffffff' : '#000000',
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? '#424242' : '#f5f5f5',
                },
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                color: themeMode === 'dark' ? '#ffffff' : '#000000',
                '& fieldset': {
                  borderColor: themeMode === 'dark' ? '#666666' : '#000000',
                },
                '&:hover fieldset': {
                  borderColor: themeMode === 'dark' ? '#ffffff' : '#000000',
                },
                '&.Mui-focused fieldset': {
                  borderColor: themeMode === 'dark' ? '#ffffff' : '#121212',
                },
              },
              '& .MuiInputLabel-root': {
                color: themeMode === 'dark' ? '#cccccc' : '#666666',
                '&.Mui-focused': {
                  color: themeMode === 'dark' ? '#ffffff' : '#121212',
                },
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              color: themeMode === 'dark' ? '#ffffff' : '#000000',
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              color: themeMode === 'dark' ? '#ffffff' : '#000000',
              '& fieldset': {
                borderColor: themeMode === 'dark' ? '#666666' : '#000000',
              },
              '&:hover fieldset': {
                borderColor: themeMode === 'dark' ? '#ffffff' : '#000000',
              },
              '&.Mui-focused fieldset': {
                borderColor: themeMode === 'dark' ? '#ffffff' : '#121212',
              },
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: themeMode === 'dark' ? '#cccccc' : '#666666',
              '&.Mui-focused': {
                color: themeMode === 'dark' ? '#ffffff' : '#121212',
              },
            },
          },
        },
        // Remove the global Typography override that was affecting the header
        // MuiTypography: {
        //   styleOverrides: {
        //     root: {
        //       color: themeMode === 'dark' ? '#ffffff' : '#000000',
        //     },
        //   },
        // },
      },
    });
  }, [themeMode]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get();
        setSettings(data);
        setThemeMode(data.defaultTheme || 'dark');
        
        // Repair any invalid default dashboard slugs
        try {
          await dashboardsApi.repair();
        } catch (error) {
          console.warn('Failed to repair dashboards:', error);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      const updatedSettings = await settingsApi.update(updates);
      setSettings(updatedSettings);
      
      // Immediately update theme if theme setting changed
      if (updates.defaultTheme) {
        setThemeMode(updates.defaultTheme);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };



  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          Loading...
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Header 
            settings={settings} 
          />
          <Box component="main" sx={{ pt: 0 }}>
            <AppRouter />
          </Box>
        </Box>
      </ThemeProvider>
    </SettingsContext.Provider>
  );
};

export default App;
