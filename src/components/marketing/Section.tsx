interface SectionProps {
  id?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  children: React.ReactNode;
  bordered?: boolean;
}

export function Section({
  id,
  title,
  highlight,
  subtitle,
  children,
  bordered,
}: SectionProps) {
  return (
    <section
      id={id}
      className={
        bordered
          ? "border-y border-surface-border bg-surface-elevated/30 py-16 sm:py-20"
          : "py-16 sm:py-20"
      }
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}{" "}
            {highlight ? <span className="gradient-text">{highlight}</span> : null}
          </h2>
          {subtitle ? <p className="mt-4 text-gray-400 leading-relaxed">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function TopicList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-emerald-300">{title}</h3>
      <ul className="space-y-2 text-sm text-gray-400">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-profit shrink-0">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BulletCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card border-emerald-500/10 p-5 text-sm text-gray-400 leading-relaxed">
      {children}
    </div>
  );
}
