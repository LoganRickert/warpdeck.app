import { promises as fs } from 'fs';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import http from 'http';

const IMAGES_DIR = path.join(process.env.DATA_DIR || './data', 'images');

export async function ensureImagesDirectory(): Promise<void> {
  try {
    console.log(`📁 Ensuring images directory exists: ${IMAGES_DIR}`);
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log(`✅ Images directory ready: ${IMAGES_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create images directory:', error);
    throw error;
  }
}

export async function downloadFavicon(url: string): Promise<string | null> {
  try {
    console.log(`🔄 Starting favicon download for: ${url}`);
    await ensureImagesDirectory();
    
    const urlObj = new URL(url);
    console.log(`🌐 Parsed URL - hostname: ${urlObj.hostname}`);
    
    // First, try to get favicon from HTML page (most reliable)
    try {
      console.log(`📄 Attempting to extract favicon from HTML...`);
      const htmlFavicon = await extractFaviconFromHTML(url);
      if (htmlFavicon) {
        console.log(`✅ Found favicon in HTML: ${htmlFavicon}`);
        const result = await downloadSingleFavicon(htmlFavicon);
        if (result) {
          console.log(`✅ Successfully downloaded favicon from HTML: ${result}`);
          return result;
        } else {
          console.log(`❌ Failed to download favicon from HTML URL`);
        }
      } else {
        console.log(`❌ No favicon found in HTML`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to extract favicon from HTML for ${url}:`, error);
    }
    
    // Fallback to common favicon locations
    console.log(`🔄 Trying common favicon locations...`);
    const faviconUrls = [
      // HTTPS versions (most common)
      `https://${urlObj.hostname}/favicon.ico`,
      `https://${urlObj.hostname}/favicon.png`,
      `https://${urlObj.hostname}/apple-touch-icon.png`,
      `https://${urlObj.hostname}/apple-touch-icon-precomposed.png`,
      // HTTP versions (fallback)
      `http://${urlObj.hostname}/favicon.ico`,
      `http://${urlObj.hostname}/favicon.png`,
      `http://${urlObj.hostname}/apple-touch-icon.png`,
      // Common variations
      `https://${urlObj.hostname}/icon.png`,
      `https://${urlObj.hostname}/logo.png`,
      `https://${urlObj.hostname}/site-icon.png`,
      // Additional common locations
      `https://${urlObj.hostname}/assets/favicon.ico`,
      `https://${urlObj.hostname}/static/favicon.ico`,
      `https://${urlObj.hostname}/img/favicon.ico`
    ];
    
    for (const faviconUrl of faviconUrls) {
      try {
        console.log(`🔄 Trying: ${faviconUrl}`);
        const result = await downloadSingleFavicon(faviconUrl);
        if (result) {
          console.log(`✅ Successfully downloaded favicon from fallback: ${result}`);
          return result;
        } else {
          console.log(`❌ Failed to download from: ${faviconUrl}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to download from ${faviconUrl}:`, error);
        continue;
      }
    }
    
    console.log(`❌ No favicon could be downloaded for: ${url}`);
    return null;
  } catch (error) {
    console.error(`💥 Failed to download favicon for ${url}:`, error);
    return null;
  }
}

async function downloadSingleFavicon(faviconUrl: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(faviconUrl);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    // Determine file extension from URL
    const extension = faviconUrl.includes('.png') ? 'png' : 'ico';
    const filename = `${uuidv4()}.${extension}`;
    const filePath = path.join(IMAGES_DIR, filename);
    
    const request = protocol.get(faviconUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WarpDeck/1.0)',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const location = response.headers.location;
        if (location) {
          // Resolve the redirect URL
          const redirectUrl = new URL(location, faviconUrl).href;
          
          // Clean up the current request
          request.destroy();
          
          // Try the redirect URL
          downloadSingleFavicon(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode === 200) {
        const fileStream = fsSync.createWriteStream(filePath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          // Return the relative path for storage in the database
          const relativePath = `images/${filename}`;
          resolve(relativePath);
        });
        
        fileStream.on('error', (error) => {
          console.error(`File stream error:`, error);
          fsSync.unlink(filePath, () => {}); // Clean up on error
          reject(error);
        });
      } else {
        reject(new Error(`Failed to download favicon: ${response.statusCode}`));
      }
    });
    
    request.on('error', (error) => {
      console.error(`Request error:`, error);
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function extractFaviconFromHTML(url: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WarpDeck/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            // Look for favicon links in HTML
            const faviconMatch = data.match(/<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i);
            if (faviconMatch) {
              let faviconUrl = faviconMatch[1];
              
              // Resolve relative URLs
              if (faviconUrl.startsWith('/')) {
                faviconUrl = `${urlObj.protocol}//${urlObj.hostname}${faviconUrl}`;
              } else if (!faviconUrl.startsWith('http')) {
                faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/${faviconUrl}`;
              }
              
              resolve(faviconUrl);
            } else {
              resolve(null);
            }
          } catch (error) {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
    
    request.on('error', () => {
      resolve(null);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(null);
    });
  });
}

export async function deleteFavicon(faviconPath: string): Promise<void> {
  try {
    if (faviconPath && faviconPath.startsWith('images/')) {
      const fullPath = path.join(process.env.DATA_DIR || './data', faviconPath);
      fsSync.unlinkSync(fullPath);
    }
  } catch (error) {
    console.warn(`Failed to delete favicon ${faviconPath}:`, error);
  }
}
