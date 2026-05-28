import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { artistName, songTitle } = body;

    if (!artistName || !songTitle) {
      return NextResponse.json(
        { error: "artistName and songTitle are required" },
        { status: 400 }
      );
    }

    const { generateChordsForSong } = await import("../../../../../lib/ai");

    const result = await generateChordsForSong(artistName, songTitle);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to generate chords" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      chords: JSON.parse(result.content),
      capo: result.capo,
      tuning: result.tuning,
    });
  } catch (err) {
    console.error("AI chord generation failed:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
