import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { pageWindow } from '../../utils/pagination';

// Paging under a product grid: the current page with its neighbours, plus the
// first and last, so a long catalog reads « 1 … 4 5 6 … 12 » rather than a wall of
// numbers. Pages are links, which keeps a filtered URL shareable, and the arrows
// are the same links with a disabled look at either end, so the row never
// shifts when one of them is unavailable.
const CIRCLE =
  'flex size-9 shrink-0 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

export default function ProductPagination({
  page = 1,
  pages = 1,
  total = 0,
  limit = 0,
  hrefForPage,
  className = '',
}) {
  if (pages <= 1) return null;

  const first = (page - 1) * limit + 1;
  const last = limit ? Math.min(page * limit, total || page * limit) : total;
  const rows = pageWindow(page, pages);

  return (
    <nav
      aria-label="Product pages"
      className={['flex flex-col items-center gap-4 sm:flex-row sm:justify-between', className]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-xs text-muted sm:text-sm" aria-live="polite">
        {total > 0 && limit > 0
          ? `Showing ${first}–${last} of ${total}`
          : `Page ${page} of ${pages}`}
      </p>

      <div className="flex items-center gap-1.5 rounded-full border border-border bg-white p-1.5 shadow-[0_14px_36px_-24px_rgba(122,46,31,0.55)]">
        {page > 1 ? (
          <Link
            to={hrefForPage(page - 1)}
            aria-label="Previous page"
            rel="prev"
            className={`${CIRCLE} text-primary hover:bg-peach/50`}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        ) : (
          <span aria-hidden="true" className={`${CIRCLE} cursor-not-allowed text-muted opacity-45`}>
            <ChevronLeft size={16} strokeWidth={2} />
          </span>
        )}

        {rows.map((row, index) =>
          row === 'gap' ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-sm text-muted"
            >
              …
            </span>
          ) : (
            <Link
              key={row}
              to={hrefForPage(row)}
              aria-label={`Page ${row}`}
              aria-current={row === page ? 'page' : undefined}
              className={[
                CIRCLE,
                row === page
                  ? 'bg-primary font-semibold text-white shadow-[0_10px_20px_-10px_rgba(122,46,31,0.9)]'
                  : 'text-primary hover:bg-peach/50',
              ].join(' ')}
            >
              {row}
            </Link>
          ),
        )}

        {page < pages ? (
          <Link
            to={hrefForPage(page + 1)}
            aria-label="Next page"
            rel="next"
            className={`${CIRCLE} text-primary hover:bg-peach/50`}
          >
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        ) : (
          <span aria-hidden="true" className={`${CIRCLE} cursor-not-allowed text-muted opacity-45`}>
            <ChevronRight size={16} strokeWidth={2} />
          </span>
        )}
      </div>
    </nav>
  );
}
