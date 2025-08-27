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
    const settings = await loadSettings();
    
    // Handle both relative and absolute paths
    let uploadsDir: string;
    if (path.isAbsolute(settings.uploadsDir)) {
      // Absolute path - use as-is
      uploadsDir = settings.uploadsDir;
    } else {
      // Relative path - join with base directory
      uploadsDir = path.join(process.env.DATA_DIR || '.', settings.uploadsDir);
    }
    
    // Extract just the filename from the request path
    // req.path will be like "/filename.ext" or just "/"
    const filename = req.path === '/' ? '' : req.path;
    
    console.log(`🔍 Upload request: ${req.path}`);
    console.log(`📁 Looking in directory: ${uploadsDir}`);
    console.log(`📄 Filename extracted: ${filename}`);
    
    // Check if file exists
    const filePath = path.join(uploadsDir, filename);
    console.log(`📄 Full file path: ${filePath}`);
    
    const fs = await import('fs/promises');
    
    // Debug: List files in uploads directory
    try {
      const files = await fs.readdir(uploadsDir);
      console.log(`📋 Files in uploads directory:`, files);
    } catch (error) {
      console.log(`❌ Could not read uploads directory:`, error);
    }
    
    try {
      await fs.access(filePath);
      console.log(`✅ File found, serving: ${filePath}`);
      
      // Convert to absolute path for res.sendFile()
      const absolutePath = path.resolve(filePath);
      console.log(`📄 Absolute path: ${absolutePath}`);
      
      // File exists, serve it
      res.sendFile(absolutePath, {
        headers: {
          'Cache-Control': 'public, max-age=86400'
        }
      });
    } catch (error) {
      // File doesn't exist, return 404
      console.log(`❌ Upload not found: ${req.path}`);
      console.log(`❌ File path checked: ${filePath}`);
      res.status(404).json({ error: 'Upload not found' });
    }
  } catch (error) {
    console.error('Failed to serve upload:', error);
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
  console.log(`❌ Favicon not found: ${req.path}`);
  res.status(404).json({ error: 'Favicon not found' });
});



// Serve static files from client build
app.use(express.static(path.join(__dirname, '../../client/dist')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 WarpDeck server running on port ${PORT}`);
  console.log(`📁 Data directory: ${process.env.DATA_DIR || './data'}`);
  console.log(`🎯 Dashboards directory: ${process.env.DASHBOARDS_DIR || './data/dashboards'}`);
});
