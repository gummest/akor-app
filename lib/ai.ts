const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "https://lm.mesutapps.online";
const LM_STUDIO_TOKEN = process.env.LM_STUDIO_TOKEN || "";
const LM_MODEL = process.env.LM_MODEL || "google/gemma-4-e4b";

interface ChordLine {
  chord: string;
  text: string;
}

interface ChordResult {
  content: string; // JSON string of ChordLine[]
  capo: number;
  tuning: string;
}

export async function generateChordsForSong(
  artistName: string,
  songTitle: string
): Promise<ChordResult | null> {
  const prompt = `Sen bir müzik uzmanısın. "${artistName}" sanatçısının "${songTitle}" şarkısı için gitar akorlarını çıkar.

Kesin format:
- Her satır "[Akor] şarkı sözü" formatında olmalı
- Akorlar satırın başında köşeli parantez içinde
- Capo değerini belirt (0 yoksa)
- Tuning: standart

Örnek çıktı:
{
  "lines": [
    {"chord": "Am", "text": "Bir yağmur yağar da"},
    {"chord": "G", "text": "Islanırım ben"},
    {"chord": "F", "text": "Bir rüzgar eser de"},
    {"chord": "C", "text": "Savrulurum ben"}
  ],
  "capo": 0,
  "tuning": "standart"
}

Sadece JSON döndür, başka bir şey yazma.`;

  try {
    const res = await fetch(`${LM_STUDIO_URL}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(LM_STUDIO_TOKEN ? { Authorization: `Bearer ${LM_STUDIO_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        model: LM_MODEL,
        input: prompt,
        temperature: 0.3,
        max_output_tokens: 4096,
        stream: false,
      }),
    });

    if (!res.ok) {
      console.error("LM Studio error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const output = data.output?.[0]?.content;
    if (!output) return null;

    // Parse JSON from output (it might be wrapped in markdown code blocks)
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      content: JSON.stringify(parsed.lines || []),
      capo: parsed.capo || 0,
      tuning: parsed.tuning || "standart",
    };
  } catch (err) {
    console.error("AI generation failed:", err);
    return null;
  }
}

export async function discoverTrendingSongs(): Promise<{ artist: string; title: string; genre: string }[]> {
  const prompt = `Türkiye'de şu anda en popüler ve trend olan 10 Türkçe şarkıyı listele. 
Her şarkı için sanatçı adı, şarkı adı ve tür bilgisini ver.
Sadece JSON array döndür, başka bir şey yazma.
Format: [{"artist": "Sanatçı", "title": "Şarkı", "genre": "Pop/Rock/Türkü vb"}]`;

  try {
    const res = await fetch(`${LM_STUDIO_URL}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(LM_STUDIO_TOKEN ? { Authorization: `Bearer ${LM_STUDIO_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        model: LM_MODEL,
        input: prompt,
        temperature: 0.5,
        max_output_tokens: 2048,
        stream: false,
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const output = data.output?.[0]?.content;
    if (!output) return [];

    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Trend discovery failed:", err);
    return [];
  }
}
