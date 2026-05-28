import { discoverTrendingSongs, generateChordsForSong } from "./ai";

async function getPrisma() {
  const { prisma } = await import("../src/lib/db");
  return prisma;
}

async function getSlugify() {
  const { slugify } = await import("../src/lib/utils");
  return slugify;
}

export async function runDailySync(): Promise<{ found: number; added: number }> {
  const prisma = await getPrisma();
  const slugify = await getSlugify();

  // Create sync log
  const syncLog = await prisma.syncLog.create({
    data: { type: "daily", status: "running", startedAt: new Date() },
  });

  try {
    // Discover trending songs
    const trending = await discoverTrendingSongs();
    
    let added = 0;
    for (const song of trending) {
      try {
        // Find or create artist
        let artist = await prisma.artist.findUnique({
          where: { slug: slugify(song.artist) },
        });

        if (!artist) {
          artist = await prisma.artist.create({
            data: {
              name: song.artist,
              slug: slugify(song.artist),
            },
          });
        }

        // Check if song exists
        const existing = await prisma.song.findFirst({
          where: {
            artistId: artist.id,
            title: song.title,
          },
        });

        if (existing) continue;

        // Generate chords with AI
        const chordResult = await generateChordsForSong(song.artist, song.title);
        if (!chordResult) continue;

        // Create song with chords
        await prisma.song.create({
          data: {
            title: song.title,
            slug: slugify(song.title),
            artistId: artist.id,
            genre: song.genre,
            aiGenerated: true,
            isNew: true,
            chords: {
              create: {
                content: chordResult.content,
                capo: chordResult.capo,
                tuning: chordResult.tuning,
                submittedBy: "AI (Gemma-4)",
              },
            },
          },
        });

        added++;
      } catch (err) {
        console.error(`Failed to process ${song.artist} - ${song.title}:`, err);
      }
    }

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "completed",
        songsFound: trending.length,
        songsAdded: added,
        completedAt: new Date(),
      },
    });

    return { found: trending.length, added };
  } catch (err) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "failed",
        error: String(err),
        completedAt: new Date(),
      },
    });
    throw err;
  }
}

export async function runWeeklySync(): Promise<{ found: number; added: number }> {
  const prisma = await getPrisma();

  const syncLog = await prisma.syncLog.create({
    data: { type: "weekly", status: "running", startedAt: new Date() },
  });

  try {
    // Reset isNew flag for old songs (older than 7 days)
    await prisma.song.updateMany({
      where: {
        isNew: true,
        createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      data: { isNew: false },
    });

    // Run daily sync for fresh content
    const result = await runDailySync();

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "completed",
        songsFound: result.found,
        songsAdded: result.added,
        completedAt: new Date(),
      },
    });

    return result;
  } catch (err) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "failed",
        error: String(err),
        completedAt: new Date(),
      },
    });
    throw err;
  }
}
