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

    // Format the prompt to encourage interactive responses
    const enhancedPrompt = `Please respond to this in an interactive, conversational way with clear sections and bullet points where appropriate: ${lastMessage.content}`;

    // Send the message to the model
    const result = await chat.sendMessage(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    // Process the response to ensure it's formatted in an interactive way
    const formattedResponse = formatResponseForInteractivity(text);

    return NextResponse.json({ message: formattedResponse }, { status: 200 });
  } catch (error: unknown) {
    console.error("[CONVERSATION_ERROR]:", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}

// Helper function to format the response for better interactivity
function formatResponseForInteractivity(text: string): string {
  // If the response already has formatting elements, return as is
  if (text.includes("- ") || text.includes("* ") || text.includes("#")) {
    return text;
  }

  // Split the text into paragraphs
  const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0);

  // If there's only one paragraph, return as is
  if (paragraphs.length <= 1) {
    return text;
  }

  // Format the response with headings and bullet points where appropriate
  let formattedText = "";

  paragraphs.forEach((paragraph, index) => {
    // First paragraph is often an introduction
    if (index === 0) {
      formattedText += paragraph + "\n\n";
      return;
    }

    // Short paragraphs (likely conclusions or transitions)
    if (paragraph.length < 100) {
      formattedText += paragraph + "\n\n";
      return;
    }

    // For longer paragraphs, try to break them into bullet points
    const sentences = paragraph.split(/\.\s+/);

    if (sentences.length >= 3) {
      // Add a heading based on the first sentence
      formattedText += `## ${sentences[0].trim()}\n\n`;

      // Convert remaining sentences to bullet points
      sentences.slice(1).forEach((sentence) => {
        if (sentence.trim().length > 0) {
          formattedText += `- ${sentence.trim()}.\n`;
        }
      });

      formattedText += "\n";
    } else {
      // Keep short paragraphs as is
      formattedText += paragraph + "\n\n";
    }
  });

  return formattedText.trim();
}
