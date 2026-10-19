import { getContent } from '../../data/content';

// The intro copy comes from src/data/siteContent.json (key "about.intro").
const intro = getContent('about.intro', {});

// One-liner intro band that sits above the About page body sections.
export default function AboutPageIntro() {
  return (
    <div className="w-full border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-12 sm:px-8 lg:gap-10 lg:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
          {intro.eyebrow}
        </p>

        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl lg:text-5xl">
            {intro.title}
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            {intro.description}
          </p>
        </div>
      </div>
    </div>
  );
}
