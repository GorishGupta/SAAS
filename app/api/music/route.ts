import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt)
      return new NextResponse("Prompt is required.", { status: 400 });

    // Return a mock audio URL - this is a sample audio file URL
    // In a real application, you would generate this based on the prompt
    const mockAudioUrl =
      "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav";

    return NextResponse.json({ audio: mockAudioUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error("[MUSIC_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
