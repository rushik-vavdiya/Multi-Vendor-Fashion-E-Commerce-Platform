import ContactBanner from '../../components/contact/ContactBanner';
import ContactPageBody from '../../components/contact/ContactPageBody';
import MapSection from '../../components/contact/MapSection';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { isVisible } from '../../data/content';

// Each band is switched on or off in src/data/sectionVisibility.json under
// "contact". ContactPageBody has three switches of its own (form, infoCards,
// quickAnswers) and hides itself when they are all false.
const Contact = () => {
  return (
    // This is the only storefront page that shows the floating WhatsApp button,
    // so it sits next to the contact form it belongs with.
    <StorefrontLayout showWhatsApp>
      {isVisible('contact.banner') && <ContactBanner />}
      <ContactPageBody />
      {isVisible('contact.map') && <MapSection />}
    </StorefrontLayout>
  );
};

export default Contact;
