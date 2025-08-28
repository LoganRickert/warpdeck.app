import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

const router: Router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Use environment variable directly for uploads directory
      const uploadsDir = path.join(process.env.DATA_DIR || './data', 'uploads');
      
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

// Configure multer for background images
const backgroundStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Use environment variable directly for images directory
      const imagesDir = path.join(process.env.DATA_DIR || './data', 'images');
      
      // Create images directory if it doesn't exist
      try {
        await fs.access(imagesDir);
      } catch {
        await fs.mkdir(imagesDir, { recursive: true });
      }
      
      cb(null, imagesDir);
    } catch (error) {
      console.error('Failed to access images directory:', error);
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
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

const backgroundUpload = multer({
  storage: backgroundStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for background images
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

    // Use environment variable directly for uploads directory
    const uploadsDir = path.join(process.env.DATA_DIR || './data', 'uploads');
    const relativePath = `${uploadsDir}/${req.file.filename}`;
    const thumbnailUrl = `/api/uploads/${req.file.filename}`;
    
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

// POST /api/upload/background
router.post('/background', backgroundUpload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Use environment variable directly for images directory
    const imagesDir = path.join(process.env.DATA_DIR || './data', 'images');
    const relativePath = `${imagesDir}/${req.file.filename}`;
    const imageUrl = `/api/images/${req.file.filename}`;
    
    res.json({
      message: 'Background image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Failed to upload background image:', error);
    res.status(500).json({ error: 'Failed to upload background image' });
  }
});

export { router as uploadRouter };
