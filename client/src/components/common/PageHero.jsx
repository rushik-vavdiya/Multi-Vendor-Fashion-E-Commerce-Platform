import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import FallbackImage from './FallbackImage';

// Simple page heading band shared by the FAQ, Category, Product and Contact
// pages. `breadcrumb` is an array of { label, href } — the last entry is the
// current page. `image`/`imageSrc` turns it into a banner.
export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb = [],
  image,
  imageFallback,
  children,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center';
  const hasImage = Boolean(image);

  return (
    <section
      className={[
        'relative isolate w-full overflow-hidden border-b border-border',
        hasImage ? 'text-white' : 'bg-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hasImage && (
        <>
          <FallbackImage
            src={image}
            fallbackSrc={imageFallback}
            alt=""
            loading="lazy"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/92 via-primary/78 to-primary/40" />
        </>
      )}

      <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className={isCentered ? 'mx-auto max-w-3xl text-center' : ''}>
          {breadcrumb.length > 0 && (
            <nav aria-label="Breadcrumb" className="text-xs">
              <ol
                className={`flex flex-wrap items-center gap-1.5 ${
                  hasImage ? 'text-white/70' : 'text-muted'
                } ${isCentered ? 'justify-center' : ''}`}
              >
                {breadcrumb.map((crumb, index) => (
                  <li
                    key={crumb.href ?? crumb.label}
                    className="flex items-center gap-1.5"
                  >
                    {index > 0 && <ChevronRight size={12} aria-hidden="true" />}

                    {crumb.href ? (
                      <Link
                        to={crumb.href}
                        className={`transition-colors ${
                          hasImage ? 'hover:text-white' : 'hover:text-accent'
                        }`}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current="page"
                        className={
                          hasImage ? 'font-medium text-white' : 'font-medium text-primary'
                        }
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {eyebrow && (
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.32em] ${
                hasImage ? 'text-peach' : 'text-accent'
              } ${breadcrumb.length > 0 ? 'mt-5' : ''}`}
            >
              {eyebrow}
            </p>
          )}

          <h1
            className={`font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-[44px] ${
              hasImage ? 'text-white' : 'text-primary'
            } ${eyebrow ? 'mt-3' : breadcrumb.length > 0 ? 'mt-5' : ''}`}
          >
            {title}
          </h1>

          {description && (
            <p
              className={`max-w-2xl text-sm leading-7 sm:text-base ${
                hasImage ? 'text-white/85' : 'text-muted'
              } ${isCentered ? 'mx-auto' : ''} mt-4`}
            >
              {description}
            </p>
          )}

          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}
