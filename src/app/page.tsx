import Link from "next/link";
import { Music, Sparkles, Star, TrendingUp, Search } from "lucide-react";

const popularSongs = [
  { title: "Firuze", artist: "Sezen Aksu", difficulty: "Orta" },
  { title: "Gurbet", artist: "Müslüm Gürses", difficulty: "Kolay" },
  { title: "Beni Vur", artist: "Yeni Türkü", difficulty: "Zor" },
  { title: "Bir Kadın Çizeceksin", artist: "Manga", difficulty: "Orta" },
  { title: "Yıldızların Altında", artist: "Kargo", difficulty: "Kolay" },
  { title: "Aşk-ı Kıyamet", artist: "Emre Aydın", difficulty: "Orta" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI Destekli Akorlar",
    description:
      "Yapay zeka ile doğrulanmış, en doğru akor dizilimleri.",
  },
  {
    icon: TrendingUp,
    title: "Trend Şarkılar",
    description:
      "En çok aranan ve çalınan şarkıları anında keşfedin.",
  },
  {
    icon: Search,
    title: "Kolay Arama",
    description:
      "Sanatçı, şarkı veya kategoriye göre hızlıca bulun.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm mb-8">
              <Music className="w-4 h-4" />
              <span>Türkiye&apos;nin En Kapsamlı Akor Arşivi</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary-light via-primary to-accent bg-clip-text text-transparent">
                Akor
              </span>
              <span className="text-foreground"> ile Müziği Hisset</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Binlerce Türkçe şarkının akorları, AI destekli doğrulama ve
              modern arayüz ile parmaklarınızın ucunda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sarkilar"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-primary/25"
              >
                <Search className="w-5 h-5" />
                Şarkıları Keşfet
              </Link>
              <Link
                href="/sanatcilar"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-primary/50 text-foreground font-semibold transition-all duration-200 hover:bg-card"
              >
                <Star className="w-5 h-5" />
                Sanatçılar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-light" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Songs */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Popüler Akorlar
              </h2>
              <p className="text-muted-foreground">
                En çok çalınan şarkıların akorları
              </p>
            </div>
            <Link
              href="/sarkilar"
              className="hidden sm:inline-flex items-center gap-1 text-primary-light hover:text-primary transition-colors font-medium"
            >
              Tümünü Gör
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularSongs.map((song) => (
              <Link
                key={song.title}
                href={`/sarki/${song.artist.toLowerCase().replace(/\s+/g, "-")}/${song.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Music className="w-5 h-5 text-primary-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary-light transition-colors">
                    {song.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  {song.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Akor - AI destekli Türkçe şarkı
            akorları
          </p>
        </div>
      </footer>
    </div>
  );
}
