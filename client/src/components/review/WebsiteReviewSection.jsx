import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { PenLine } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import Button from '../common/Button';
import WebsiteReviewCard from './WebsiteReviewCard';
import WebsiteReviewDialog from './WebsiteReviewDialog';
import { getContent } from '../../data/content';

import 'swiper/css';
import 'swiper/css/pagination';

// The eyebrow, heading, the sentence under it and the button label come from
// src/data/siteContent.json (key "home.reviews").
const copy = getContent('home.reviews', {});

// Visitors who ask the OS for less motion get a still carousel they can drag;
// everyone else sees it advance on its own, one review at a time.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const AUTOPLAY = prefersReducedMotion
  ? false
  : {
      delay: 3200,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      waitForTransition: true,
    };

// Public website reviews: the eyebrow, heading and subtitle sit on the left with
// the "Write a review" button in the top-right corner, and the approved reviews
// slide underneath — one card at a time, on a loop. The button opens the review
// form in a popup; it is the only way to write a review from this page.
export default function WebsiteReviewSection() {
  const websiteReviews = useSelector((state) => state.websiteReviews);

  const triggerRef = useRef(null);
  const [formOpen, setFormOpen] = useState(false);

  const { items, loading, error } = websiteReviews;
  const isEmpty = !loading && items.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {copy.eyebrow}
          </p>

          <h2
            id="store-reviews-heading"
            className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl lg:text-[42px]"
          >
            {copy.heading}
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {copy.description}
          </p>
        </div>

        {/* Top-right on desktop, under the copy on phones. */}
        <div className="shrink-0">
          <Button
            ref={triggerRef}
            variant="outline"
            size="lg"
            onClick={() => setFormOpen(true)}
          >
            <PenLine size={16} strokeWidth={1.8} aria-hidden="true" />
            {copy.buttonLabel}
          </Button>
        </div>
      </div>

      {loading && items.length === 0 && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((card) => (
            <li
              key={card}
              className="h-40 animate-pulse rounded-2xl border border-border bg-white/70"
            />
          ))}
        </ul>
      )}

      {error && items.length === 0 && (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {isEmpty && !error && (
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <p className="font-serif text-lg text-primary">{copy.emptyTitle}</p>
          <p className="mt-2 text-sm text-muted">{copy.emptyText}</p>
        </div>
      )}

      {items.length > 0 && (
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          slidesPerGroup={1}
          spaceBetween={20}
          speed={650}
          loop={items.length > 3}
          autoplay={AUTOPLAY}
          pagination={{ clickable: true }}
          a11y={{ enabled: true, containerRoleDescriptionMessage: 'Reviews carousel' }}
          className="store-reviews-swiper w-full pb-10"
          breakpoints={{
            640: { slidesPerView: 2, slidesPerGroup: 1 },
            1024: { slidesPerView: 3, slidesPerGroup: 1 },
          }}
        >
          {items.map((review) => (
            <SwiperSlide key={review._id} className="flex">
              <WebsiteReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <WebsiteReviewDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        triggerRef={triggerRef}
      />
    </div>
  );
}
