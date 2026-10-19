import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';

import { getContent } from '../../data/content';
import ProductCard from '../product/ProductCard';
import SectionHeading from './SectionHeading';
import { addToCart } from '../../slices/cartSlice';
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from '../../slices/wishlistSlice';
import { useToast } from '../notifications';

import 'swiper/css';

// Heading text comes from src/data/siteContent.json (key "home.newArrivals").
const heading = getContent('home.newArrivals.heading', {});

const ROW_SIZE = 6;

// One row that slides instead of wrapping: the whole band stays on a single line
// and the shopper drags (or swipes) for the rest. No autoplay — nothing moves on
// its own while someone is reading the page.
const SLIDE_LAYOUT = {
  slidesPerView: 1.2,
  spaceBetween: 16,
  breakpoints: {
    640: { slidesPerView: 2.2, spaceBetween: 20 },
    1024: { slidesPerView: 3, spaceBetween: 24 },
    1280: { slidesPerView: 4, spaceBetween: 24 },
  },
};

// "New Arrivals": the newest products in the catalog, first page of the products
// slice — which Home loads with sort=newest, so the rows really are the latest
// additions rather than a hand-picked list. The heart and the bag button use the
// same cart and wishlist slices as the shop page, so saving or adding here
// behaves exactly like it does there.
export default function NewArrivals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const { items = [], loading } = useSelector((state) => state.products);
  const cart = useSelector((state) => state.cart.cart);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const token = useSelector((state) => state.auth.token);

  const rows = items.slice(0, ROW_SIZE);

  // Wishlist state is only available to a signed-in customer.
  useEffect(() => {
    if (token && wishlist === null) dispatch(fetchWishlist());
  }, [dispatch, token, wishlist]);

  const isSaved = (productId) =>
    Boolean(
      wishlist?.products?.some(
        (item) => String(item?._id ?? item) === String(productId),
      ),
    );

  const isInCart = (productId) =>
    Boolean(
      cart?.products?.some(
        (item) =>
          String(item?.productId?._id ?? item?.productId) === String(productId),
      ),
    );

  // Signed-out shoppers are sent to sign in first, then come straight back.
  const requireSignIn = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  // The card passes the first size that is in stock, so a quick add still lands
  // in the bag with a real size attached.
  const handleAddToCart = (product, variantId = null) => {
    if (!token) return requireSignIn();

    const name = (product.variantCombinations ?? []).find(
      (combination) => String(combination._id) === String(variantId),
    )?.variantName;

    dispatch(addToCart({ productId: product._id, variantId, quantity: 1 }))
      .unwrap()
      .then(() =>
        toast.success(
          `Added “${product.name}”${name ? ` (${name})` : ''} to your bag.`,
        ),
      )
      .catch((message) => toast.error(String(message)));
  };

  const handleToggleWishlist = (product) => {
    if (!token) return requireSignIn();

    const saved = isSaved(product._id);

    dispatch(saved ? removeFromWishlist(product._id) : addToWishlist(product._id))
      .unwrap()
      .then(() =>
        toast.success(
          saved
            ? `Removed “${product.name}” from your wishlist.`
            : `Saved “${product.name}” to your wishlist.`,
        ),
      )
      .catch((message) => toast.error(String(message)));
  };

  const actionsFor = (product) => ({
    onAddToCart: handleAddToCart,
    onToggleWishlist: handleToggleWishlist,
    inWishlist: isSaved(product._id),
    inCart: isInCart(product._id),
  });

  if (!loading && rows.length === 0) return null;

  return (
    <section className="w-full bg-background py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <SectionHeading {...heading} />

        <div className="mt-8">
          {rows.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[420px] animate-pulse rounded-2xl border border-border bg-peach/30"
                />
              ))}
            </div>
          ) : (
            <Swiper
              slidesPerView={SLIDE_LAYOUT.slidesPerView}
              spaceBetween={SLIDE_LAYOUT.spaceBetween}
              breakpoints={SLIDE_LAYOUT.breakpoints}
              grabCursor
              watchOverflow
              a11y={{ enabled: true, containerRoleDescriptionMessage: 'New arrivals' }}
              className="new-arrivals-swiper !pb-2"
            >
              {rows.map((product) => (
                <SwiperSlide key={product._id} className="!h-auto">
                  <div className="h-full">
                    <ProductCard product={product} actions={actionsFor(product)} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
}
