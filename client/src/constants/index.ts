// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  PRIMARY_HOVER: '#5a6fd8',
  SECONDARY_HOVER: '#6a4190',
  DARK_BACKGROUND: '#121212',
  DARK_PAPER: '#1e1e1e',
  LIGHT_BACKGROUND: '#ffffff',
  LIGHT_PAPER: '#f5f5f5',
} as const;

// Common spacing values
export const SPACING = {
  XS: 1,
  SM: 2,
  MD: 3,
  LG: 4,
  XL: 5,
} as const;

// Common border radius values
export const BORDER_RADIUS = {
  SM: 1,
  MD: 2,
  LG: 3,
} as const;

// Common transition durations
export const TRANSITIONS = {
  FAST: '0.2s',
  NORMAL: '0.3s',
  SLOW: '0.5s',
} as const;

// Default values
export const DEFAULTS = {
  BACKGROUND_COLOR: THEME_COLORS.PRIMARY,
  TEXT_COLOR: THEME_COLORS.PRIMARY,
  CARD_SIZE: 'md' as const,
  GRID_COLUMNS: 12,
  GUTTER: 16,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD_BACKGROUND: '/api/upload/background',
  UPLOAD_THUMBNAIL: '/api/upload/thumbnail',
  IMAGES: '/api/images',
} as const;
