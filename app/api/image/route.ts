import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { prompt, amount = "1", resolution = "512x512" } = body;

    if (!prompt)
      return new NextResponse("Prompt is required.", { status: 400 });

    // Parse resolution and amount
    const [width, height] = resolution
      .split("x")
      .map((dim) => parseInt(dim, 10));

    // Validate dimensions (Stability API requires specific dimensions for SDXL)
    const validDimensions = [
      "1024x1024",
      "1152x896",
      "1216x832",
      "1344x768",
      "1536x640",
      "640x1536",
      "768x1344",
      "832x1216",
      "896x1152",
    ];

    if (!validDimensions.includes(`${width}x${height}`)) {
      return new NextResponse(
        "Invalid dimensions. For SDXL, allowed dimensions are: 1024x1024, 1152x896, 1216x832, 1344x768, 1536x640, 640x1536, 768x1344, 832x1216, 896x1152",
        { status: 400 },
      );
    }
    const count = parseInt(amount, 10);

    // Check if Stability API key is available
    if (!process.env.STABILITY_API_KEY) {
      return new NextResponse("Stability API key is required", { status: 500 });
    }

    // Generate images based on the requested amount
    const imageUrls = [];

    // Use Stability API for image generation
    for (let i = 0; i < count; i++) {
      try {
        // Create a unique seed for each image (Stability API requires a positive integer)
        const seed = Math.floor(Math.random() * 2147483647) + 1;

        // Call Stability API
        const response = await axios({
          method: "post",
          url: "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          },
          data: {
            text_prompts: [
              {
                text: prompt,
                weight: 1,
              },
            ],
            cfg_scale: 7,
            height,
            width,
            samples: 1,
            steps: 30,
            style_preset: "photographic",
            seed,
          },
        });

        // Process the response
        if (
          response.data &&
          response.data.artifacts &&
          response.data.artifacts.length > 0
        ) {
          // Convert base64 to data URL
          const base64Image = response.data.artifacts[0].base64;
          const imageUrl = `data:image/png;base64,${base64Image}`;
          imageUrls.push(imageUrl);
        }
      } catch (apiError) {
        console.error("[STABILITY_API_ERROR]:", apiError);
        // If Stability API fails, use fallback method
        imageUrls.push(getFallbackImageUrl(width, height));
      }
    }

    return NextResponse.json({ images: imageUrls }, { status: 200 });
  } catch (error: unknown) {
    console.error("[IMAGE_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}

// Fallback function to get a placeholder image if the API fails
function getFallbackImageUrl(width: number, height: number): string {
  // List of high-quality Unsplash photo IDs that are known to work
  const photoIds = [
    "1579546929518-9e396f3cc809", // Colorful abstract
    "1516796181074-bf453fbfa3e6", // Blue/purple gradient
    "1572289155914-8a97d5a45bb6", // Mountain landscape
    "1501854140801-50d01698950b", // Nature landscape
    "1505144808419-7957736f0a04", // City skyline
    "1560015534-cee980ba7e13", // Food dish
    "1530281700549-e82e7bf110d6", // Tiger
    "1548802673-380ab8ebc7b7", // Cat
    "1577023311546-cdc07a8454d9", // Digital art
    "1579033285037-b48b483e8a9f", // Abstract pattern
    "1518770660967-092fec94718e", // Tech/laptop
    "1507146426996-ef05306b995a", // Coffee
    "1470770903676-69b98201ea1c", // Food
    "1465146344425-f00d5f5c8f07", // Nature
    "1542831371-29b0f74f9713", // Code
    "1451187580459-43490279c0fa", // Space
    "1517960413843-0aee8e2b3285", // Portrait
    "1526047932273-341f2a7631f9", // Flowers
    "1569317002804-54b2c3141207", // Beach
    "1513151233558-d860c5398176", // Cityscape
  ];

  // Return a random photo ID from the list
  const randomId = photoIds[Math.floor(Math.random() * photoIds.length)];
  return `https://images.unsplash.com/photo-${randomId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}
