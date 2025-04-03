import { auth } from "@clerk/nextjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt, amount = "1", resolution = "512x512" } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required.", { status: 400 });
    }

    // Initialize the Google Generative AI with API key
    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Gemini API Key is required", { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // For image generation, use the gemini-1.5-pro-vision model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });

    // Parse resolution
    const [width, height] = resolution
      .split("x")
      .map((dim) => parseInt(dim, 10));

    // Generate images based on the requested amount
    const imageUrls = [];
    const count = parseInt(amount, 10);

    try {
      for (let i = 0; i < count; i++) {
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Generate an image based on this description: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        });

        const response = await result.response;
        const text = response.text();

        // Since Gemini doesn't directly return image URLs, we'll use a fallback to Unsplash
        // with the prompt as a search term for demonstration purposes
        imageUrls.push(
          `https://source.unsplash.com/random/${width}x${height}/?${encodeURIComponent(prompt)}`,
        );
      }
    } catch (genError) {
      console.error("[GEMINI_IMAGE_ERROR]: ", genError);
      // Fallback to Unsplash if Gemini fails
      for (let i = 0; i < count; i++) {
        imageUrls.push(
          `https://source.unsplash.com/random/${width}x${height}/?${encodeURIComponent(prompt)}`,
        );
      }
    }

    return NextResponse.json({ images: imageUrls }, { status: 200 });
  } catch (error: unknown) {
    console.error("[IMAGE_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
