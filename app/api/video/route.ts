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

    // Map of prompt keywords to relevant stock videos
    const videoMapping: Record<string, string> = {
      nature:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      forest:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      water:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      ocean:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      sea: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      city: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      urban:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      space:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      galaxy:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      food: "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      cooking:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      animal:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
      tiger:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      beach:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      sunset:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      sunrise:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      mountain:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      snow: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      winter:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      rain: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      storm:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      cloud:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      fire: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      flower:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
      garden:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    };

    // Find a matching video based on the prompt
    const promptLower = prompt.toLowerCase();
    let videoUrl = "";

    // Check if any keywords in the mapping match the prompt
    for (const [keyword, url] of Object.entries(videoMapping)) {
      if (promptLower.includes(keyword)) {
        videoUrl = url;
        break;
      }
    }

    // If no match found, use a default video
    if (!videoUrl) {
      // Default video for any other prompt
      videoUrl =
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }

    return NextResponse.json([videoUrl], { status: 200 });
  } catch (error: unknown) {
    console.error("[VIDEO_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
