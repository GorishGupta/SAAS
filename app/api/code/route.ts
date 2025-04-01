import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";  // Axios for making API requests to Gemini

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

// Example Gemini API URL (replace with the actual URL)
const GEMINI_API_URL = "https://api.gemini.com/v1/chat/completions"; 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store your Gemini API key securely

const instructionMessage = {
  role: "system",
  content:
    "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanation.",
};

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

    // Construct the request to Gemini
    const response = await axios.post(
      GEMINI_API_URL,
      {
        model: "gemini-4", // Replace with the correct Gemini model name
        messages: [instructionMessage, ...messages],
      },
      {
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!isPro) await increaseApiLimit();

    // Return the assistant's response
    return NextResponse.json(response.data.choices[0].message, { status: 200 });
  } catch (error: unknown) {
    console.error("[CODE_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
