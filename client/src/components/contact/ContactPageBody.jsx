import ContactFormCard from './ContactFormCard';
import ContactInfoCardGroup from './ContactInfoCardGroup';
import ContactQuickAnswers from './ContactQuickAnswers';
import ContactStudioCollage from './ContactStudioCollage';
import { isVisible } from '../../data/content';

// Two side-by-side columns on desktop: the message form on the left and the
// contact details on the right. On phones they stack in the same order.
// The three switches live in src/data/sectionVisibility.json under "contact".
export default function ContactPageBody() {
  const showForm = isVisible('contact.form');
  const showInfoCards = isVisible('contact.infoCards');
  const showQuickAnswers = isVisible('contact.quickAnswers');

  if (!showForm && !showInfoCards && !showQuickAnswers) return null;

  return (
    <section className="w-full bg-background py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {showForm && (
            <div className="w-full lg:flex-[1.15]">
              <ContactFormCard />
            </div>
          )}

          {(showInfoCards || showQuickAnswers) && (
            <div className="w-full lg:max-w-[440px] lg:flex-[0.85]">
              {showInfoCards && (
                <div className="flex flex-col gap-4">
                  <ContactStudioCollage />
                  <ContactInfoCardGroup />
                </div>
              )}

              {showQuickAnswers && (
                <div className={showInfoCards ? 'mt-4' : undefined}>
                  <ContactQuickAnswers />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
