import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export async function transcribeRecording(recordingUrl) {
  try {
    console.log("Starting transcription for:", recordingUrl);

    const params = {
      audio: recordingUrl,
      speech_model: "slam-1",
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

export async function transcribePracticeCall(recordingUrl) {
  try {
    const params = {
      audio: recordingUrl,
      speech_model: "slam-1",
      
      // Key features for cold call analysis
      speaker_labels: true, // Separate caller vs AI
      // summarization: true,
      // summary_model: "conversational",
      // summary_type: "paragraph",
      // sentiment_analysis: true, // Uncomment this if you want sentiment
      punctuate: true, // Better readability
      format_text: true, // Clean formatting
      
      // // Optional but useful
      // auto_highlights: true, // Key moments detection
      // entity_detection: true, // Names, companies, etc.
    };

    const transcript = await client.transcripts.transcribe(params);
    
    // Wait for transcription to complete
    let completed = await client.transcripts.get(transcript.id);
    while (completed.status === 'processing') {
      console.log("Transcription processing...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      completed = await client.transcripts.get(transcript.id);
    }
    
    if (completed.status !== 'completed') {
      throw new Error(`Transcription failed with status: ${completed.status}`);
    }

    return {

      id: completed.id,
      // summary: completed.summary, // Now available after completion
      speakers: completed.utterances,
      sentiment: completed.sentiment_analysis_results,
      highlights: completed.auto_highlights_result,
    };
  } catch (error) {
    console.error("Error transcribing recording:", error);
    return null;
  }
}

export async function transcribeAndAnalyzePracticeCall(recordingUrl) {
  try {
    console.log("Starting transcription for practice call:", recordingUrl);

    // Step 1: Start transcription with all features
    const params = {
      audio: recordingUrl,
      speech_model: "universal",

      // Key features for cold call analysis
      speaker_labels: true, // Separate caller vs AI
      speakers_expected: 2,
      sentiment_analysis: true, // Track emotional tone
      punctuate: true, // Better readability
      format_text: true, // Clean formatting

      // Optional but useful
      auto_highlights: true, // Key moments detection
      entity_detection: true, // Names, companies, etc.
    };

    const transcript = await client.transcripts.transcribe(params);
    console.log("Transcription started, waiting for completion...");

    // Step 2: Wait for transcription to complete
    let completed = await client.transcripts.get(transcript.id);
    while (completed.status === "processing") {
      console.log("Transcription still processing...");
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
      completed = await client.transcripts.get(transcript.id);
    }

    if (completed.status !== "completed") {
      throw new Error(`Transcription failed with status: ${completed.status}`);
    }

    console.log("Transcription completed, starting LeMUR analysis...");

    // Step 3: Run LeMUR analysis
    const comprehensiveAnalysis = `
      You are an expert sales trainer analyzing a cold call practice session. Rate and provide feedback on:

      SCORES (1-10 scale):
      - Opening/Introduction quality
      - Rapport building effectiveness  
      - Discovery/needs assessment
      - Value proposition delivery
      - Objection handling
      - Call control and flow
      - Closing/next steps

      DETAILED FEEDBACK:
      - What specific techniques did the caller use well?
      - What were the biggest missed opportunities?
      - How could they improve their questioning strategy?
      - Rate their listening skills and provide examples
      - What was their talk-to-listen ratio like?

      FORMAT: Return as structured JSON with scores and detailed explanations.
    `;

    const lemurAnalysis = await client.lemur.task({
      transcript_ids: [completed.id],
      prompt: comprehensiveAnalysis,
    });

    console.log("Analysis completed successfully");

    // Step 4: Return combined results
    return {
      transcript: {
        text: completed.text,
        id: completed.id,
        speakers: completed.utterances,
        sentiment: completed.sentiment_analysis_results,
        highlights: completed.auto_highlights_result,
      },
      analysis: JSON.parse(lemurAnalysis.response), // Parse the JSON response
      raw_lemur_response: lemurAnalysis.response,
    };
  } catch (error) {
    console.error("Error in transcription and analysis:", error);
    return null;
  }
}
