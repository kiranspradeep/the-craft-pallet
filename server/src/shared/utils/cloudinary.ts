// src/shared/utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// 2048px is ideal for ultra-sharp retina screens (hero banners, product galleries)
const MAX_IMAGE_WIDTH = 2048;

/**
 * Converts any uploaded image buffer into high-clarity WebP format
 * and strictly uploads it as a WebP image to Cloudinary.
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResult> => {
  // 1. Process, auto-rotate, and convert to WebP using Sharp
  const pipeline = sharp(buffer).rotate(); // Preserves correct camera orientation
  const metadata = await pipeline.metadata();

  let transform = pipeline;
  if (metadata.width && metadata.width > MAX_IMAGE_WIDTH) {
    transform = transform.resize({
      width: MAX_IMAGE_WIDTH,
      withoutEnlargement: true,
    });
  }

  // Convert to high-fidelity WebP format with sharp edge subsampling
  const webpBuffer = await transform
    .webp({
      quality: 90,           // Visually lossless clarity
      effort: 5,            // Higher compression optimization
      smartSubsample: true, // Retains sharp edges & vivid colors
    })
    .toBuffer();

  // 2. Stream the WebP buffer to Cloudinary and enforce .webp storage
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: "webp", // Enforces WebP file extension & storage in Cloudinary
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format, // "webp"
          bytes: result.bytes,
        });
      }
    );

    const readable = new Readable();
    readable.push(webpBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by its public_id.
 * Called when admin deletes a product or category image.
 */
export const deleteFromCloudinary = async (
  publicId: string
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export { cloudinary };