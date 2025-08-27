import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  loadSettings, 
  saveSettings, 
  loadDashboard, 
  saveDashboard, 
  deleteDashboard as deleteDashboardFile,
  getDashboardBySlug,
  getAllDashboards,
  isSlugUnique
} from '../lib/fsStore';
import { downloadFavicon } from '../lib/favicon';
import { 
  CreateDashboardRequest, 
  UpdateDashboardRequest, 
  CreateLinkRequest, 
  UpdateLinkRequest,
  Link,
  Dashboard
} from '../lib/schema';

const router: Router = Router();

// GET /api/dashboards
router.get('/', async (req: Request, res: Response) => {
  try {
    const dashboards = await getAllDashboards();
    res.json(dashboards);
  } catch (error) {
    console.error('Failed to get dashboards:', error);
    res.status(500).json({ error: 'Failed to get dashboards' });
  }
});

// POST /api/dashboards
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, slug, links = [], layout }: CreateDashboardRequest = req.body;
    
    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }
    
    // Check slug uniqueness
    if (!(await isSlugUnique(slug))) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    
    // Create dashboard
    const dashboard = {
      id: uuidv4(),
      slug,
      title,
      links: links.map(link => ({ ...link, id: uuidv4() })),
      layout: layout || { columns: 4, cardSize: 'md', gutter: 12 }
    };
    
    await saveDashboard(dashboard);
    
    // Update settings
    const settings = await loadSettings();
    settings.dashboards.push({
      id: dashboard.id,
      slug: dashboard.slug,
      title: dashboard.title
    });
    await saveSettings(settings);
    
    res.status(201).json(dashboard);
  } catch (error) {
    console.error('Failed to create dashboard:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
});

// POST /api/dashboards/import - Import complete dashboard with links
router.post('/import', async (req: Request, res: Response) => {
  try {
    const importedDashboard: Dashboard = req.body;
    
    // Validate required fields
    if (!importedDashboard.title || !importedDashboard.slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }
    
    // Check slug uniqueness and modify if needed
    let finalSlug = importedDashboard.slug;
    let counter = 1;
    while (!(await isSlugUnique(finalSlug))) {
      finalSlug = `${importedDashboard.slug}-${counter}`;
      counter++;
    }
    
    // Generate new IDs for dashboard and all links
    const newDashboard: Dashboard = {
      ...importedDashboard,
      id: uuidv4(),
      slug: finalSlug,
      links: importedDashboard.links.map(link => ({
        ...link,
        id: uuidv4()
      })),
      layout: importedDashboard.layout || { columns: 4, cardSize: 'md', gutter: 12 }
    };
    
    // Save the imported dashboard
    await saveDashboard(newDashboard);
    
    // Update settings
    const settings = await loadSettings();
    settings.dashboards.push({
      id: newDashboard.id,
      slug: newDashboard.slug,
      title: newDashboard.title
    });
    await saveSettings(settings);
    
    res.status(201).json(newDashboard);
  } catch (error) {
    console.error('Failed to import dashboard:', error);
    res.status(500).json({ error: 'Failed to import dashboard' });
  }
});

// POST /api/dashboards/reorder - Reorder dashboards
router.post('/reorder', async (req: Request, res: Response) => {
  try {
    const { dashboardIds }: { dashboardIds: string[] } = req.body;
    
    if (!dashboardIds || !Array.isArray(dashboardIds)) {
      return res.status(400).json({ error: 'Dashboard IDs array is required' });
    }
    
    // Load current settings
    const settings = await loadSettings();
    
    // Reorder dashboards based on the provided order
    const reorderedDashboards = [];
    for (const id of dashboardIds) {
      const dashboardMeta = settings.dashboards.find(d => d.id === id);
      if (dashboardMeta) {
        reorderedDashboards.push(dashboardMeta);
      }
    }
    
    // Update settings with new order
    settings.dashboards = reorderedDashboards;
    await saveSettings(settings);
    
    res.json({ message: 'Dashboards reordered successfully', dashboards: reorderedDashboards });
  } catch (error) {
    console.error('Failed to reorder dashboards:', error);
    res.status(500).json({ error: 'Failed to reorder dashboards' });
  }
});

