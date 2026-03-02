import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Accessing the key from your .env.local (Never use NEXT_PUBLIC_ here!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { title, rating, description, releaseYear } = await request.json();

    // Using 1.5 Flash for high-speed, low-latency responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an elite, witty, and slightly snarky movie critic for CineSense AI.
      Analyze the movie: "${title}" (${releaseYear}).
      Audience Rating: ${rating}/10.
      Context: ${description}
      
      Task: Provide a one-sentence "Verdict" on whether I should "Watch It" or "Skip It." 
      Be punchy, opinionated, and do not use generic "it's a great movie" language. 
      Maximum 25 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ verdict: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { verdict: "The AI is currently stuck in the lobby. Try again!" }, 
      { status: 500 }
    );
  }
}