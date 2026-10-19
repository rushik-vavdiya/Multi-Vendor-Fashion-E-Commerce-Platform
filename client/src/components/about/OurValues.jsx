import { getContent, listContent } from '../../data/content';
import { contentIcon } from '../../utils/contentIcons';

// The heading and the four promises come from src/data/siteContent.json
// (key "about.values").
const valuesInfo = getContent('about.values', {});
const values = listContent('about.values.items');

// "Why choose us" grid.
export default function OurValues() {
  return (
    <section className="w-full bg-background py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {valuesInfo.eyebrow}
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-primary sm:text-4xl">
            {valuesInfo.title}
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            {valuesInfo.description}
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {values.map(({ id, title, description, icon }) => {
            const Icon = contentIcon(icon);

            return (
              <li
                key={id}
                className="flex h-full flex-col gap-4 rounded-3xl border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-[0_18px_50px_rgba(122,46,31,0.12)]"
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-full border border-peach bg-peach/40 text-primary"
                >
                  <Icon size={23} strokeWidth={1.7} />
                </span>

                <h3 className="text-base font-medium text-primary">{title}</h3>

                <p className="text-sm leading-6 text-muted">{description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
