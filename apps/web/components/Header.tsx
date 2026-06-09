import Link from "next/link";

export default function Header({ subtitle }: { subtitle?: string }) {
  return (
    <header className="border-b border-gold-400/25 bg-parchment-50/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 leading-none">
          {/* Arabic on top, English below — stacked compactly so the sticky bar stays slim */}
          <div className="flex flex-col gap-0.5">
            <span className="font-arabic text-sm md:text-base text-ink-300" dir="rtl">
              مجلس القصيد الإماراتي - متعدد الوكلاء
            </span>
            <span className="font-display text-xs md:text-sm text-crimson-500">
              The Emirati Multi-Agentic Poetic Majlis
            </span>
          </div>
          {subtitle && (
            <span className="text-xs uppercase tracking-[0.2em] text-gold-600 ml-2 hidden md:inline border-l border-gold-400/40 pl-3 self-stretch flex items-center">
              {subtitle}
            </span>
          )}
        </Link>
        <nav className="flex items-center gap-5 text-sm text-ink-100">
          <Link href="/poet" className="hover:text-gold-600 transition-colors">For Poets</Link>
          <Link href="/enthusiast" className="hover:text-gold-600 transition-colors">Library</Link>
          <Link href="/dictionary" className="hover:text-gold-600 transition-colors">Dictionary</Link>
        </nav>
      </div>
    </header>
  );
}
