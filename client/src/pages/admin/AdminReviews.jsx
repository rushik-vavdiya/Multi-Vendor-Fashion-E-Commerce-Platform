import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AdminReviewQueue from '../../components/admin/AdminReviewQueue';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import {
  clearReviewError,
  fetchPendingReviews,
  reviewPendingItem,
} from '../../slices/reviewSlice';

// Review moderation. Reviews are created as pending by the customer flow and only
// appear on the storefront once this approval call succeeds.
export default function AdminReviews() {
  const dispatch = useDispatch();
  const reviews = useSelector((state) => state.reviews);

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(clearReviewError());
    dispatch(fetchPendingReviews());
  }, [dispatch]);

  const handleModerate = async (reviewId, status) => {
    setBusyId(reviewId);
    setNotice(null);

    try {
      await dispatch(reviewPendingItem({ reviewId, status })).unwrap();
      setNotice({
        tone: 'success',
        text: status === 'approved' ? 'Review approved and visible.' : 'Review rejected.',
      });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Trust"
        title="Review moderation"
        description={`${reviews.pendingItems.length} reviews waiting. A review can only be submitted by a customer with a delivered order for that product.`}
      />

      {notice && (
        <p
          role={notice.tone === 'success' ? 'status' : 'alert'}
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

      <AdminReviewQueue
        reviews={reviews.pendingItems}
        loading={reviews.loading && reviews.pendingItems.length === 0}
        error={reviews.pendingItems.length === 0 ? reviews.error : null}
        onModerate={handleModerate}
        busyId={busyId}
      />
    </div>
  );
}
