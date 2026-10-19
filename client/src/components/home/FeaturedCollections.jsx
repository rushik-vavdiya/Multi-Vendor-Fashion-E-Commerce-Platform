import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import FallbackImage from '../common/FallbackImage';
import SectionHeading from './SectionHeading';
import { getContent, listContent } from '../../data/content';

// "Find Your Perfect Style": four photo cards, each with its name and a Shop Now
// link in the bottom-left corner. The heading, the photos and the link label come
// from src/data/siteContent.json (key "home.featuredCollections").
const heading = getContent('home.featuredCollections.heading', {});
const collections = listContent('home.featuredCollections.items');
const linkLabel = getContent('home.featuredCollections.linkLabel', 'Shop Now');

export default function FeaturedCollections() {
  if (collections.length === 0) return null;

  return (
    <section className="w-full bg-background py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <SectionHeading {...heading} align="center" />

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-10 lg:grid-cols-4">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                to={collection.href}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-peach/30 transition-shadow duration-300 hover:shadow-[0_18px_44px_rgba(122,52,64,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <FallbackImage
                  src={collection.image}
                  fallbackSrc={collection.imageFallback}
                  alt={collection.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                />

                {/* Soft wash under the copy so the name stays readable on any
                    photo, without covering the model. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/85 via-white/45 to-transparent"
                />

                <span className="relative p-4 sm:p-5">
                  <span className="block font-serif text-lg leading-tight text-primary sm:text-xl">
                    {collection.name}
                  </span>

                  <span className="mt-1.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85 transition-colors duration-200 group-hover:text-accent">
                    {linkLabel}
                    <ArrowRight
                      size={13}
                      strokeWidth={1.9}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
