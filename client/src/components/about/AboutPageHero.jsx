import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

import Button from '../common/Button';
import FallbackImage from '../common/FallbackImage';
import { getContent } from '../../data/content';

// Banner copy, highlights and photo come from src/data/siteContent.json
// (key "about.hero").
const hero = getContent('about.hero', {});
const highlights = hero.highlights ?? [];

export default function AboutPageHero() {
  return (
    <section className="relative isolate w-full overflow-hidden">
      <FallbackImage
        src={hero.image}
        fallbackSrc={hero.imageFallback}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center motion-safe:animate-hero-image"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/98 via-primary/80 to-primary/50" />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center px-5 py-16 sm:px-8 lg:px-10 lg:py-22 lg:flex-row lg:items-end lg:justify-between">
        <div className="mb-0 max-w-2xl lg:mb-0 lg:mr-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-peach">
            {hero.eyebrow}
          </p>

          <h1 className="mt-5 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-[56px]">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/88 sm:text-base sm:leading-8">
            {hero.description}
          </p>

          <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-2 text-xs font-medium text-white/90 sm:text-[13px]"
              >
                <Sparkles
                  size={15}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="text-peach"
                />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={hero.primaryButtonHref}>
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[200px] gap-5 rounded-full text-[12px] font-semibold uppercase tracking-[0.18em]"
              >
                {hero.primaryButtonLabel}
                <ArrowRight size={18} strokeWidth={1.7} aria-hidden="true" />
              </Button>
            </Link>

            <Link to={hero.secondaryButtonHref}>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[200px] rounded-full border-white/40 bg-white/10 text-[12px] font-semibold uppercase tracking-[0.18em] text-white hover:border-white hover:bg-white/20"
              >
                {hero.secondaryButtonLabel}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 flex shrink-0 items-center gap-3 rounded-3xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm sm:mt-0 sm:self-end lg:mt-0">
          <span className="text-sm font-medium text-white/90">{hero.noteLeft}</span>
          <span className="text-white/40" aria-hidden="true">·</span>
          <span className="text-sm font-medium text-white/90">{hero.noteRight}</span>
        </div>
      </div>
    </section>
  );
}
