import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const syncLogs = await prisma.syncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(syncLogs);
  } catch (error) {
    console.error("GET /api/sync error:", error);
    return NextResponse.json(
      { error: "Sync logları yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "Sync tipi zorunludur" },
        { status: 400 }
      );
    }

    const syncLog = await prisma.syncLog.create({
      data: {
        type,
        status: "pending",
        startedAt: new Date(),
        songsFound: 0,
        songsAdded: 0,
      },
    });

    return NextResponse.json(syncLog, { status: 201 });
  } catch (error) {
    console.error("POST /api/sync error:", error);
    return NextResponse.json(
      { error: "Sync başlatılırken hata oluştu" },
      { status: 500 }
    );
  }
}
