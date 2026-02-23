import LandingShell from './components/LandingShell';

import HeroSection from './components/HeroSection/HeroSection';
import FeatureSection from './components/FeatureSection/FeatureSection';
import CtaSection from './components/CtaSection/CtaSection';

export default function LandingPage() {
  return (
    <LandingShell>
      <main>
        <HeroSection />
        <FeatureSection variant="two" />
        <FeatureSection variant="three" />
        <FeatureSection variant="four" />
        <CtaSection />
      </main>
    </LandingShell>
  );
}
