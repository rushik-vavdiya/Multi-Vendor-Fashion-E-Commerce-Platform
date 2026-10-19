import { getContent } from '../../data/content';

// The paragraphs and the stat numbers come from src/data/siteContent.json
// (key "about.story").
const story = getContent('about.story', {});
const paragraphs = story.paragraphs ?? [];
const stats = story.stats ?? [];

export default function BrandStory() {
  return (
    <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16 lg:px-10">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {story.eyebrow}
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-primary sm:text-4xl">
            {story.title}
          </h2>

          <div className="mt-6 flex flex-col gap-5 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <p className="mt-7 font-serif text-lg italic text-primary">
            {story.signature}
          </p>
        </div>

        <div className="min-w-0">
          <dl className="grid gap-4 rounded-3xl border border-border bg-background p-6 sm:grid-cols-3 lg:grid-cols-1 lg:p-8">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-col gap-1 border-border sm:border-l sm:pl-5 sm:first:border-l-0 sm:first:pl-0 lg:border-l-0 lg:border-b lg:pb-5 lg:pl-0 lg:last:border-b-0 lg:last:pb-0"
              >
                <dt className="order-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  {stat.label}
                </dt>

                <dd className="order-1 font-serif text-3xl font-medium text-primary">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
