import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import RecentOrders from '../../components/admin/RecentOrders';
import { fetchAdminUsers } from '../../slices/adminSlice';
import { changeOrderStatus, fetchOrders } from '../../slices/orderSlice';

// Order management. GET /orders with an admin token returns the newest 100 orders
// for every customer; status changes use PATCH /orders/:orderId/status and are
// limited to the transitions the backend allows.
export default function AdminOrders() {
  const dispatch = useDispatch();

  const orders = useSelector((state) => state.orders);
  const { users } = useSelector((state) => state.admin);

  const [busyOrderId, setBusyOrderId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  // The order rows only carry a user id, so the customer list is used to show a
  // readable name.
  const userById = useMemo(
    () => new Map(users.map((user) => [String(user._id), user])),
    [users],
  );

  const handleStatusChange = async (orderId, orderStatus) => {
    setBusyOrderId(orderId);
    setNotice(null);

    try {
      await dispatch(changeOrderStatus({ orderId, orderStatus })).unwrap();
      await dispatch(fetchOrders()).unwrap();
      setNotice({ tone: 'success', text: `Order moved to ${orderStatus}.` });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Fulfilment"
        title="Order management"
        description="Newest orders across the storefront, with the status steps the API accepts. Paid orders must be refunded before they can be cancelled."
      />

      {notice && (
        <p
          role="status"
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      <RecentOrders
        orders={orders.items}
        loading={orders.loading && orders.items.length === 0}
        error={orders.error}
        userById={userById}
        onStatusChange={handleStatusChange}
        busyOrderId={busyOrderId}
        limit={100}
        showViewAll={false}
      />
    </div>
  );
}
