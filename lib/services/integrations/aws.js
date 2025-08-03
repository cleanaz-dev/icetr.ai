import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const MIME_TYPES = {
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'txt': 'text/plain',
  'rtf': 'application/rtf',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'csv': 'text/csv',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'm4a': 'audio/mp4',
  'mp4': 'audio/mp4',
  'webm': 'audio/webm',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'zip': 'application/zip',
  'json': 'application/json'
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function getFileExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function getMimeType(filename) {
  const extension = getFileExtension(filename);
  return MIME_TYPES[extension] || 'application/octet-stream';
}

function getFileFolder(filename) {
  const extension = getFileExtension(filename);
  
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
    return 'documents';
  } else if (['ppt', 'pptx'].includes(extension)) {
    return 'presentations';
  } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'spreadsheets';
  } else if (['mp3', 'wav', 'ogg', 'm4a', 'mp4', 'webm'].includes(extension)) {
    return 'audio';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    return 'images';
  } else {
    return 'files';
  }
}

export async function uploadFileToS3Bucket({
  fileBuffer,
  originalFilename = null,
  customFilename = null,
  DOCUMENTS_BUCKET,
}) {
  try {
    const uuid = randomUUID();
    let filename;
    let contentType;
    
    if (customFilename) {
      const folder = getFileFolder(customFilename);
      filename = `${folder}/${customFilename}`;
      contentType = getMimeType(customFilename);
    } else if (originalFilename) {
      const extension = getFileExtension(originalFilename);
      const folder = getFileFolder(originalFilename);
      const baseName = originalFilename.replace(/\.[^/.]+$/, "");
      filename = `${folder}/${uuid}-${baseName}.${extension}`;
      contentType = getMimeType(originalFilename);
    } else {
      filename = `files/${uuid}`;
      contentType = 'application/octet-stream';
    }

    const uploadParams = {
      Bucket: DOCUMENTS_BUCKET,
      Key: filename,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: "public-read"
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
}

export async function uploadDocumentToS3({
  fileBuffer,
  originalFilename,
  customFilename = null,
  DOCUMENTS_BUCKET
}) {
  const extension = getFileExtension(originalFilename || customFilename || '');
  const supportedDocTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'csv'];
  
  if (!supportedDocTypes.includes(extension)) {
    throw new Error(`Unsupported document type: ${extension}. Supported types: ${supportedDocTypes.join(', ')}`);
  }

  return uploadFileToS3Bucket({
    fileBuffer,
    originalFilename,
    customFilename,
    DOCUMENTS_BUCKET,
  });
}

/**
 * Downloads a Twilio recording and uploads it to S3
 * @param {string} twilioRecordingUrl - The Twilio recording URL
 * @param {string} DOCUMENTS_BUCKET - S3 bucket name
 * @param {Object} twilioAuth - Optional Twilio auth credentials
 * @param {string} twilioAuth.accountSid - Twilio Account SID
 * @param {string} twilioAuth.authToken - Twilio Auth Token
 * @returns {Promise<string>} - The S3 URL of the uploaded recording
 */
/**
 * Uploads an image file to S3 bucket with proper validation for profile pictures
 * @param {Buffer} fileBuffer - The image file buffer
 * @param {string} [originalFilename] - Original filename (used if customFilename not provided)
 * @param {string} [customFilename] - Custom filename to use (optional)
 * @param {string} DOCUMENTS_BUCKET - S3 bucket name
 * @param {string} [userId] - Optional user ID to include in filename
 * @returns {Promise<string>} - URL of the uploaded image
 */
export async function uploadImageToS3({
  fileBuffer,
  originalFilename = null,
  customFilename = null,
  DOCUMENTS_BUCKET,
  userId = null
}) {
  const extension = getFileExtension(originalFilename || customFilename || '');
  const supportedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  
  if (!supportedImageTypes.includes(extension)) {
    throw new Error(`Unsupported image type: ${extension}. Supported types: ${supportedImageTypes.join(', ')}`);
  }

  // Generate filename with user ID if provided
  let filename;
  if (customFilename) {
    filename = `profile-pictures/${customFilename}`;
  } else if (originalFilename) {
    const baseName = originalFilename.replace(/\.[^/.]+$/, "");
    const uniquePart = userId ? `${userId}-${randomUUID().slice(0, 8)}` : randomUUID();
    filename = `profile-pictures/${uniquePart}-${baseName}.${extension}`;
  } else {
    const uniquePart = userId || randomUUID();
    filename = `profile-pictures/${uniquePart}.${extension}`;
  }

  // Additional validation for profile picture size (optional)
  if (fileBuffer.length > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('Profile picture size exceeds 5MB limit');
  }

  const uploadParams = {
    Bucket: DOCUMENTS_BUCKET,
    Key: filename,
    Body: fileBuffer,
    ContentType: getMimeType(filename),
    ACL: "public-read"
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("S3 image upload error:", error);
    throw error;
  }
}