import { AssemblyAI } from "assemblyai";
import { downloadAndUploadTwilioRecording } from "./aws.js";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export async function transcribeRecording(recordingUrl) {
  try {
    console.log("Starting transcription for:", recordingUrl);
    
    const config = {
      audio_url: recordingUrl,
    };

    const transcript = await client.transcripts.transcribe(config);
    
    if (transcript.status === 'error') {
      console.error('Transcription failed:', transcript.error);
      return null;
    }

    console.log("Transcription completed successfully");
    return transcript.text;
  } catch (error) {
    console.error("Error transcribing recording:", error);
    return null;
  }
}

export async function transcribeRecordingWithOptions(recordingUrl, options = {}) {
  try {
    console.log("Starting transcription with options for:", recordingUrl);
    
    const config = {
      audio_url: recordingUrl,
      ...options
    };

    const transcript = await client.transcripts.transcribe(config);
    
    if (transcript.status === 'error') {
      console.error('Transcription failed:', transcript.error);
      return null;
    }

    console.log("Transcription completed successfully");
    return transcript;
  } catch (error) {
    console.error("Error transcribing recording:", error);
    return null;
  }
}

/**
 * Downloads a Twilio recording to S3 and then transcribes it
 * @param {string} twilioRecordingUrl - The Twilio recording URL
 * @param {string} DOCUMENTS_BUCKET - S3 bucket name
 * @param {Object} options - Transcription options
 * @param {Object} twilioAuth - Optional Twilio auth credentials
 * @param {string} twilioAuth.accountSid - Twilio Account SID
 * @param {string} twilioAuth.authToken - Twilio Auth Token
 * @returns {Promise<string|null>} - The transcription text or null if failed
 */
export async function transcribeTwilioRecording(twilioRecordingUrl, DOCUMENTS_BUCKET, options = {}, twilioAuth = null) {
  try {
    console.log("Starting Twilio recording transcription process for:", twilioRecordingUrl);
    
    // Step 1: Download Twilio recording and upload to S3
    const s3Url = await downloadAndUploadTwilioRecording(twilioRecordingUrl, DOCUMENTS_BUCKET, twilioAuth);
    
    // Step 2: Transcribe the S3 URL
    console.log("Transcribing uploaded recording from S3:", s3Url);
    
    const config = {
      audio_url: s3Url,
      ...options
    };

    const transcript = await client.transcripts.transcribe(config);
    
    if (transcript.status === 'error') {
      console.error('Transcription failed:', transcript.error);
      return null;
    }

    console.log("Twilio recording transcription completed successfully");
    return transcript.text;
    
  } catch (error) {
    console.error("Error transcribing Twilio recording:", error);
    return null;
  }
}

/**
 * Downloads a Twilio recording to S3 and transcribes it with full transcript details
 * @param {string} twilioRecordingUrl - The Twilio recording URL
 * @param {string} DOCUMENTS_BUCKET - S3 bucket name
 * @param {Object} options - Transcription options
 * @param {Object} twilioAuth - Optional Twilio auth credentials
 * @returns {Promise<Object|null>} - The full transcript object or null if failed
 */
export async function transcribeTwilioRecordingWithDetails(twilioRecordingUrl, DOCUMENTS_BUCKET, options = {}, twilioAuth = null) {
  try {
    console.log("Starting detailed Twilio recording transcription process for:", twilioRecordingUrl);
    
    // Step 1: Download Twilio recording and upload to S3
    const s3Url = await downloadAndUploadTwilioRecording(twilioRecordingUrl, DOCUMENTS_BUCKET, twilioAuth);
    
    // Step 2: Transcribe the S3 URL with full details
    console.log("Transcribing uploaded recording from S3 with details:", s3Url);
    
    const config = {
      audio_url: s3Url,
      ...options
    };

    const transcript = await client.transcripts.transcribe(config);
    
    if (transcript.status === 'error') {
      console.error('Transcription failed:', transcript.error);
      return null;
    }

    console.log("Detailed Twilio recording transcription completed successfully");
    return transcript;
    
  } catch (error) {
    console.error("Error transcribing Twilio recording with details:", error);
    return null;
  }
}