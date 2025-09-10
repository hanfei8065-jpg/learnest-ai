export interface SiteContent {
  hero: HeroSection;
  why: WhySection;
  how: HowSection;
  features: FeaturesSection;
  faq: FaqSection;
  footer: FooterSection;
  meta: MetaData;
}

export interface HeroSection {
  badge: string;
  brand: string;
  slogan: string;
  primaryCta: CtaButton;
  secondaryCta: CtaButton;
  gradient: {
    from: string;
    to: string;
  };
}

export interface WhySection {
  heading: string;
  subheading: string;
  cards: ValueCard[];
}

export interface ValueCard {
  title: string;
  description: string;
  icon: string; // lucide-react icon name
}

export interface HowSection {
  heading: string;
  subheading: string;
  steps: HowStep[];
}

export interface HowStep {
  number: string;
  title: string;
  description: string;
  icon: string; // lucide-react icon name
}

export interface FeaturesSection {
  heading: string;
  subheading: string;
  features: Feature[];
}

export interface Feature {
  title: string;
  description: string;
  icon: string; // lucide-react icon name
}

export interface FaqSection {
  heading: string;
  subheading: string;
  questions: FaqItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FooterSection {
  copyright: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface CtaButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary';
}

export interface MetaData {
  title: string;
  description: string;
  keywords: string[];
}
