import { Readable } from 'stream';
import { getCloudinary } from '../config/cloudinary.js';

/**
 * Uploads a Buffer (from multer memoryStorage) to Cloudinary.
 * Converts the buffer into a readable stream and pipes it to
 * Cloudinary's upload_stream for memory-efficient, disk-free uploads.
 *
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Cloudinary destination folder
 * @returns {Promise<{ public_id: string, secure_url: string }>}
 */
export const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = getCloudinary().uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.on('error', reject);
    Readable.from(buffer).pipe(uploadStream);
  });
