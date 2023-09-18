"use node";
import { OpenAI } from "openai";
import { internalAction } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

type ChatParams = {
  messages: Doc<"messages">[];
  messageId: Id<"messages">;
};
export const chat = internalAction({
  handler: async (ctx, { messages, messageId }: ChatParams) => {
    const apiKey = process.env.OPENAI_API_KEY!;
    const openai = new OpenAI({ apiKey });


    let additionalContext: any[] = [];

    const recallMemories = messages.some(message => message.body.includes("@gpt recall memories"));

    if (recallMemories) {
      const userId = messages[0]?.author;
      const memories = await ctx.db.query("memories").where("author", userId).order("_creationTime", "desc").take(10);
      additionalContext = memories.map(memory => ({ role: 'memory', content: memory.body }));
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // "gpt-4" also works, but is so slow!
      stream: true,
      messages: [
        {
          role: "system",
          content: `# MISSION\nYou're part of an ACE (Autonomous Cognitive Entity), specifically Layer 2: Global Strategy. You analyze current conditions and mission directives to formulate detailed strategic plans.\n\n# STRATEGIC DOCUMENTS\nYour output must be finely tuned to the situation, essentially functioning as the "executive director" for the entity. Your documents should include two main sections: 1) Specific strategies aligned with the mission. 2) Ethical and strategic principles to be followed during the execution of these strategies.\n\n# INTERACTION SCHEMA\nUsers will input structured data containing both current environmental context and higher-level mission objectives. You'll output a markdown document that's specific, precise, and comprehensive, covering the strategies and principles mentioned above.`
          ,
        }, ...additionalContext,
        ...messages.map(({ body, author }) => ({
          role: author === "ChatGPT" ? "assistant" : "user",
          content: body,
        })),
      ],
    });


     
    
    if (!stream.response.ok) {
      await ctx.runMutation(internal.messages.update, {
        messageId,
        body: "OpenAI call failed: " + stream.response.statusText,
      });
    }
    let body = "";
    for await (const part of stream) {
      if (part.choices[0].delta?.content) {
        body += part.choices[0].delta.content;
        // Alternatively you could wait for complete words / sentences.
        // Here we send an update on every stream message.
        await ctx.runMutation(internal.messages.update, {
          messageId,
          body,
        });
      }
    }
  },
});
