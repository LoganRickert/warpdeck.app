import { Router, Request, Response } from 'express';
import archiver from 'archiver';
import { loadSettings, saveSettings, getAllDashboards } from '../lib/fsStore';
import { UpdateSettingsRequest } from '../lib/schema';

const router: Router = Router();

// GET /api/settings
router.get('/', async (req: Request, res: Response) => {
  try {
    const settings = await loadSettings();
    res.json(settings);
  } catch (error) {
    console.error('Failed to load settings:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// PUT /api/settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const updates: UpdateSettingsRequest = req.body;
    const settings = await loadSettings();
    
    // Update allowed fields
    if (updates.defaultTheme !== undefined) {
      settings.defaultTheme = updates.defaultTheme;
    }
    if (updates.defaultDashboardSlug !== undefined) {
      settings.defaultDashboardSlug = updates.defaultDashboardSlug;
    }
    if (updates.dashboards !== undefined) {
      settings.dashboards = updates.dashboards;
    }
    
    await saveSettings(settings);
    res.json(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/settings/import
router.post('/import', async (req: Request, res: Response) => {
  try {
    // TODO: Implement import logic for zip/JSON files
    // For now, just return success
    res.json({ message: 'Import functionality coming soon' });
  } catch (error) {
    console.error('Failed to import settings:', error);
    res.status(500).json({ error: 'Failed to import settings' });
  }
});

// GET /api/settings/export
router.get('/export', async (req: Request, res: Response) => {
  try {
    const settings = await loadSettings();
    const dashboards = await getAllDashboards();
    
    // Create zip archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.attachment('warpdeck-export.zip');
    archive.pipe(res);
    
    // Add settings.json
    archive.append(JSON.stringify(settings, null, 2), { name: 'settings.json' });
    
    // Add dashboard files
    for (const dashboard of dashboards) {
      archive.append(JSON.stringify(dashboard, null, 2), { 
        name: `dashboards/${dashboard.id}.json` 
      });
    }
    
    await archive.finalize();
  } catch (error) {
    console.error('Failed to export settings:', error);
    res.status(500).json({ error: 'Failed to export settings' });
  }
});

export { router as settingsRouter };
