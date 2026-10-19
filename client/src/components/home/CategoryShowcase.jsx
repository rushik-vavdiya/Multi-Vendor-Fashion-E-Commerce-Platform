import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';

import FallbackImage from '../common/FallbackImage';
import { getContent } from '../../data/content';

import 'swiper/css';

// The photo on each circle is the department's own image from the database
// (Category.image), uploaded in admin -> Categories. The file below is only the
// placeholder a department without an image falls back to.
const imageFallback = getContent('home.categories.imageFallback', '');
// Which departments to show, and in what order. Anything not named here still
// shows, after the ones that are, so a new department is never hidden by accident.
const order = getContent('home.categories.order', []);
// Optional intro above the circles; it simply does not render when the copy is
// absent from siteContent.json.
const heading = getContent('home.categories.heading', {});

const MAX_CIRCLES = 8;

// Circle sizes stay in one place so the skeletons and the real tiles can never
// drift apart. Slides are sized in fractions of the row, so two and a half
// circles show on a phone (the half is the hint that the row keeps going) and
// four fill the row exactly from the large breakpoint up.
const SLIDE_LAYOUT = {
  base: { slidesPerView: 2.6, spaceBetween: 16 },
  breakpoints: {
    640: { slidesPerView: 3.6, spaceBetween: 22 },
    1024: { slidesPerView: 4, spaceBetween: 26 },
  },
};

// The uploaded category photo is usually a full-length product shot: cropping it
// into a circle cut the model in half, so the circle is filled with a soft, out
// of focus copy of the same photo and the whole picture sits on top of it. The
// circle is never empty and the model is never cut.
const CIRCLE_CLASS =
  'block size-28 rounded-full bg-gradient-to-br from-[#F8E9DE] to-[#F0D9C8] p-[3px] ring-1 ring-accent/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-accent/50 group-hover:shadow-[0_16px_32px_-16px_rgba(122,46,31,0.55)] group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-background sm:size-32 lg:size-36';

// "Shop by category": one circle per top-level department, with its name
// underneath. The departments come from the categories slice, which loads them
// from the real backend API. One slider serves every screen — a handful of
// departments sit centred, more than fit are dragged or swiped through.
export default function CategoryShowcase() {
  const { items = [], loading } = useSelector((state) => state.categories);

  const categories = items
    .filter((category) => category.status === 'active')
    .sort((first, second) => {
      const firstAt = order.indexOf(first.slug);
      const secondAt = order.indexOf(second.slug);

      return (firstAt === -1 ? order.length : firstAt) - (secondAt === -1 ? order.length : secondAt);
    })
    .slice(0, MAX_CIRCLES);

  const showSkeleton = loading && categories.length === 0;

  if (!showSkeleton && categories.length === 0) return null;

  return (
    <section className="w-full bg-background py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        {(heading.title || heading.eyebrow) && (
          <div className="mb-8 text-center sm:mb-10">
            {heading.eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
                {heading.eyebrow}
              </p>
            )}

            {heading.title && (
              <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
                {heading.title}
              </h2>
            )}

            {heading.description && (
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                {heading.description}
              </p>
            )}
          </div>
        )}

        {showSkeleton ? (
          <ul className="mx-auto flex max-w-[820px] justify-center gap-5" aria-busy="true">
            {[0, 1, 2, 3].map((card) => (
              <li key={card} className="flex flex-col items-center">
                <span className="block size-28 animate-pulse rounded-full bg-peach/40 p-[3px] sm:size-32 lg:size-36">
                  <span className="block h-full w-full rounded-full bg-peach/60" />
                </span>
                <span className="mt-3.5 h-3 w-16 animate-pulse rounded-full bg-peach/60" />
              </li>
            ))}
          </ul>
        ) : (
          <Swiper
            slidesPerView={SLIDE_LAYOUT.base.slidesPerView}
            spaceBetween={SLIDE_LAYOUT.base.spaceBetween}
            grabCursor
            watchOverflow
            a11y={{ enabled: true, containerRoleDescriptionMessage: 'Shop by category' }}
            className="category-swiper mx-auto w-full max-w-[820px]"
            breakpoints={SLIDE_LAYOUT.breakpoints}
          >
            {categories.map((category) => {
              const cover = category.image || imageFallback;

              return (
              <SwiperSlide key={category._id ?? category.slug} className="!h-auto">
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="group mx-auto flex w-full flex-col items-center text-center focus-visible:outline-none"
                >
                  <span className={CIRCLE_CLASS}>
                    <span className="relative block h-full w-full overflow-hidden rounded-full bg-peach/60">
                      {category.image && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 scale-125 bg-cover bg-center opacity-55 blur-[6px]"
                          style={{ backgroundImage: `url("${category.image}")` }}
                        />
                      )}

                      <FallbackImage
                        src={cover}
                        fallbackSrc={imageFallback}
                        alt=""
                        loading="lazy"
                        className="relative h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    </span>
                  </span>

                  <span className="mt-3.5 line-clamp-2 text-[13px] font-medium leading-5 tracking-tight text-primary transition-colors duration-200 group-hover:text-accent sm:text-sm">
                    {category.name}
                  </span>
                </Link>
              </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
}
