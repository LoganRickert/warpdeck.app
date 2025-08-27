import { Router, Request, Response } from 'express';

const router: Router = Router();

// GET /api/favicon?url=...
router.get('/favicon', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Prevent javascript: URLs for security
    if (url.toLowerCase().startsWith('javascript:')) {
      return res.status(400).json({ error: 'Invalid URL scheme' });
    }
    
    // For now, redirect to the favicon.ico of the domain
    // In a full implementation, you might want to proxy the actual favicon
    const domain = new URL(url).origin;
    const faviconUrl = `${domain}/favicon.ico`;
    
    res.redirect(faviconUrl);
  } catch (error) {
    console.error('Failed to get favicon:', error);
    res.status(500).json({ error: 'Failed to get favicon' });
  }
});

export { router as utilsRouter };
