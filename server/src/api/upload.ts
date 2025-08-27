import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { loadSettings } from '../lib/fsStore';

const router: Router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
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
      
      // Directory should already exist from initialization, but verify
      try {
        await fs.access(uploadsDir);
      } catch {
        // If directory doesn't exist, create it (fallback)
        await fs.mkdir(uploadsDir, { recursive: true });
      }
      
      cb(null, uploadsDir);
    } catch (error) {
      console.error('Failed to access uploads directory:', error);
      cb(error as Error, '.');
    }
  },
  filename: (req, file, cb) => {
    // Generate UUID filename with original extension
    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/upload/thumbnail
router.post('/thumbnail', upload.single('thumbnail'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const settings = await loadSettings();
    const relativePath = `${settings.uploadsDir}/${req.file.filename}`;
    const thumbnailUrl = `/api/uploads/${req.file.filename}`;
    
    console.log(`Thumbnail uploaded: ${relativePath}`);
    console.log(`Thumbnail URL: ${thumbnailUrl}`);
    
    res.json({
      message: 'Thumbnail uploaded successfully',
      thumbnailUrl: thumbnailUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Failed to upload thumbnail:', error);
    res.status(500).json({ error: 'Failed to upload thumbnail' });
  }
});

export { router as uploadRouter };
