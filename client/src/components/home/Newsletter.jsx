import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';

import FallbackImage from '../common/FallbackImage';
import { getContent } from '../../data/content';
import { clearNewsletterStatus, subscribeToNewsletter } from '../../slices/newsletterSlice';

// The deep maroon panel from the design: the heading and the sentence on the
// left, the email pill and the Subscribe button on the right. Every string comes
// from src/data/siteContent.json (key "home.newsletter") and the colours from the
// "--newsletter-*" block in src/index.css. The band carries its own full-bleed
// photo ("image" in the same content key) under a maroon veil that is heaviest
// behind the copy, so the picture reads on the right and the text stays crisp.
const newsletter = getContent('home.newsletter', {});

export default function Newsletter() {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.newsletter);
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearNewsletterStatus());

    const result = await dispatch(subscribeToNewsletter(email.trim()));
    if (subscribeToNewsletter.fulfilled.match(result)) setEmail('');
  };

  return (
    <section className="relative isolate w-full overflow-hidden bg-[var(--newsletter-panel)]">
      <FallbackImage
        src={newsletter.image}
        fallbackSrc={newsletter.imageFallback}
        alt=""
        loading="lazy"
        style={{ objectPosition: newsletter.imagePosition ?? '50% 50%' }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      {/* Veil: heavy maroon behind the copy on the left, thinning to a light wash
          on the right so the photo stays visible. On phones it falls top-down. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(110,53,52,0.9)_0%,rgba(110,53,52,0.72)_55%,rgba(89,42,43,0.86)_100%)] lg:bg-[linear-gradient(90deg,rgba(110,53,52,0.92)_0%,rgba(110,53,52,0.8)_38%,rgba(110,53,52,0.38)_70%,rgba(89,42,43,0.5)_100%)]"
      />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10 lg:py-12">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--newsletter-muted)]">
            {newsletter.eyebrow}
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--newsletter-ink)] sm:text-4xl">
            {newsletter.titleLine1}{' '}
            <span className="block sm:inline">{newsletter.titleHighlight}</span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--newsletter-muted)] sm:text-[15px]">
            {newsletter.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={loading}
          className="flex w-full max-w-xl shrink-0 flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>

          <input
            id="newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            disabled={loading}
            onChange={(event) => {
              setEmail(event.target.value);
              dispatch(clearNewsletterStatus());
            }}
            placeholder={newsletter.placeholder}
            className="h-12 min-w-0 flex-1 rounded-full border border-transparent bg-white px-5 text-sm text-primary outline-none transition placeholder:text-muted focus:border-[var(--newsletter-cta-text)] focus:ring-4 focus:ring-white/25 sm:h-[50px]"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-[var(--newsletter-cta-bg)] px-7 text-sm font-semibold text-[var(--newsletter-cta-text)] shadow-[0_10px_26px_rgba(58,23,24,0.28)] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--newsletter-panel)] disabled:opacity-60 sm:h-[50px]"
          >
            {loading ? 'Subscribing…' : newsletter.buttonLabel}
            <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </form>
      </div>

      {message && (
        <p role="status" className="mx-auto max-w-[1400px] px-5 pb-6 text-sm text-[var(--newsletter-ink)] sm:px-8 lg:px-10">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mx-auto max-w-[1400px] px-5 pb-6 text-sm text-[#FFD9D3] sm:px-8 lg:px-10">
          {error}
        </p>
      )}
    </section>
  );
}
