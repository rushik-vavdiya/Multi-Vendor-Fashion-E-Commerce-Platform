import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquareQuote } from 'lucide-react';

import ReviewForm from './ReviewForm';
import ReviewItem from '../review/ReviewItem';
import ReviewMediaGrid from '../review/ReviewMediaGrid';
import RatingSummary from '../common/RatingSummary';
import Button from '../common/Button';
import { fetchProductReviews } from '../../slices/reviewSlice';
import { fetchOrders } from '../../slices/orderSlice';
import { averageRating, ratingBreakdown } from '../../utils/reviews';

const PAGE_SIZE = 5;

// Review section for the product page. Data comes from the public endpoint
// GET /reviews/product/:productId, which returns only approved reviews (up to
// 100) — so the summary and the breakdown are computed from real rows, and the
// list reveals more in client-side steps because the API has no paging.
export default function ProductReviews({ productId, product }) {
  const dispatch = useDispatch();

  const reviews = useSelector((state) => state.reviews);
  const orders = useSelector((state) => state.orders);
  const token = useSelector((state) => state.auth.token);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!productId) return;

    dispatch(fetchProductReviews(productId));
  }, [dispatch, productId]);

  // Eligibility is checked against the customer's own orders: the API only accepts
  // a review when a delivered order contains the product.
  useEffect(() => {
    if (token) dispatch(fetchOrders());
  }, [dispatch, token]);

  const hasDeliveredOrder = useMemo(
    () =>
      orders.items.some(
        (order) =>
          order.orderStatus === 'delivered' &&
          (order.items ?? []).some((item) => String(item.productId) === String(productId)),
      ),
    [orders.items, productId],
  );

  const alreadyReviewed = useMemo(
    () => reviews.items.some((review) => String(review.productId) === String(productId)),
    [reviews.items, productId],
  );

  // The slice clears `items` when a new request starts and records which product
  // the rows belong to, so these are always this product's reviews.
  const items = useMemo(
    () => (reviews.itemsProductId === productId ? reviews.items : []),
    [reviews.itemsProductId, reviews.items, productId],
  );

  const isPending = Boolean(productId) && (reviews.loading || reviews.itemsProductId !== productId);
  const requestFailed = reviews.itemsProductId === productId && Boolean(reviews.error);

  const average = averageRating(items);
  const breakdown = useMemo(() => ratingBreakdown(items), [items]);

  const canReview = Boolean(token) && hasDeliveredOrder && !alreadyReviewed;

  const reason = alreadyReviewed
    ? 'You have already reviewed this product. The API allows one review per product and account.'
    : 'Reviews can only be written after a delivered order for this product.';

  // "12 approved reviews loaded (14 recorded on the product)" — only mentions the
  // product total when the two numbers actually differ.
  const countNote = `${items.length} approved ${
    items.length === 1 ? 'review' : 'reviews'
  } loaded${
    product?.reviewCount && product.reviewCount !== items.length
      ? ` (${product.reviewCount} recorded on the product)`
      : ''
  }`;

  return (
    <section id="reviews" className="mt-14 border-t border-border pt-12 sm:mt-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            Customer feedback
          </p>

          <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
            Reviews
          </h2>
        </div>

        {product?.reviewCount > 0 && (
          <p className="text-xs text-muted">
            {product.reviewCount} approved reviews recorded on this product.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col gap-4">
          <RatingSummary
            average={average}
            total={items.length}
            breakdown={breakdown}
            note={countNote}
            loading={isPending}
          />

          {requestFailed && (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
            >
              {reviews.error}
            </p>
          )}
        </div>

        <div className="min-w-0">
          {isPending ? (
            <div className="flex flex-col gap-4" aria-busy="true">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-24 animate-pulse rounded-2xl border border-border bg-white/60" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-10 text-center">
              <MessageSquareQuote
                size={26}
                strokeWidth={1.6}
                aria-hidden="true"
                className="mx-auto text-accent"
              />
              <p className="mt-3 text-sm font-medium text-primary">No reviews yet</p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">
                Nobody has reviewed this product publicly yet. Reviews appear here after an admin
                approves them.
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white px-5 sm:px-6">
                {items.slice(0, visibleCount).map((review) => (
                  <li key={review._id}>
                    <ReviewItem review={review}>
                      <ReviewMediaGrid media={review.media} />
                    </ReviewItem>
                  </li>
                ))}
              </ul>

              {visibleCount < items.length && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  >
                    Show {Math.min(PAGE_SIZE, items.length - visibleCount)} more reviews
                  </Button>
                </div>
              )}

              <p className="mt-3 text-[11px] leading-5 text-muted">
                The review endpoint returns up to 100 approved reviews at once, so these are revealed
                in steps on the page.
              </p>
            </>
          )}

          <div className="mt-6">
            <ReviewForm
              productId={productId}
              signedIn={Boolean(token)}
              canReview={canReview}
              reason={reason}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
