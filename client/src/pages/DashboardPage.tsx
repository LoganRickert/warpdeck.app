import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Paper,
  Container,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Popper
} from '@mui/material';
import { 
  Add as AddIcon, 
  Link as LinkIcon, 
  Settings as SettingsIcon,
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import DashboardGrid from '../components/DashboardGrid';
import { dashboardsApi } from '../api';
import { Dashboard, Link } from '../types';

const DashboardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  
  // Refs for accessibility
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside search area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is on search input, search container, or autocomplete suggestions
      const isOnSearchInput = target.closest('input[placeholder="Search the web or enter a URL..."]');
      const isOnSearchContainer = searchContainerRef.current && searchContainerRef.current.contains(target);
      const isOnAutocomplete = target.closest('#search-suggestions') || target.closest('[role="listbox"]') || target.closest('[role="option"]');
      
      // Only hide if click is completely outside all search-related elements
      if (!isOnSearchInput && !isOnSearchContainer && !isOnAutocomplete) {
        setShowAutocomplete(false);
        setFocusedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter links based on search query
  const filteredLinks = useMemo(() => {
    if (!dashboard || !searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return dashboard.links.filter(link => {
      const labelMatch = link.label.toLowerCase().includes(query);
      const urlMatch = link.url.toLowerCase().includes(query);
      const descriptionMatch = link.description?.toLowerCase().includes(query);
      
      return labelMatch || urlMatch || descriptionMatch;
    }).slice(0, 5); // Limit to 5 suggestions
  }, [dashboard, searchQuery]);

  // Show autocomplete when there are filtered links and query is long enough
  const shouldShowAutocomplete = useMemo(() => {
    return filteredLinks.length > 0 && searchQuery.trim().length >= 2;
  }, [filteredLinks, searchQuery]);

  // Reset focus when typing
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFocusedSuggestionIndex(-1); // Reset focus when typing
    
    // Show autocomplete if there are results and query is long enough
    if (value.trim().length >= 2 && dashboard) {
      const query = value.toLowerCase();
      const hasResults = dashboard.links.some(link => {
        const labelMatch = link.label.toLowerCase().includes(query);
        const urlMatch = link.url.toLowerCase().includes(query);
        const descriptionMatch = link.description?.toLowerCase().includes(query);
        return labelMatch || urlMatch || descriptionMatch;
      });
      
      if (hasResults) {
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  // Reset focus when search input is focused
  const handleSearchInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(e.currentTarget);
    setFocusedSuggestionIndex(-1); // Reset focus when input is focused
    
    // Show autocomplete if there are results and query is long enough
    if (searchQuery.trim().length >= 2 && dashboard) {
      const query = searchQuery.toLowerCase();
      const hasResults = dashboard.links.some(link => {
        const labelMatch = link.label.toLowerCase().includes(query);
        const urlMatch = link.url.toLowerCase().includes(query);
        const descriptionMatch = link.description?.toLowerCase().includes(query);
        return labelMatch || urlMatch || descriptionMatch;
      });
      
      if (hasResults) {
        setShowAutocomplete(true);
      }
    }
  };

  const handleLinkSuggestionClick = (link: Link) => {
    // Open the link based on dashboard search config
    const searchConfig = dashboard?.searchConfig || { openInNewTab: false };
    const target = searchConfig.openInNewTab ? '_blank' : '_self';
    
    window.open(link.url, target, 'noopener,noreferrer');
    
    // Clear search and hide autocomplete
    setSearchQuery('');
    setShowAutocomplete(false);
    setFocusedSuggestionIndex(-1);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    const searchConfig = dashboard?.searchConfig || { openInNewTab: false, searchEngine: 'google' };
    const target = searchConfig.openInNewTab ? '_blank' : '_self';
    
    // Check if it's a URL
    if (query.startsWith('http://') || query.startsWith('https://')) {
      // Direct navigation to URL
      window.open(query, target, 'noopener,noreferrer');
    } else {
      // Search using configured search engine
      let searchUrl: string;
      switch (searchConfig.searchEngine) {
        case 'duckduckgo':
          searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
          break;
        case 'bing':
          searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
          break;
        case 'google':
        default:
          searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
          break;
      }
      window.open(searchUrl, target, 'noopener,noreferrer');
    }
    
    // Clear search after use
    setSearchQuery('');
    setShowAutocomplete(false);
    setFocusedSuggestionIndex(-1);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (focusedSuggestionIndex >= 0 && filteredLinks[focusedSuggestionIndex]) {
        // If a suggestion is focused, open that link
        handleLinkSuggestionClick(filteredLinks[focusedSuggestionIndex]);
      } else {
        // Otherwise, perform the search
        handleSearch(searchQuery);
      }
    } else if (event.key === ' ') {
      // Space bar only triggers selection if there's a highlighted suggestion
      if (focusedSuggestionIndex >= 0 && filteredLinks[focusedSuggestionIndex]) {
        event.preventDefault(); // Prevent space from adding to input
        handleLinkSuggestionClick(filteredLinks[focusedSuggestionIndex]);
      }
      // If no suggestion is highlighted, let space bar work normally for typing
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (shouldShowAutocomplete && filteredLinks.length > 0) {
        setFocusedSuggestionIndex(prev => 
          prev < filteredLinks.length - 1 ? prev + 1 : 0
        );
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (shouldShowAutocomplete && filteredLinks.length > 0) {
        setFocusedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredLinks.length - 1
        );
      }
    } else if (event.key === 'Tab') {
      // Handle Tab navigation
      if (shouldShowAutocomplete && filteredLinks.length > 0) {
        if (event.shiftKey) {
          // Shift+Tab - backward navigation
          if (focusedSuggestionIndex === -1) {
            // If no suggestion is focused, focus the last one
            event.preventDefault();
            setFocusedSuggestionIndex(filteredLinks.length - 1);
          } else if (focusedSuggestionIndex > 0) {
            // Move to previous suggestion
            event.preventDefault();
            setFocusedSuggestionIndex(prev => prev - 1);
          } else {
            // First suggestion, let Shift+Tab move to previous element
            setFocusedSuggestionIndex(-1);
            setShowAutocomplete(false);
          }
        } else {
          // Regular Tab - forward navigation
          if (focusedSuggestionIndex === -1) {
            // If no suggestion is focused, focus the first one
            event.preventDefault();
            setFocusedSuggestionIndex(0);
          } else if (focusedSuggestionIndex < filteredLinks.length - 1) {
            // Move to next suggestion
            event.preventDefault();
            setFocusedSuggestionIndex(prev => prev + 1);
          } else {
            // Last suggestion, let Tab move to next element
            setFocusedSuggestionIndex(-1);
            setShowAutocomplete(false);
          }
        }
      }
    } else if (event.key === 'Escape') {
      setShowAutocomplete(false);
      setFocusedSuggestionIndex(-1);
      searchInputRef.current?.blur();
    }
  };

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

  // Auto-focus search bar when page loads (only if search bar is visible)
  useEffect(() => {
    if (!loading && dashboard && dashboard.showSearchBar !== false) {
      const searchInput = document.querySelector('input[placeholder="Search the web or enter a URL..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [loading, dashboard]);

  // Announce dashboard load to screen readers
  useEffect(() => {
    if (!loading && dashboard) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      announcement.textContent = `Dashboard ${dashboard.title} loaded with ${dashboard.links.length} links`;
      
      document.body.appendChild(announcement);
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [loading, dashboard]);

  // Update page title and meta description for accessibility
  useEffect(() => {
    if (!loading && dashboard) {
      document.title = `${dashboard.title} - WarpDeck Dashboard`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', `${dashboard.title} dashboard with ${dashboard.links.length} links and resources.`);
    }
  }, [loading, dashboard]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        role="status"
        aria-live="polite"
      >
        <CircularProgress aria-label="Loading dashboard" />
        <Box sx={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
          Loading dashboard...
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} role="alert" aria-live="assertive">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Dashboard not found. Please check the URL or go to{' '}
          <a href="/" style={{ color: 'inherit' }} rel="noreferrer">
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
    <Box 
      role="main" 
      aria-label={`Dashboard: ${dashboard.title}`}
      sx={{
        background: dashboard.showCustomBackground && dashboard.backgroundConfig ? 
          (dashboard.backgroundConfig.type === 'image' 
            ? `url(/api/images/${dashboard.backgroundConfig.value})`
            : dashboard.backgroundConfig.value
          ) : 'transparent',
        backgroundSize: dashboard.showCustomBackground && dashboard.backgroundConfig?.type === 'image' ? 'cover' : 'auto',
        backgroundPosition: dashboard.showCustomBackground && dashboard.backgroundConfig?.type === 'image' ? 'center' : 'auto',
        backgroundAttachment: dashboard.showCustomBackground && dashboard.backgroundConfig?.type === 'image' ? 'fixed' : 'scroll',
        minHeight: '100vh',
        position: 'relative',
        '&::before': dashboard.showCustomBackground && dashboard.backgroundConfig?.type === 'image' ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          zIndex: 0,
        } : {},
      }}
    >
      {/* Skip link for accessibility */}
      <Box
        component="a"
        href="#dashboard-content"
        className="skip-link"
        aria-label="Skip to main content"
        sx={{
          position: 'absolute',
          top: '-100px',
          left: '6px',
          background: '#667eea',
          color: 'white',
          padding: '8px',
          textDecoration: 'none',
          borderRadius: '4px',
          zIndex: 1000,
          transition: 'top 0.3s ease',
          '&:focus': {
            top: '6px',
          },
        }}
      >
        Skip to main content
      </Box>
      
      <Box sx={{ 
        p: 3, 
        textAlign: 'left',
        mb: 2,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: dashboard.showCustomBackground && dashboard.backgroundConfig?.type === 'image' 
          ? 'rgba(255, 255, 255, 0.25)' 
          : 'transparent',
      }}>
        {/* Decorative background - removed custom background, keep default theme */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
            zIndex: 0,
          }}
          aria-hidden="true"
        />
        
        {/* Subtle border and shadow */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '1px solid rgba(102, 126, 234, 0.1)',
            zIndex: 0,
          }}
          aria-hidden="true"
        />
        
        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {/* Dashboard icon and title row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 12px rgba(102, 126, 234, 0.3)',
                }}
                aria-hidden="true"
              >
                <LinkIcon sx={{ fontSize: 20, color: 'white' }} />
              </Box>
            
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  ...(dashboard.showCustomBackground && dashboard.backgroundConfig?.textColor ? {
                    color: dashboard.backgroundConfig.textColor,
                  } : {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }),
                  letterSpacing: '-0.02em'
                }}
              >
                {dashboard.title}
              </Typography>
            </Box>
            
            {/* Customize button on the right */}
            {dashboard.links.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => navigate(`/settings?dashboard=${dashboard.slug}`)}
                aria-label={`Customize ${dashboard.title} dashboard`}
                sx={{
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: 'text.secondary',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.25,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'text.secondary',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Customize
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Search Bar */}
      {dashboard.showSearchBar !== false && (
        <Box sx={{ 
          p: 3, 
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          <Box ref={searchContainerRef} sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
            <Paper
              elevation={0}
              className="search-box-container"
              sx={{
                width: '100%',
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <TextField
                ref={searchInputRef}
                fullWidth
                placeholder="Search the web or enter a URL..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchInputFocus}
                onKeyDown={handleKeyPress}
                variant="outlined"
                size="medium"
                autoComplete="off"
                aria-label="Search the web or enter a URL"
                aria-describedby={shouldShowAutocomplete ? "search-suggestions" : undefined}
                aria-expanded={shouldShowAutocomplete}
                aria-activedescendant={focusedSuggestionIndex >= 0 ? `suggestion-${focusedSuggestionIndex}` : undefined}
                role="combobox"
                aria-haspopup="listbox"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} aria-hidden="true" />
                    </InputAdornment>
                  ),
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      border: 'none',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      px: 0,
                      fontSize: '1rem',
                    },
                  },
                }}
              />
            </Paper>
            
            {shouldShowAutocomplete && (
              <Popper
                open={showAutocomplete}
                anchorEl={anchorEl}
                placement="bottom-start"
                sx={{
                  zIndex: 1000,
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <List 
                  sx={{ p: 1 }}
                  role="listbox"
                  id="search-suggestions"
                  aria-label="Search suggestions"
                >
                  {filteredLinks.map((link, index) => (
                    <ListItemButton
                      key={link.id}
                      id={`suggestion-${index}`}
                      onClick={() => handleLinkSuggestionClick(link)}
                      role="option"
                      aria-selected={focusedSuggestionIndex === index}
                      tabIndex={focusedSuggestionIndex === index ? 0 : -1}
                      sx={{
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(102, 126, 234, 0.15)',
                          outline: '2px solid #667eea',
                          outlineOffset: '2px',
                        },
                      }}
                      className={focusedSuggestionIndex === index ? 'Mui-focused' : ''}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <OpenInNewIcon sx={{ fontSize: 20, color: 'text.secondary' }} aria-hidden="true" />
                      </ListItemIcon>
                      <ListItemText
                        primary={link.label}
                        secondary={link.url}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Popper>
            )}
          </Box>
        </Box>
      )}
      
      {dashboard.links.length === 0 ? (
        // Fancy empty state when no links
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
                aria-hidden="true"
              >
                <LinkIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              
              {/* Title */}
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Your Dashboard is Ready!
              </Typography>
              
              {/* Description */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '1.1rem',
                  maxWidth: 500,
                  lineHeight: 1.6,
                  mb: 3
                }}
              >
                This dashboard is waiting for your favorite links and resources. 
                Click the button below to start adding links to websites, 
                tools, and services you use every day.
              </Typography>
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/settings?dashboard=${dashboard.slug}`)}
                  aria-label={`Add links to ${dashboard.title} dashboard`}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Add Links to This Dashboard
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/settings')}
                  aria-label="Go to dashboard settings"
                  sx={{
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                    color: 'primary.main',
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Dashboard Settings
                </Button>
              </Box>
              
              {/* Tips */}
              <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2, border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  💡 Quick Tips:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start', textAlign: 'left' }}>
                  <Typography variant="body2" color="text.secondary">
                    • Add links to your most-used websites and tools
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Customize colors and layouts for each link
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Organize links into logical groups
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Set this as your default dashboard for quick access
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      ) : (
        // Dashboard with links
        <Box 
          id="dashboard-content"
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start',
            minHeight: 'calc(100vh - 200px)', // Account for header and title
            width: '100%',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Box sx={{ width: '100%' }}>
            <DashboardGrid dashboard={dashboard} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