// POST /api/dashboards/repair - Repair invalid default dashboard slug
router.post('/repair', async (req: Request, res: Response) => {
  try {
    const settings = await loadSettings();
    
    // Check if defaultDashboardSlug is valid
    const defaultDashboardExists = settings.dashboards.some(d => d.slug === settings.defaultDashboardSlug);
    if (!defaultDashboardExists && settings.dashboards.length > 0) {
      // Fix the invalid default dashboard slug
      settings.defaultDashboardSlug = settings.dashboards[0].slug;
      await saveSettings(settings);
      
      res.json({ 
        message: 'Default dashboard slug repaired', 
        oldSlug: req.body.oldSlug || 'invalid',
        newSlug: settings.defaultDashboardSlug 
      });
    } else {
      res.json({ message: 'Default dashboard slug is already valid', slug: settings.defaultDashboardSlug });
    }
  } catch (error) {
    console.error('Failed to repair default dashboard slug:', error);
    res.status(500).json({ error: 'Failed to repair default dashboard slug' });
  }
});

// GET /api/dashboards/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const dashboard = await getDashboardBySlug(slug);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    res.json(dashboard);
  } catch (error) {
    console.error(`Failed to get dashboard ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

// PUT /api/dashboards/:slug
router.put('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const updates: UpdateDashboardRequest = req.body;
    
    const dashboard = await getDashboardBySlug(slug);
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    // Check slug uniqueness if slug is being changed
    if (updates.slug && updates.slug !== slug) {
      if (!(await isSlugUnique(updates.slug, dashboard.id))) {
        return res.status(400).json({ error: 'New slug already exists' });
      }
    }
    
    // Create updated dashboard object
    const updatedDashboard = {
      ...dashboard,
      ...updates
    };
    
    // Save the updated dashboard first
    await saveDashboard(updatedDashboard);
    
    // Update settings with latest title and slug for header dropdown
    if (updates.title || updates.slug) {
      const settings = await loadSettings();
      const metaIndex = settings.dashboards.findIndex(d => d.id === dashboard.id);
      if (metaIndex !== -1) {
        if (updates.title) {
          settings.dashboards[metaIndex].title = updates.title;
        }
        if (updates.slug) {
          settings.dashboards[metaIndex].slug = updates.slug;
          
          // If this dashboard was the default, update the defaultDashboardSlug
          if (settings.defaultDashboardSlug === slug) {
            settings.defaultDashboardSlug = updates.slug;
          }
        }
        
        // Check if defaultDashboardSlug is still valid, if not fix it
        const defaultDashboardExists = settings.dashboards.some(d => d.slug === settings.defaultDashboardSlug);
        if (!defaultDashboardExists && settings.dashboards.length > 0) {
          // Set the first dashboard as default if current default is invalid
          settings.defaultDashboardSlug = settings.dashboards[0].slug;
        }
        
        await saveSettings(settings);
      }
    }
    
    res.json(updatedDashboard);
  } catch (error) {
    console.error(`Failed to update dashboard ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

// DELETE /api/dashboards/:slug
router.delete('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const dashboard = await getDashboardBySlug(slug);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    // Delete dashboard file
    await deleteDashboardFile(dashboard.id);
    
    // Remove from settings
    const settings = await loadSettings();
    settings.dashboards = settings.dashboards.filter(d => d.id !== dashboard.id);
    
    // Check if the deleted dashboard was the default, if so set a new default
    if (settings.defaultDashboardSlug === slug && settings.dashboards.length > 0) {
      settings.defaultDashboardSlug = settings.dashboards[0].slug;
    }
    
    await saveSettings(settings);
    
    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete dashboard ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to delete dashboard' });
  }
});

