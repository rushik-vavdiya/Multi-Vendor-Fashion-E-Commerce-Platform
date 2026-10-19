import { orderChartData } from '../../utils/orderChart';

// Small, dependency-free orders chart for the admin dashboard. Orders are grouped
// into monthly columns with a day-by-day bar inside each column, so a peak in
// sales shows up as a taller column instead of a spreadsheet row.
export default function OrderChart({ orders = [], loading = false }) {
  const data = orderChartData(orders);

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-white p-5" aria-busy="true">
        <div className="h-4 w-32 animate-pulse rounded-full bg-peach/40" />
        <div className="mt-3 grid gap-2">
          {Array.from({ length: 14 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-peach/25" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-white p-5 text-center text-sm text-muted">
        No orders yet. Orders appear here as soon as a customer checks out.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-white shadow-sm" aria-label="Orders chart">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-medium text-primary">Orders</h2>
          <p className="mt-0.5 text-xs text-muted">
            Orders per month. Each bar is how many orders arrived that day.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed="true"
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-primary hover:border-accent hover:text-accent"
          >
            By month
          </button>
        </div>
      </header>

      <div className="px-5 py-4">
        <div className="flex flex-col gap-3">
          {data.map((month) => (
            <div key={month.monthKey} className="flex gap-3">
              <div className="flex flex-col justify-between pb-1 pr-3 text-xs font-medium text-muted">
                <span>{month.monthLabel}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] opacity-70">
                  {month.orderCount} orders
                </span>
              </div>

              <div className="flex flex-1 items-end gap-1.5">
                {month.days.map((day) => (
                  <div
                    key={day.dayKey}
                    className={[
                      'w-4 rounded-t-md transition-all',
                      day.count > 0
                        ? 'bg-[#70291C]'
                        : 'bg-transparent',
                      day.count > 0 && day.count >= month.maxCount
                        ? 'ring-2 ring-white'
                        : '',
                    ].join(' ')}
                    style={{ height: day.count > 0 ? `${day.heightPct}%` : '1px' }}
                    title={`${day.date}: ${day.count} order${day.count > 1 ? 's' : ''}`}
                  />
                ))}
              </div>

              <div className="w-24 shrink-0">
                <div className="flex items-end justify-end gap-1.5">
                  {month.days.map((day) => (
                    <div
                      key={day.dayKey}
                      className={[
                        'w-4 rounded-t-md opacity-70',
                        day.count > 0
                          ? 'bg-[#FAD6C1]'
                          : 'bg-transparent',
                      ].join(' ')}
                      style={{ height: day.count > 0 ? `${day.heightPct}%` : '1px' }}
                      title={`${day.date}: ${day.count} order${day.count > 1 ? 's' : ''}`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-muted">{month.dayLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
