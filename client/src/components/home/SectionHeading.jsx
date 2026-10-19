import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Shared heading block for the homepage sections. The action link is the
// underlined accent link the section references use ("Browse all →").
export default function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center';

  return (
    <div
      className={[
        'flex flex-col gap-5',
        isCentered
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-end sm:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-3 font-serif text-3xl font-medium leading-[1.08] tracking-tight text-primary sm:text-4xl lg:text-[42px]">
          {title}
        </h2>

        {description && (
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {description}
          </p>
        )}
      </div>

      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="group inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-accent underline decoration-accent/60 decoration-1 underline-offset-[6px] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {actionLabel}
          <ArrowRight
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}
