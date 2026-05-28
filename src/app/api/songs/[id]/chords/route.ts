import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const song = await prisma.song.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });

    if (!song) {
      return NextResponse.json(
        { error: "Şarkı bulunamadı" },
        { status: 404 }
      );
    }

    const chords = await prisma.chord.findMany({
      where: { songId: song.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chords);
  } catch (error) {
    console.error("GET /api/songs/[id]/chords error:", error);
    return NextResponse.json(
      { error: "Akorlar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, capo, tuning, submittedBy } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Akor içeriği zorunludur" },
        { status: 400 }
      );
    }

    const song = await prisma.song.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });

    if (!song) {
      return NextResponse.json(
        { error: "Şarkı bulunamadı" },
        { status: 404 }
      );
    }

    const chord = await prisma.chord.create({
      data: {
        songId: song.id,
        content: content.trim(),
        capo: capo !== undefined ? parseInt(String(capo)) : 0,
        tuning: tuning || "standart",
        submittedBy: submittedBy || null,
      },
    });

    return NextResponse.json(chord, { status: 201 });
  } catch (error) {
    console.error("POST /api/songs/[id]/chords error:", error);
    return NextResponse.json(
      { error: "Akor eklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
