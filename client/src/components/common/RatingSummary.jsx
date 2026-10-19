import StarRating from './StarRating';

// The rating panel next to a list of reviews: big average, stars, how many
// reviews were counted, and the 5-to-1 star breakdown bars. Rendering it from
// real rows (never invented totals) is what keeps the numbers honest.
//
//   <RatingSummary
//     average={4.5}
//     total={12}
//     breakdown={[{ value: 5, count: 8 }, ...]}
//     note="12 approved reviews loaded"
//   />
export default function RatingSummary({
  average = 0,
  total = 0,
  breakdown = [],
  note = null,
  loading = false,
  className = '',
}) {
  if (loading) {
    return (
      <div className={`rounded-2xl border border-border bg-white p-5 sm:p-6 ${className}`} aria-busy="true">
        <div className="h-10 w-24 animate-pulse rounded-full bg-peach/50" />
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-3 w-full animate-pulse rounded-full bg-peach/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-white p-5 sm:p-6 ${className}`}>
      <p className="flex items-baseline gap-3">
        <span className="font-serif text-4xl font-medium leading-none text-primary">
          {total > 0 ? average.toFixed(1) : '—'}
        </span>

        <StarRating value={average} size={16} />
      </p>

      {note && <p className="mt-2 text-xs text-muted">{note}</p>}

      {total > 0 && (
        <ul className="mt-5 flex flex-col gap-2">
          {breakdown.map(({ value, count }) => {
            const percent = total > 0 ? (count / total) * 100 : 0;

            return (
              <li key={value} className="flex items-center gap-3 text-xs text-muted">
                <span className="w-8 shrink-0">{value} ★</span>

                <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-peach/30">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </span>

                <span className="w-6 shrink-0 text-right">{count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
