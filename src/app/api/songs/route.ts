import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const artistId = searchParams.get("artistId") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const sort = searchParams.get("sort") || "new";
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { artist: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (genre) where.genre = genre;
    if (artistId) where.artistId = artistId;
    if (difficulty) where.difficulty = difficulty;

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "popular") orderBy = { viewCount: "desc" };

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          artist: { select: { id: true, name: true, slug: true } },
          _count: { select: { chords: true } },
        },
      }),
      prisma.song.count({ where }),
    ]);

    return NextResponse.json({
      songs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/songs error:", error);
    return NextResponse.json(
      { error: "Şarkılar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, artistId, genre, releaseYear, difficulty, categories } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Şarkı adı zorunludur" },
        { status: 400 }
      );
    }

    if (!artistId) {
      return NextResponse.json(
        { error: "Sanatçı ID zorunludur" },
        { status: 400 }
      );
    }

    const artist = await prisma.artist.findUnique({ where: { id: artistId } });
    if (!artist) {
      return NextResponse.json(
        { error: "Sanatçı bulunamadı" },
        { status: 404 }
      );
    }

    const slug = slugify(title.trim());

    const existing = await prisma.song.findFirst({
      where: { artistId, title: title.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu şarkı bu sanatçı için zaten mevcut" },
        { status: 409 }
      );
    }

    const songData: Record<string, unknown> = {
      title: title.trim(),
      slug,
      artistId,
      genre: genre || null,
      releaseYear: releaseYear ? parseInt(releaseYear) : null,
      difficulty: difficulty || "orta",
    };

    if (categories && Array.isArray(categories) && categories.length > 0) {
      songData.categories = {
        create: categories.map((categoryId: string) => ({
          category: { connect: { id: categoryId } },
        })),
      };
    }

    const song = await prisma.song.create({
      data: songData as any,
      include: {
        artist: { select: { id: true, name: true, slug: true } },
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error("POST /api/songs error:", error);
    return NextResponse.json(
      { error: "Şarkı oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
