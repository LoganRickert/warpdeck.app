import { promises as fs } from 'fs';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import http from 'http';

const IMAGES_DIR = path.join(process.env.DATA_DIR || './data', 'images');

export async function ensureImagesDirectory(): Promise<void> {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  } catch (error) {
    throw error;
  }
}

export async function getFaviconUrl(url: string): Promise<string | null> {
  try {
    await ensureImagesDirectory();
    
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Try DuckDuckGo first
    const duckDuckGoFaviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    
    // Test if DuckDuckGo favicon exists and download it
    try {
      const response = await fetch(duckDuckGoFaviconUrl, { method: 'HEAD' });
      console.log("Fetch duckduckgo favicon", response.ok);
      if (response.ok) {
        // Download and save the favicon from DuckDuckGo
        const result = await downloadSingleFavicon(duckDuckGoFaviconUrl);
        console.log("Download duckduckgo favicon");
        if (result) {
          console.log("Download duckduckgo favicon returned");
          return result;
        }
      }
    } catch (error) {
      // DuckDuckGo failed, continue to fallback
    }
    
    // Fallback to direct domain favicon attempts
    const directFaviconUrls = [
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`
    ];
    
    for (const faviconUrl of directFaviconUrls) {
      try {
        const response = await fetch(faviconUrl, { method: 'HEAD' });
        console.log("Fetch direct favicon", response.ok);
        if (response.ok) {
          // Download and save the favicon from direct domain
          const result = await downloadSingleFavicon(faviconUrl);
          if (result) {
            console.log("Download direct favicon returned");
            return result;
          }
        }
      } catch (error) {
        console.log("Error fetching direct favicon", error);
        continue;
      }
    }
    
    console.log("No favicon found");
    // Give up if all attempts fail
    return null;
  } catch (error) {
    return null;
  }
}

export async function downloadFavicon(url: string): Promise<string | null> {
  try {
    await ensureImagesDirectory();
    
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Try DuckDuckGo first
    const duckDuckGoFaviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    
    // Download and save the favicon from DuckDuckGo
    const result = await downloadSingleFavicon(duckDuckGoFaviconUrl);
    if (result) {
      return result;
    }
    
    // Fallback to direct domain favicon attempts
    const directFaviconUrls = [
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`
    ];
    
    for (const faviconUrl of directFaviconUrls) {
      try {
        const fallbackResult = await downloadSingleFavicon(faviconUrl);
        if (fallbackResult) {
          return fallbackResult;
        }
      } catch (error) {
        continue;
      }
    }
    
    // Give up if all attempts fail
    return null;
  } catch (error) {
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
          fsSync.unlink(filePath, () => {}); // Clean up on error
          reject(error);
        });
      } else {
        reject(new Error(`Failed to download favicon: ${response.statusCode}`));
      }
    });
    
    request.on('error', (error) => {
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
    // Silently fail favicon deletion
  }
}
