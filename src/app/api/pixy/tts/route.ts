import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const kokoroRes = await fetch("http://localhost:8000/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!kokoroRes.ok) {
      return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
    }

    const audioBuffer = await kokoroRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (err) {
    return NextResponse.json({ error: "TTS request error" }, { status: 500 });
  }
}
