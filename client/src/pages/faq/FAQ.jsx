import { useState } from 'react';

import FaqAccordion from '../../components/faq/FaqAccordion';
import FaqCategorySidebar from '../../components/faq/FaqCategorySidebar';
import FaqContactBanner from '../../components/faq/FaqContactBanner';
import PageHero from '../../components/common/PageHero';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { getContent, isVisible } from '../../data/content';

// FAQ wording and categories live in src/data/siteContent.json ("faq"), the
// single content file for the whole site; src/data/faqContent.js reads them.
import { faqGroups } from '../../data/faqContent';

const hero = getContent('faq.hero', {});

const FAQ = () => {
  const [activeId, setActiveId] = useState(faqGroups[0]?.id);
  const activeGroup =
    faqGroups.find((group) => group.id === activeId) ?? faqGroups[0];

  return (
    <StorefrontLayout>
      {isVisible('faq.hero') && (
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          breadcrumb={hero.breadcrumb}
          image={hero.image}
          imageFallback={hero.imageFallback}
        />
      )}

      {isVisible('faq.groups') && activeGroup && (
        <section className="w-full bg-background py-14 sm:py-16 lg:py-20">
          <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              <FaqCategorySidebar
                groups={faqGroups}
                activeId={activeGroup.id}
                onSelect={setActiveId}
              />

              <div className="min-w-0 flex-1">
                <div className="mb-6">
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
                    {activeGroup.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
                    {activeGroup.description}
                  </p>
                </div>

                {/* key resets the accordion when the topic changes, so a new
                    category never opens with a stale answer expanded. */}
                <FaqAccordion
                  key={activeGroup.id}
                  items={activeGroup.items}
                  idPrefix={activeGroup.id}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {isVisible('faq.contactBanner') && <FaqContactBanner />}
    </StorefrontLayout>
  );
};

export default FAQ;
