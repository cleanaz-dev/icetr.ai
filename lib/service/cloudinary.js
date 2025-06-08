import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "dmllgn0t7", // Your cloud name
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Set to true to use HTTPS
});

export async function uploadFileToCloudinary(fileBuffer, fileName = "") {
  try {
    const stream = Readable.from(fileBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id: fileName,
          format: "auto",
          upload_preset: "spaujw6j",
        },
        (error, result) => {
          if (error) {
            console.error("Error uploading file to Cloudinary:", error);
            return reject(new Error("Failed to upload file"));
          }
          resolve(result);
        }
      );

      // Pipe the buffer stream to Cloudinary
      stream.pipe(uploadStream);
    });

    console.log("File uploaded successfully:", result);
    return { url: result.secure_url }; // Return the secure URL of the uploaded file
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}