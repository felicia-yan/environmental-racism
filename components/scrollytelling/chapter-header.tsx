"use client";

interface ChapterHeaderProps {
  chapterNumber: number;
  title: string;
  totalChapters: number;
  currentSection?: number;
}

export function ChapterHeader({
  chapterNumber,
  title,
  totalChapters,
  currentSection = 0,
}: ChapterHeaderProps) {
  return (
    <header className="sticky top-0 z-50 py-2 px-6 flex items-center justify-center gap-3 bg-black">
      <span className="font-mono text-xs tracking-widest text-white">
        CHAPTER {chapterNumber}
      </span>
      <span className="font-serif text-sm text-white">{title}</span>

      {/* Progress dots */}
      <div className="flex items-center gap-2 ml-3">
        {Array.from({ length: totalChapters }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full border border-white/50 transition-colors ${
              i < chapterNumber
                ? "bg-white"
                : i === chapterNumber - 1
                ? "bg-white/50"
                : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </header>
  );
}
