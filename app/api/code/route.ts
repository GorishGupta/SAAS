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
      return new NextResponse("Messages are required.", { status: 400 });
    }

    // Initialize the Google Generative AI with API key
    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Gemini API Key is required", { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // For code generation, use the gemini-1.5-pro model
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
        temperature: 0.2, // Lower temperature for more deterministic code generation
        topP: 0.95,
        topK: 40,
      },
    });

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];

    // Add code generation specific instructions
    const codePrompt = `You are an expert programmer. Please provide clean, efficient, and well-commented code for the following request. Format your response with proper markdown code blocks using triple backticks with the appropriate language identifier. Focus only on the code implementation without unnecessary explanations: ${lastMessage.content}`;

    // Send the message to the model
    const result = await chat.sendMessage(codePrompt);
    const response = await result.response;
    const codeResponse = response.text();

    // Return the response
    return NextResponse.json(
      { role: "assistant", content: codeResponse },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[CODE_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
