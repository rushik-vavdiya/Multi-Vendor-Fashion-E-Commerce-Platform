import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import Button from '../common/Button';
import FallbackImage from '../common/FallbackImage';
import { getContent, listContent } from '../../data/content';

// The heading and the two closing editorials come from
// src/data/siteContent.json (key "about.studioStrip").
const strip = getContent('about.studioStrip', {});
const editorials = listContent('about.studioStrip.editorials');

export default function AboutStudioStrip() {
  return (
    <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {strip.eyebrow}
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-primary sm:text-4xl">
            {strip.title}
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            {strip.description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {editorials.map(
            ({
              id,
              eyebrow,
              title,
              description,
              image,
              imageFallback,
              actionLabel,
              actionHref,
              reverse,
            }) => (
              <article
                key={id}
                className="group relative overflow-hidden rounded-3xl border border-border bg-white transition-shadow duration-300 hover:shadow-[0_18px_50px_-12px_rgba(122,46,31,0.18)]"
              >
                <FallbackImage
                  src={image}
                  fallbackSrc={imageFallback}
                  alt=""
                  loading="lazy"
                  className={`h-[260px] w-full object-cover object-center lg:h-[300px] ${
                    reverse ? 'lg:order-2' : ''
                  }`}
                />

                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-t from-white via-transparent to-transparent opacity-80 ${
                    reverse ? 'lg:order-2' : ''
                  }`}
                />

                <div
                  className={`relative z-10 flex flex-col gap-4 p-6 sm:p-7 lg:p-8 ${
                    reverse ? 'lg:order-1' : ''
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
                    {eyebrow}
                  </span>

                  <h3 className="font-serif text-2xl font-medium leading-tight tracking-tight text-primary sm:text-3xl">
                    {title}
                  </h3>

                  <p className="text-sm leading-7 text-muted sm:text-base sm:leading-8">
                    {description}
                  </p>

                  <Link to={actionHref} className="mt-1 inline-flex">
                    <Button variant="primary" size="lg" className="gap-3 rounded-full">
                      {actionLabel}
                      <ArrowRight size={18} strokeWidth={1.7} aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}
