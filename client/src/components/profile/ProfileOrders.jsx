import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import StatusPill from '../dashboard/StatusPill';
import PageState from '../common/PageState';
import { cancelOrder, fetchOrders } from '../../slices/orderSlice';
import { formatDate, formatPrice } from '../../utils/format';
import { canCancelOrder } from '../../utils/orders';
import { useToast } from '../notifications';

// "My orders": GET /orders with a customer token returns this customer's own
// orders only. Cancellation is offered only for the orders the backend still
// allows it on (pending/confirmed and unpaid/failed).
export default function ProfileOrders() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.orders);

  const [busyId, setBusyId] = useState(null);

  const toast = useToast();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleCancel = async (orderId) => {
    setBusyId(orderId);

    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      await dispatch(fetchOrders());
      toast.success('Order cancelled and stock returned.');
    } catch (message) {
      toast.error(String(message));
    } finally {
      setBusyId(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-3xl border border-border bg-white/60" />
        ))}
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <PageState variant="error" title="We could not load your orders" description={error} />
    );
  }

  if (items.length === 0) {
    return (
      <PageState
        title="No orders yet"
        description="Once you place an order it appears here with its live status from the backend."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {items.map((order) => (
          <li key={order._id} className="rounded-3xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-primary">
                  Order #{String(order.orderNumber ?? '').slice(0, 8)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Placed {formatDate(order.createdAt)} · {order.items?.length ?? 0}{' '}
                  {order.items?.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill value={order.orderStatus} />
                <StatusPill value={order.paymentStatus} />
              </div>
            </div>

            <ul className="mt-4 divide-y divide-border border-y border-border">
              {(order.items ?? []).map((item) => (
                <li
                  key={item._id ?? `${item.productId}-${item.variantName}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="min-w-0 text-xs text-muted">
                    <span className="block truncate text-sm text-primary">
                      {item.productName}
                      {item.variantName ? ` · ${item.variantName}` : ''}
                    </span>
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </span>

                  <span className="shrink-0 text-sm font-medium text-primary">
                    {formatPrice(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Total{' '}
                <span className="font-semibold text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
                {order.couponCode ? ` · coupon ${order.couponCode}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/products/${order.items?.[0]?.productId ?? ''}`}
                  className="text-xs font-semibold text-accent transition-colors hover:text-primary"
                >
                  View first item
                </Link>

                {canCancelOrder(order) ? (
                  <button
                    type="button"
                    disabled={busyId === order._id}
                    onClick={() => handleCancel(order._id)}
                    className="inline-flex min-h-9 items-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
                  >
                    {busyId === order._id ? 'Cancelling…' : 'Cancel order'}
                  </button>
                ) : (
                  <span className="text-[11px] text-muted">
                    This order can no longer be cancelled from here.
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
