import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalSongs,
      totalArtists,
      totalChords,
      totalCategories,
      popularSongs,
      genreDistribution,
      difficultyDistribution,
    ] = await Promise.all([
      prisma.song.count(),
      prisma.artist.count(),
      prisma.chord.count(),
      prisma.category.count(),
      prisma.song.findMany({
        take: 10,
        orderBy: { viewCount: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          artist: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.song.groupBy({
        by: ["genre"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.song.groupBy({
        by: ["difficulty"],
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      counts: {
        songs: totalSongs,
        artists: totalArtists,
        chords: totalChords,
        categories: totalCategories,
      },
      popularSongs,
      genreDistribution: genreDistribution
        .filter((g) => g.genre)
        .map((g) => ({ genre: g.genre, count: g._count.id })),
      difficultyDistribution: difficultyDistribution.map((d) => ({
        difficulty: d.difficulty,
        count: d._count.id,
      })),
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { error: "İstatistikler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
