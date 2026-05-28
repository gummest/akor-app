import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const artist = await prisma.artist.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        songs: {
          select: {
            id: true,
            title: true,
            slug: true,
            genre: true,
            viewCount: true,
            isPopular: true,
            isNew: true,
          },
          orderBy: { viewCount: "desc" },
        },
        _count: { select: { songs: true } },
      },
    });

    if (!artist) {
      return NextResponse.json(
        { error: "Sanatçı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error("GET /api/artists/[id] error:", error);
    return NextResponse.json(
      { error: "Sanatçı yüklenirken hata oluştu" },
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
    const { name, imageUrl, bio } = body;

    const existing = await prisma.artist.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sanatçı bulunamadı" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.slug = slugify(name.trim());
    }
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (bio !== undefined) updateData.bio = bio;

    const artist = await prisma.artist.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json(artist);
  } catch (error) {
    console.error("PUT /api/artists/[id] error:", error);
    return NextResponse.json(
      { error: "Sanatçı güncellenirken hata oluştu" },
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

    const existing = await prisma.artist.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sanatçı bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.artist.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Sanatçı silindi" });
  } catch (error) {
    console.error("DELETE /api/artists/[id] error:", error);
    return NextResponse.json(
      { error: "Sanatçı silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
