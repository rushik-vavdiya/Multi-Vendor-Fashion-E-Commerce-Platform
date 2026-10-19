import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const uploadImage = async (file, { folder } = {}) => {
  if (!file?.buffer) {
    throw new AppError("An image file is required", 400);
  }

  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError("Cloudinary is not configured", 503);
  }

  return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url || !result.public_id) {
          reject(new Error("Cloudinary did not return an image URL"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    Readable.from([file.buffer]).pipe(uploadStream);
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId) {
    return { result: "not found" };
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (!["ok", "not found"].includes(result.result)) {
    throw new AppError(`Cloudinary image deletion failed: ${result.result}`, 502);
  }

  return result;
};

// Uploads either an image or a video, choosing the Cloudinary resource type from
// the file's mimetype. Used by the review modules, where a review can carry both
// pictures and clips.
export const uploadMedia = async (file, { folder } = {}) => {
  if (!file?.buffer) {
    throw new AppError("A media file is required", 400);
  }

  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError("Cloudinary is not configured", 503);
  }

  const isVideo = String(file.mimetype).startsWith("video/");
  const resourceType = isVideo ? "video" : "image";

  return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url || !result.public_id) {
          reject(new Error("Cloudinary did not return a media URL"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: resourceType,
        });
      },
    );

    Readable.from([file.buffer]).pipe(uploadStream);
  });
};

// Deletes a review media file. `type` is "video" or "image".
export const deleteMedia = async (publicId, type = "image") => {
  if (!publicId) {
    return { result: "not found" };
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: type === "video" ? "video" : "image",
  });

  if (!["ok", "not found"].includes(result.result)) {
    throw new AppError(`Cloudinary media deletion failed: ${result.result}`, 502);
  }

  return result;
};
