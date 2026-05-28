import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const song = await prisma.song.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        artist: true,
        chords: {
          orderBy: { createdAt: "desc" },
        },
        categories: {
          include: { category: true },
        },
        _count: { select: { chords: true } },
      },
    });

    if (!song) {
      return NextResponse.json(
        { error: "Şarkı bulunamadı" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.song.update({
      where: { id: song.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(song);
  } catch (error) {
    console.error("GET /api/songs/[id] error:", error);
    return NextResponse.json(
      { error: "Şarkı bilgisi yüklenirken hata oluştu" },
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
    const { title, artistId, genre, releaseYear, difficulty, isPopular, isNew, categories } = body;

    const existing = await prisma.song.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Şarkı bulunamadı" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      updateData.title = title.trim();
      updateData.slug = slugify(title.trim());
    }
    if (artistId !== undefined) updateData.artistId = artistId;
    if (genre !== undefined) updateData.genre = genre;
    if (releaseYear !== undefined) updateData.releaseYear = releaseYear;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (isNew !== undefined) updateData.isNew = isNew;

    // Handle categories update
    if (categories !== undefined && Array.isArray(categories)) {
      // Delete existing and create new
      await prisma.songCategory.deleteMany({
        where: { songId: existing.id },
      });
      if (categories.length > 0) {
        await prisma.songCategory.createMany({
          data: categories.map((categoryId: string) => ({
            songId: existing.id,
            categoryId,
          })),
        });
      }
    }

    const song = await prisma.song.update({
      where: { id: existing.id },
      data: updateData as any,
      include: {
        artist: { select: { id: true, name: true, slug: true } },
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(song);
  } catch (error) {
    console.error("PUT /api/songs/[id] error:", error);
    return NextResponse.json(
      { error: "Şarkı güncellenirken hata oluştu" },
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

    const existing = await prisma.song.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Şarkı bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.song.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Şarkı silindi" });
  } catch (error) {
    console.error("DELETE /api/songs/[id] error:", error);
    return NextResponse.json(
      { error: "Şarkı silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
