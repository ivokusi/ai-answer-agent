import { Groq } from "groq-sdk";
import { Logger } from "./logger";

const logger = new Logger("groqClient");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export async function getGroqResponse(history: ChatMessage[]) {

    const messages: ChatMessage[] = [
        { role: "system", content: "You are an academic expert, you always cite your sources and base your responses only on the context that you have been provided." },
        ...history
    ];

    logger.info("Starting Groq API request");
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
    });
    logger.info("Completed Groq API request");

    return response.choices[0].message.content;
}

