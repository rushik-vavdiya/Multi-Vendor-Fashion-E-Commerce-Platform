import { Link } from 'react-router-dom';

import OrderChart from './OrderChart';
import StatusPill from '../dashboard/StatusPill';
import { formatDate, formatPrice } from '../../utils/format';
import { nextOrderStatuses } from '../../utils/orders';

// Newest orders from GET /orders (the admin token returns every customer's
// orders). `userById` is optional: the order rows only carry a user id, so the
// page can pass the customer list to show a name.
export default function RecentOrders({
  orders = [],
  loading = false,
  error = null,
  userById = null,
  onStatusChange,
  busyOrderId = null,
  limit = 8,
  showViewAll = true,
}) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-white p-5" aria-busy="true">
        <div className="h-5 w-40 animate-pulse rounded-full bg-peach/50" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-2xl bg-peach/30" />
          ))}
        </div>
      </div>
    );
  }

  const rows = orders.slice(0, limit);

  const customerLabel = (order) => {
    const match = userById?.get?.(String(order.userId));
    if (match) {
      const name = `${match.firstName ?? ''} ${match.lastName ?? ''}`.trim();
      if (name) return name;
    }

    return `Account ${String(order.userId ?? '').slice(-6) || 'unknown'}`;
  };

  return (
    <section className="rounded-3xl border border-border bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-medium text-primary">Recent orders</h2>
          <p className="mt-0.5 text-xs text-muted">
            GET /orders with an admin token returns the latest 100 orders.
          </p>
        </div>

        {showViewAll && (
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-accent transition-colors hover:text-primary"
          >
            View all orders
          </Link>
        )}
      </header>

      {error && (
        <p role="alert" className="px-5 py-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && rows.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted">
          No orders yet. Orders appear here as soon as a customer checks out.
        </p>
      )}

      {!error && rows.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <OrderChart orders={orders.items} loading={loading} />
          </div>
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    <th scope="col" className="px-5 py-3 font-semibold">Order</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Placed</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Items</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Total</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Payment</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Change status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {rows.map((order) => {
                    const options = nextOrderStatuses(order.orderStatus);
                    const busy = busyOrderId === order._id;

                    return (
                      <tr key={order._id} className="align-middle">
                        <td className="px-5 py-4 font-medium text-primary">
                          #{String(order.orderNumber ?? '').slice(0, 8)}
                        </td>
                        <td className="px-5 py-4 text-muted">{customerLabel(order)}</td>
                        <td className="px-5 py-4 text-muted">{formatDate(order.createdAt)}</td>
                        <td className="px-5 py-4 text-muted">{order.items?.length ?? 0}</td>
                        <td className="px-5 py-4 font-medium text-primary">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill value={order.paymentStatus} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill value={order.orderStatus} />
                        </td>
                        <td className="px-5 py-4">
                          {onStatusChange && options.length > 0 ? (
                            <select
                              aria-label={`Change status for order ${String(order.orderNumber ?? '').slice(0, 8)}`}
                              value=""
                              disabled={busy}
                              onChange={(event) =>
                                event.target.value &&
                                onStatusChange(order._id, event.target.value)
                              }
                              className="min-h-9 w-full rounded-xl border border-border bg-white px-3 text-xs text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 disabled:opacity-50"
                            >
                              <option value="">
                                {busy ? 'Saving…' : 'Set status…'}
                              </option>
                              {options.map((status) => (
                                <option key={status} value={status}>
                                  {status.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-muted">
                              {order.orderStatus === 'cancelled' || order.orderStatus === 'returned'
                                ? 'Final state'
                                : 'No further step'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
