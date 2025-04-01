import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) return new NextResponse("Unauthorized.", { status: 401 });
    if (!GEMINI_API_KEY)
      return new NextResponse("Gemini API key not configured.", {
        status: 500,
      });
    if (!messages)
      return new NextResponse("Messages are required.", { status: 400 });

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro)
      return new NextResponse("Free trial has expired.", { status: 403 });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: messages }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return new NextResponse("Failed to fetch response from Gemini.", {
        status: response.status,
      });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content || "No response from Gemini.";

    if (!isPro) await increaseApiLimit();

    return NextResponse.json({ message: reply }, { status: 200 });
  } catch (error) {
    console.error("[CONVERSATION_ERROR]:", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
