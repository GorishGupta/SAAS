import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { prompt, amount = "1", resolution = "512x512" } = body;

    if (!userId) return new NextResponse("Unauthorized.", { status: 401 });
    if (!process.env.GEMINI_API_KEY)
      return new NextResponse("Gemini API key not configured.", { status: 500 });

    if (!prompt) return new NextResponse("Prompt is required.", { status: 400 });

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) return new NextResponse("Free trial has expired.", { status: 403 });

    // Google Imagen API (Actual Text-to-Image Model)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/imagen:generateImage?key=${process.env.GEMINI_API_KEY}`,
      {
        prompt, // Directly send the prompt
        numImages: parseInt(amount, 10),
        size: resolution,
      }
    );

    if (!isPro) await increaseApiLimit();

    const images = response.data.images || [];
    const imageUrls = images.map((img: any) => img.url); // Correctly extract URLs

    return NextResponse.json({ images: imageUrls }, { status: 200 });
  } catch (error: unknown) {
    console.error("[IMAGE_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
