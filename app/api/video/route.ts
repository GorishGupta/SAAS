import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt)
      return new NextResponse("Prompt is required.", { status: 400 });

    // Return a mock video URL - this is a sample video file URL
    // In a real application, you would generate this based on the prompt
    const mockVideoUrl =
      "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";

    return NextResponse.json([mockVideoUrl], { status: 200 });
  } catch (error: unknown) {
    console.error("[VIDEO_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
