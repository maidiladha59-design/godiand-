type PageHeroProps = {
  label: string;
  title: string;
  description: string;
  meta?: string;
};

export function PageHero({ label, title, description, meta }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink-900 bg-brand-100">
      <div
        aria-hidden="true"
        className="gd-dots absolute inset-0 opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sun-300/60"
      />
      <div className="gd-container relative py-14 sm:py-20">
        <span className="gd-label">{label}</span>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.2rem,6vw,3.8rem)] font-extrabold leading-[1.05] tracking-tight">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-700">
          {description}
        </p>
        {meta ? (
          <p className="mt-5 text-sm font-bold text-ink-600">{meta}</p>
        ) : null}
      </div>
    </section>
  );
}
