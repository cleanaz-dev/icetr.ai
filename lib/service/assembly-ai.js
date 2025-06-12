import { AssemblyAI } from "assemblyai";


const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export async function transcribeRecording(recordingUrl) {
  try {
    console.log("Starting transcription for:", recordingUrl);

    const params = {
      audio: recordingUrl,
      speech_model: "universal",
    };

     const transcript = await client.transcripts.transcribe(params);
    

    if (transcript.status === "error") {
      console.error("Transcription failed:", transcript.error);
      return null;
    }

    console.log("Transcription completed successfully");
    return {
      text: transcript.text,
      id: transcript.id,
    };
  } catch (error) {
    console.error("Error transcribing recording:", error);
    return null;
  }
}
