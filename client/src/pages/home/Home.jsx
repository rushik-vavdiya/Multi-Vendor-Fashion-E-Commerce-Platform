import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BrandStory from '../../components/home/BrandStory';
import CategoryShowcase from '../../components/home/CategoryShowcase';
import FeaturedCollections from '../../components/home/FeaturedCollections';
import Hero from '../../components/home/Hero';
import NewArrivals from '../../components/home/NewArrivals';
import Newsletter from '../../components/home/Newsletter';
import PromoBanner from '../../components/home/PromoBanner';
import TrendingProducts from '../../components/home/TrendingProducts';
import WebsiteReviews from '../../components/home/WebsiteReviews';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { isVisible } from '../../data/content';
import { fetchProducts } from '../../slices/productSlice';
import { fetchWebsiteReviews } from '../../slices/websiteReviewSlice';
import { fetchCategories } from '../../slices/categorySlice';

// First 12 products feed the three product rows on the homepage.
const HOMEPAGE_PRODUCT_LIMIT = 12;

// Every band is switched on or off in src/data/sectionVisibility.json under
// "home" — set a key to false and the section disappears from the page.
const Home = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);
  const reviewsVisible = isVisible('home.reviews');

  useEffect(() => {
    // The products slice feeds New Arrivals and Trending; the categories slice
    // feeds the department circles if the Navbar request has not landed yet.
    dispatch(fetchProducts({ limit: HOMEPAGE_PRODUCT_LIMIT, sort: 'newest' }));
    if (categories.length === 0) dispatch(fetchCategories());
    if (reviewsVisible) dispatch(fetchWebsiteReviews());
  }, [dispatch, reviewsVisible, categories.length]);

  return (
    <StorefrontLayout>
      {isVisible('home.hero') && <Hero />}
      {isVisible('home.categories') && <CategoryShowcase />}
      {isVisible('home.trending') && <TrendingProducts />}
      {isVisible('home.newArrivals') && <NewArrivals />}
      {isVisible('home.promo') && <PromoBanner />}
      {isVisible('home.featuredCollections') && <FeaturedCollections />}
      {reviewsVisible && <WebsiteReviews />}
      {isVisible('home.brandStory') && <BrandStory />}
      {isVisible('home.newsletter') && <Newsletter />}
    </StorefrontLayout>
  );
};

export default Home;
