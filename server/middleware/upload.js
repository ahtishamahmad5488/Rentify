import multer from 'multer';

/**
 * Multer with memory storage.
 * Files are stored as Buffer in memory — not written to disk.
 * The buffer is then piped directly to Cloudinary's upload stream.
 */
const storage = multer.memoryStorage();

/**
 * Only allow common image MIME types.
 */
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  },
});
