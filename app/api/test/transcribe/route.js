import { NextResponse } from 'next/server';
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    // Validate URL is provided
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log("Starting transcription for:", url);
    
    const params = {
      audio: url,
      speech_model: "universal",
    };

    const transcript = await client.transcripts.transcribe(params);
    
    if (transcript.status === 'error') {
      console.error('Transcription failed:', transcript.error);
      return NextResponse.json(
        { error: 'Transcription failed', details: transcript.error },
        { status: 500 }
      );
    }

    console.log("Transcription completed successfully");
    
    return NextResponse.json({
      success: true,
      text: transcript.text,
      id: transcript.id
    });
    
  } catch (error) {
    console.error("Error in transcription API:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}