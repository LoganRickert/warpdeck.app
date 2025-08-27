import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Settings, Dashboard, Link } from './schema';

const DATA_DIR = process.env.DATA_DIR || './data';
const DASHBOARDS_DIR = process.env.DASHBOARDS_DIR || path.join(DATA_DIR, 'dashboards');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export async function initializeDataDirectories(): Promise<void> {
  try {
    console.log(`📁 Initializing data directories...`);
    console.log(`📁 Base data directory: ${DATA_DIR}`);
    
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`✅ Created base data directory: ${DATA_DIR}`);
    
    await fs.mkdir(DASHBOARDS_DIR, { recursive: true });
    console.log(`✅ Created dashboards directory: ${DASHBOARDS_DIR}`);
    
    // Create uploads directory
    const uploadsDir = path.join(DATA_DIR, 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log(`✅ Created uploads directory: ${uploadsDir}`);
    
    // Create images directory for favicons
    const imagesDir = path.join(DATA_DIR, 'images');
    await fs.mkdir(imagesDir, { recursive: true });
    console.log(`✅ Created images directory: ${imagesDir}`);
    
    // Create default settings if they don't exist
    if (!await fileExists(SETTINGS_FILE)) {
      await createDefaultSettings();
      console.log(`✅ Created default settings file: ${SETTINGS_FILE}`);
    }
    
    console.log(`🎯 Data directories initialization complete`);
  } catch (error) {
    console.error('❌ Failed to initialize data directories:', error);
    throw error;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createDefaultSettings(): Promise<void> {
  const defaultSettings: Settings = {
    dashboardsDir: 'data/dashboards',
    uploadsDir: 'data/uploads',
    defaultTheme: 'dark',
    defaultDashboardSlug: '',
    dashboards: []
  };

  // Save the clean default settings (no pre-populated dashboards)
  await saveSettings(defaultSettings);
}

export async function loadSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data) as Settings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    throw new Error('Failed to load settings');
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw new Error('Failed to save settings');
  }
}

export async function loadDashboard(id: string): Promise<Dashboard | null> {
  try {
    const filePath = path.join(DASHBOARDS_DIR, `${id}.json`);
    if (!await fileExists(filePath)) {
      return null;
    }
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as Dashboard;
  } catch (error) {
    console.error(`Failed to load dashboard ${id}:`, error);
    return null;
  }
}

export async function saveDashboard(dashboard: Dashboard): Promise<void> {
  try {
    const filePath = path.join(DASHBOARDS_DIR, `${dashboard.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(dashboard, null, 2));
  } catch (error) {
    console.error(`Failed to save dashboard ${dashboard.id}:`, error);
    throw new Error('Failed to save dashboard');
  }
}

export async function deleteDashboard(id: string): Promise<void> {
  try {
    const filePath = path.join(DASHBOARDS_DIR, `${id}.json`);
    if (await fileExists(filePath)) {
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete dashboard ${id}:`, error);
    throw new Error('Failed to delete dashboard');
  }
}

export async function getDashboardBySlug(slug: string): Promise<Dashboard | null> {
  try {
    const settings = await loadSettings();
    const dashboardMeta = settings.dashboards.find(d => d.slug.toLowerCase() === slug.toLowerCase());
    if (!dashboardMeta) {
      return null;
    }
    return await loadDashboard(dashboardMeta.id);
  } catch (error) {
    console.error(`Failed to get dashboard by slug ${slug}:`, error);
    return null;
  }
}

export async function getAllDashboards(): Promise<Dashboard[]> {
  try {
    const settings = await loadSettings();
    const dashboards: Dashboard[] = [];
    
    for (const meta of settings.dashboards) {
      const dashboard = await loadDashboard(meta.id);
      if (dashboard) {
        dashboards.push(dashboard);
      }
    }
    
    return dashboards;
  } catch (error) {
    console.error('Failed to get all dashboards:', error);
    return [];
  }
}

export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  try {
    const settings = await loadSettings();
    return !settings.dashboards.some(d => 
      d.slug.toLowerCase() === slug.toLowerCase() && d.id !== excludeId
    );
  } catch (error) {
    console.error('Failed to check slug uniqueness:', error);
    return false;
  }
}
