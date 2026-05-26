export function Marquee() {
  const items = [
    "No Mineral Oils",
    "No Silicones",
    "Cold-Infused",
    "7-Day Slow Crafted",
    "Dosha-Aligned",
    "Vaidya-Led",
  ];
  return (
    <div className="border-y border-border bg-secondary/40 overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-content">
          {[...items, ...items].map((i, index) => (
            <span
              key={`${i}-${index}`}
              className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground whitespace-nowrap px-4 py-5"
            >
              <span className="text-accent">✦</span> {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
