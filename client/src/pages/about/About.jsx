import AboutGallery from '../../components/about/AboutGallery';
import AboutPageHero from '../../components/about/AboutPageHero';
import AboutPageIntro from '../../components/about/AboutPageIntro';
import AboutStudioStrip from '../../components/about/AboutStudioStrip';
import BrandStory from '../../components/about/BrandStory';
import ImageContentSection from '../../components/about/ImageContentSection';
import OurValues from '../../components/about/OurValues';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { getContent, isVisible } from '../../data/content';

// Every band is switched on or off in src/data/sectionVisibility.json under
// "about"; the wording and photos come from the same JSON content file.
const howWeWork = getContent('about.howWeWork', {});

const About = () => {
  return (
    <StorefrontLayout>
      {/* Page banner with image. */}
      {isVisible('about.hero') && <AboutPageHero />}

      {/* Short intro band under the banner. */}
      {isVisible('about.intro') && <AboutPageIntro />}

      {/* Who we are, with the studio numbers. */}
      {isVisible('about.story') && <BrandStory />}

      {/* Image on the left, content on the right. */}
      {isVisible('about.howWeWork') && <ImageContentSection {...howWeWork} />}

      {/* Several studio photos in one mosaic. */}
      {isVisible('about.gallery') && <AboutGallery />}

      {/* Icon + text promises. */}
      {isVisible('about.values') && <OurValues />}

      {/* Closing editorial with more studio images. */}
      {isVisible('about.studioStrip') && <AboutStudioStrip />}
    </StorefrontLayout>
  );
};

export default About;
