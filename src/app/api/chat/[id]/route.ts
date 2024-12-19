import { redis } from "@/app/_utils/upstash-redis-client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const messages = await redis.get(`conversation:${id}`);
    
    if (!messages) {
      return NextResponse.json({ messages: [] });
    }

    if (typeof messages !== 'string') {
      return NextResponse.json({ messages });
    }

    return NextResponse.json({ messages: JSON.parse(messages) });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}