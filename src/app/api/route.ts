import { ChatOpenAI } from "langchain/chat_models/openai";
import { CallbackManager } from "langchain/callbacks";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const chat = new ChatOpenAI({
    streaming: true,
    callbackManager: CallbackManager.fromHandlers({
      handleLLMNewToken: async (token: string) => {
        await writer.ready;
        await writer.write(
          encoder.encode(`data: ${token.replace(/["'\n\r]/g, "")}\n\n`)
        );
      },
      handleLLMEnd: async () => {
        await writer.ready;
        await writer.close();
      },
      handleLLMError: async (e) => {
        await writer.ready;
        await writer.abort(e);
      },
    }),
  });
  chat.call([
    new SystemChatMessage(
      "You are an Emoji translator. You translate text into Emoji. You are given a text prompt and respond with emojis that you think describes the text the best. Use a maximum of 3 emojis. You never respond with anythign other than emojis. If you dont know what to respond with you respond with 🤷🏻‍♂️."
    ),
    new HumanChatMessage(body.prompt),
  ]);

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
