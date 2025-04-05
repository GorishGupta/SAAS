import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { prompt } = body;

    if (!prompt)
      return new NextResponse("Prompt is required.", { status: 400 });

    // Map of prompt keywords to relevant audio files
    const audioMapping: Record<string, string> = {
      piano: "https://cdn.freesound.org/previews/388/388046_7094125-lq.mp3",
      guitar: "https://cdn.freesound.org/previews/476/476340_9017140-lq.mp3",
      violin: "https://cdn.freesound.org/previews/612/612570_5674468-lq.mp3",
      orchestra: "https://cdn.freesound.org/previews/612/612570_5674468-lq.mp3",
      drums: "https://cdn.freesound.org/previews/219/219244_4082826-lq.mp3",
      percussion:
        "https://cdn.freesound.org/previews/219/219244_4082826-lq.mp3",
      electronic:
        "https://cdn.freesound.org/previews/382/382738_7089874-lq.mp3",
      techno: "https://cdn.freesound.org/previews/382/382738_7089874-lq.mp3",
      ambient: "https://cdn.freesound.org/previews/517/517664_10735571-lq.mp3",
      relaxing: "https://cdn.freesound.org/previews/517/517664_10735571-lq.mp3",
      jazz: "https://cdn.freesound.org/previews/382/382743_7089874-lq.mp3",
      blues: "https://cdn.freesound.org/previews/382/382743_7089874-lq.mp3",
      rock: "https://cdn.freesound.org/previews/476/476340_9017140-lq.mp3",
      pop: "https://cdn.freesound.org/previews/382/382738_7089874-lq.mp3",
      classical: "https://cdn.freesound.org/previews/612/612570_5674468-lq.mp3",
      soundtrack:
        "https://cdn.freesound.org/previews/517/517664_10735571-lq.mp3",
    };

    // Find a matching audio based on the prompt
    const promptLower = prompt.toLowerCase();
    let audioUrl = "";

    // Check if any keywords in the mapping match the prompt
    for (const [keyword, url] of Object.entries(audioMapping)) {
      if (promptLower.includes(keyword)) {
        audioUrl = url;
        break;
      }
    }

    // If no match found, use a default audio
    if (!audioUrl) {
      // Default audio for any other prompt
      audioUrl = "https://cdn.freesound.org/previews/388/388046_7094125-lq.mp3";
    }

    return NextResponse.json({ audio: audioUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error("[MUSIC_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
