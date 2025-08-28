import express from 'express';
import cors from 'cors';
import path from 'path';
import { settingsRouter } from './api/settings';
import { dashboardsRouter } from './api/dashboards';
import { utilsRouter } from './api/utils';
import { uploadRouter } from './api/upload';
import { initializeDataDirectories, loadSettings } from './lib/fsStore';

const app = express();
const PORT = process.env.PORT || 8089;

// Initialize data directories on startup
initializeDataDirectories();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/settings', settingsRouter);
app.use('/api/dashboards', dashboardsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api', utilsRouter);

// Serve uploaded files with dynamic path resolution
app.use('/api/uploads', async (req, res, next) => {
  try {
    // Use environment variable directly for uploads directory
    const uploadsDir = path.join(process.env.DATA_DIR || './data', 'uploads');
    
    // Extract just the filename from the request path and sanitize it
    // req.path will be like "/filename.ext" or just "/"
    let filename = req.path === '/' ? '' : req.path.substring(1); // Remove leading slash
    
    // Prevent path traversal attacks by only allowing valid filenames
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // Check if file exists
    const filePath = path.join(uploadsDir, filename);
    
    const fs = await import('fs/promises');
    
    try {
      await fs.access(filePath);
      
      // Convert to absolute path for res.sendFile()
      const absolutePath = path.resolve(filePath);
      
      // File exists, serve it
      res.sendFile(absolutePath, {
        headers: {
          'Cache-Control': 'public, max-age=86400'
        }
      });
    } catch (error) {
      // File doesn't exist, return 404
      res.status(404).json({ error: 'Upload not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to serve upload' });
  }
});

// Serve favicon images (must come before client static files)
app.use('/api/images', express.static(path.join(__dirname, '../data/images'), {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  },
  fallthrough: false // Don't fall through to next middleware if file not found
}));

// Handle 404 for missing favicon images
app.use('/api/images/*', (req, res) => {
  res.status(404).json({ error: 'Favicon not found' });
});

// Serve static files from client build FIRST
app.use(express.static(path.join(__dirname, '../../client/dist')));

// SPA fallback - serve index.html for all non-API routes that don't match static files
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 WarpDeck server running on port ${PORT}`);
});
