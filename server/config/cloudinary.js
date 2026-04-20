import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary configuration.
 * Called lazily at first use so dotenv.config() has already run.
 */
export const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

export default cloudinary;
