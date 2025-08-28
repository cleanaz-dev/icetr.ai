import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

// Initialize Groq client using OpenAI package
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json(
      { message: "Organization ID is required." },
      { status: 400 }
    );
  }

  const { messages } = await req.json();

  try {
    const completion = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct",
      messages: [
        {
          role: "system",
          content: "You are an assistant. Keep responses concise (3-4 sentences).",
        },
        ...messages.map((m) => ({
          role: m.role,
          content: String(m.content),
        })),
      ],
      max_tokens: 300,
      temperature: 0.1,
    });

    const aiResponse = completion.choices[0].message.content.trim();
    console.log("AI Response:", aiResponse);
    return NextResponse.json({ aiResponse });

  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { reply: "Error talking to Groq API." },
      { status: 500 }
    );
  }
}