// POST /api/dashboards/:slug/links
router.post('/:slug/links', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const linkData: CreateLinkRequest = req.body;
    
    const dashboard = await getDashboardBySlug(slug);
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    const newLink = {
      ...linkData,
      id: uuidv4()
    };
    
    console.log('🔍 Creating new link:', {
      label: newLink.label,
      url: newLink.url,
      thumbnail: newLink.thumbnail,
      icon: newLink.icon
    });
    
    // If no thumbnail is provided, try to download favicon as fallback
    if (!newLink.thumbnail) {
      console.log('🔄 No thumbnail provided, attempting favicon download...');
      try {
        const faviconPath = await downloadFavicon(newLink.url);
        if (faviconPath) {
          console.log('✅ Favicon downloaded successfully:', faviconPath);
          newLink.favicon = faviconPath;
        } else {
          console.log('❌ Favicon download returned null');
        }
      } catch (error) {
        console.warn(`⚠️ Failed to download favicon for ${newLink.url}:`, error);
      }
    } else {
      console.log('ℹ️ Thumbnail provided, skipping favicon download');
    }
    
    dashboard.links.push(newLink);
    await saveDashboard(dashboard);
    
    res.status(201).json(newLink);
  } catch (error) {
    console.error(`Failed to add link to dashboard ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

// PUT /api/dashboards/:slug/links/:linkId
router.put('/:slug/links/:linkId', async (req: Request, res: Response) => {
  try {
    const { slug, linkId } = req.params;
    const updates: UpdateLinkRequest = req.body;
    
    const dashboard = await getDashboardBySlug(slug);
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    const linkIndex = dashboard.links.findIndex(l => l.id === linkId);
    if (linkIndex === -1) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Update link
    Object.assign(dashboard.links[linkIndex], updates);
    
    // If thumbnail was removed and no favicon exists, try to download one
    if (updates.thumbnail === '' && !dashboard.links[linkIndex].favicon) {
      try {
        const faviconPath = await downloadFavicon(dashboard.links[linkIndex].url);
        if (faviconPath) {
          dashboard.links[linkIndex].favicon = faviconPath;
        }
      } catch (error) {
        console.warn(`Failed to download favicon for ${dashboard.links[linkIndex].url}:`, error);
      }
    }
    
    await saveDashboard(dashboard);
    
    res.json(dashboard.links[linkIndex]);
  } catch (error) {
    console.error(`Failed to update link ${req.params.linkId}:`, error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// DELETE /api/dashboards/:slug/links/:linkId
router.delete('/:slug/links/:linkId', async (req: Request, res: Response) => {
  try {
    const { slug, linkId } = req.params;
    
    const dashboard = await getDashboardBySlug(slug);
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    const linkIndex = dashboard.links.findIndex(l => l.id === linkId);
    if (linkIndex === -1) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Remove link
    dashboard.links.splice(linkIndex, 1);
    await saveDashboard(dashboard);
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete link ${req.params.linkId}:`, error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// POST /api/dashboards/:slug/refresh
router.post('/:slug/refresh', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const dashboard = await getDashboardBySlug(slug);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Refresh favicons for all links that don't have thumbnails
    const updatedLinks = [];
    let faviconsDownloaded = 0;
    
    for (const link of dashboard.links) {
      if (!link.thumbnail) {
        try {
          const faviconUrl = await downloadFavicon(link.url);
          if (faviconUrl) {
            link.favicon = faviconUrl;
            faviconsDownloaded++;
          }
        } catch (error) {
          console.warn(`Failed to download favicon for ${link.url}:`, error);
        }
      }
      
      updatedLinks.push(link);
    }

    // Update dashboard with new favicon URLs
    dashboard.links = updatedLinks;
    await saveDashboard(dashboard);
    
    res.json({ message: 'Dashboard refreshed successfully', dashboard });
  } catch (error) {
    console.error(`Failed to refresh dashboard ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to refresh dashboard' });
  }
});

export { router as dashboardsRouter };
