export const mediaConfig = {
  webp: {
    quality: parseInt(process.env.WEBP_QUALITY || '75'), // WebP quality (0-100) - снижено с 80 до 75
    effort: parseInt(process.env.WEBP_EFFORT || '6'),   // Compression effort (0-6)
    nearLossless: process.env.WEBP_NEAR_LOSSLESS === 'true', // Near lossless compression
    smartSubsample: true, // Умная субдискретизация для лучшего сжатия
  },
  // Добавляем настройки для JPEG сжатия как fallback
  jpeg: {
    quality: parseInt(process.env.JPEG_QUALITY || '85'), // JPEG quality (0-100)
    progressive: true, // Прогрессивный JPEG
    mozjpeg: true, // Использовать mozjpeg для лучшего сжатия
  },
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB in bytes
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'text/plain' // Some SVG files might have this MIME type
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
}; 