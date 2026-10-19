import { useSelector } from 'react-redux';

import { getContent } from '../../data/content';
import ProductGrid from '../product/ProductGrid';
import SectionHeading from './SectionHeading';

// Section heading text comes from src/data/siteContent.json
// (key "home.trending.heading").
const heading = getContent('home.trending.heading', {});

// Second window of the same products slice, so the homepage needs a single
// GET /products request instead of one request per section.
export default function TrendingProducts() {
  const { items = [], listQueryKey, loading } = useSelector((state) => state.products);

  const rows = items.slice(4, 8);

  if (!loading && rows.length === 0) return null;

  return (
    <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <SectionHeading {...heading} />

        <div className="mt-9">
          <ProductGrid
            products={rows}
            loading={loading && listQueryKey !== null}
            badge="Trending"
          />
        </div>
      </div>
    </section>
  );
}
