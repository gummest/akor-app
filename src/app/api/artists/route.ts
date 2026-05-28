import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const artists = await prisma.artist.findMany({
      where,
      take: limit,
      orderBy: { name: "asc" },
      include: { _count: { select: { songs: true } } },
    });

    return NextResponse.json(artists);
  } catch (error) {
    console.error("GET /api/artists error:", error);
    return NextResponse.json(
      { error: "Sanatçılar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, imageUrl, bio } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Sanatçı adı zorunludur" },
        { status: 400 }
      );
    }

    const slug = slugify(name.trim());

    const existing = await prisma.artist.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu sanatçı zaten mevcut" },
        { status: 409 }
      );
    }

    const artist = await prisma.artist.create({
      data: {
        name: name.trim(),
        slug,
        imageUrl: imageUrl || null,
        bio: bio || null,
      },
    });

    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error("POST /api/artists error:", error);
    return NextResponse.json(
      { error: "Sanatçı oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
