import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const chord = await prisma.chord.findUnique({
      where: { id },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            slug: true,
            artist: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!chord) {
      return NextResponse.json(
        { error: "Akor bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(chord);
  } catch (error) {
    console.error("GET /api/chords/[id] error:", error);
    return NextResponse.json(
      { error: "Akor yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, capo, tuning, submittedBy } = body;

    const existing = await prisma.chord.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Akor bulunamadı" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (capo !== undefined) updateData.capo = parseInt(String(capo));
    if (tuning !== undefined) updateData.tuning = tuning;
    if (submittedBy !== undefined) updateData.submittedBy = submittedBy;

    const chord = await prisma.chord.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(chord);
  } catch (error) {
    console.error("PUT /api/chords/[id] error:", error);
    return NextResponse.json(
      { error: "Akor güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.chord.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Akor bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.chord.delete({ where: { id } });

    return NextResponse.json({ message: "Akor silindi" });
  } catch (error) {
    console.error("DELETE /api/chords/[id] error:", error);
    return NextResponse.json(
      { error: "Akor silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
