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
    const { messages } = body;

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    // Initialize the Google Generative AI with API key
    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Gemini API Key is required", { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // For text-only input, use the gemini-1.5-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Convert messages to the format expected by Gemini
    const formattedMessages = messages.map((message: any) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    }));

    // Start a chat session
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1),
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];

    // Send the message to the model
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text }, { status: 200 });
  } catch (error: unknown) {
    console.error("[CONVERSATION_ERROR]:", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
