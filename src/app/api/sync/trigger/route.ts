import { NextRequest, NextResponse } from "next/server";
import { runDailySync, runWeeklySync } from "../../../../../lib/sync";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body?.type || "daily";

    let result: { found: number; added: number };

    if (type === "weekly") {
      result = await runWeeklySync();
    } else {
      result = await runDailySync();
    }

    return NextResponse.json({
      success: true,
      type,
      found: result.found,
      added: result.added,
    });
  } catch (err) {
    console.error("Sync trigger failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: String(err),
      },
      { status: 500 }
    );
  }
}
