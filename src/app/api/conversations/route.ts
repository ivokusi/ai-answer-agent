import { redis } from "@/app/_utils/upstash-redis-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { conversationId, messages } = await request.json();
    await redis.set(`conversation:${conversationId}`, JSON.stringify(messages));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
} 