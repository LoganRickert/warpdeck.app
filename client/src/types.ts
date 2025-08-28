export interface Settings {
  defaultTheme: 'light' | 'dark';
  defaultDashboardSlug: string;
  dashboards: DashboardMeta[];
}

export interface DashboardMeta {
  id: string;
  slug: string;
  title: string;
}

export interface Dashboard {
  id: string;
  slug: string;
  title: string;
  links: Link[];
  layout?: DashboardLayout;
  searchConfig?: SearchConfig;
  showSearchBar?: boolean;
  showCustomBackground?: boolean;
  backgroundConfig?: BackgroundConfig;
}

export interface BackgroundConfig {
  type: 'color' | 'image';
  value: string; // hex color or image filename
  textColor?: string; // hex color for header text
}

export interface SearchConfig {
  openInNewTab: boolean;
  searchEngine: 'google' | 'duckduckgo' | 'bing';
}

export interface Link {
  id: string;
  label: string;
  url: string;
  icon?: string;
  color?: string;
  description?: string;
  thumbnail?: string;
  favicon?: string;
  // New customization properties
  colorBar?: string; // Left border color (default: #121212)
  backgroundColor?: string; // Background color (default: theme color)
  textColor?: string; // Text color (default: theme color)
  openInNewTab?: boolean; // Whether to open in new tab (default: false)
  gridColumns?: number; // How many grid columns to span (default: 1)
}

export interface DashboardLayout {
  columns: number;
  cardSize: 'sm' | 'md' | 'lg';
  gutter: number;
}

export interface CreateDashboardRequest {
  title: string;
  slug: string;
  links?: Omit<Link, 'id'>[];
  layout?: DashboardLayout;
  searchConfig?: SearchConfig;
  showSearchBar?: boolean;
  showCustomBackground?: boolean;
  backgroundConfig?: BackgroundConfig;
}

export interface UpdateDashboardRequest {
  title?: string;
  slug?: string;
  links?: Link[];
  layout?: DashboardLayout;
  searchConfig?: SearchConfig;
  showSearchBar?: boolean;
  showCustomBackground?: boolean;
  backgroundConfig?: BackgroundConfig;
}

export interface CreateLinkRequest {
  label: string;
  url: string;
  icon?: string;
  color?: string;
  description?: string;
  thumbnail?: string;
  // New customization properties
  colorBar?: string;
  backgroundColor?: string;
  textColor?: string;
  openInNewTab?: boolean;
  gridColumns?: number;
}

export interface UpdateLinkRequest {
  label?: string;
  url?: string;
  icon?: string;
  color?: string;
  description?: string;
  thumbnail?: string;
  // New customization properties
  colorBar?: string;
  backgroundColor?: string;
  textColor?: string;
  openInNewTab?: boolean;
  gridColumns?: number;
}

export interface UpdateSettingsRequest {
  defaultTheme?: 'light' | 'dark';
  defaultDashboardSlug?: string;
  dashboards?: DashboardMeta[];
}
