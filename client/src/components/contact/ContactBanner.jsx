import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';

import Button from '../common/Button';
import FallbackImage from '../common/FallbackImage';
import { getContent } from '../../data/content';

// The heading, the buttons and the photo come from src/data/siteContent.json
// (key "contact.banner"). The photo falls back to the site hero if the contact
// banner file is missing.
const banner = getContent('contact.banner', {});

// Full-width banner image at the very top of the contact page. The photo sits
// behind a dark gradient so the heading stays readable on every screen size.
export default function ContactBanner() {
  return (
    <section className="relative isolate w-full overflow-hidden">
      <FallbackImage
        src={banner.image}
        fallbackSrc={banner.imageFallback}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center motion-safe:animate-hero-image"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/95 via-primary/75 to-primary/40" />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center gap-7 px-5 py-20 text-center sm:px-8 sm:py-24 lg:py-28 lg:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-peach">
          {banner.eyebrow}
        </p>

        <h1 className="max-w-4xl font-serif text-4xl font-medium leading-tight tracking-tight text-white sm:text-5xl lg:text-[56px]">
          {banner.title}
        </h1>

        <p className="max-w-2xl text-base leading-7 text-white/88 sm:text-lg">
          {banner.description}
        </p>

        <div className="flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-none sm:w-auto sm:flex-row">
          <Link to={banner.primaryButtonHref} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full gap-4 rounded-full text-[12px] font-semibold uppercase tracking-[0.18em]"
            >
              {banner.primaryButtonLabel}
              <ArrowRight size={18} strokeWidth={1.7} aria-hidden="true" />
            </Button>
          </Link>

          <Link to={banner.secondaryButtonHref} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 rounded-full border-white/40 bg-white/10 px-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-white hover:border-white hover:bg-white/20"
            >
              <MessageCircle size={17} strokeWidth={1.7} aria-hidden="true" />
              {banner.secondaryButtonLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
