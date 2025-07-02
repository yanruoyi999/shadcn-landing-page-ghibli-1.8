import { BenefitsSection } from "@/components/layout/sections/benefits";
import { CommunitySection } from "@/components/layout/sections/community";
import { ContactSection } from "@/components/layout/sections/contact";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { FooterSection } from "@/components/layout/sections/footer";
import { HeroSection } from "@/components/layout/sections/hero";
import { PricingSection } from "@/components/layout/sections/pricing";

import { TechStackSection } from "@/components/layout/sections/tech-stack";
import { TeamSection } from "@/components/layout/sections/team";
import { TestimonialSection } from "@/components/layout/sections/testimonial";
import { AIGeneratorSection } from "@/components/layout/sections/ai-generator-optimized";

export const metadata = {
  title: "Ghibli AI Generator - Create Magical Artwork",
  description: "Transform your ideas into stunning Studio Ghibli-style artwork with AI. Create magical scenes from text or transform your photos.",
  openGraph: {
    type: "website",
    url: "https://ghibli-ai-generator.com",
    title: "Ghibli AI Generator - Create Magical Artwork",
    description: "Transform your ideas into stunning Studio Ghibli-style artwork with AI",
    images: [
      {
        url: "https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/og-images/shadcn-vue.jpg",
        width: 1200,
        height: 630,
        alt: "Shadcn - Landing template",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GhibliAI",
    title: "Ghibli AI Generator - Create Magical Artwork",
    description: "Transform your ideas into stunning Studio Ghibli-style artwork with AI",
    images: [
      "https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/og-images/shadcn-vue.jpg",
    ],
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <TechStackSection />
      <BenefitsSection />
      <FeaturesSection />
      <AIGeneratorSection />

      <TestimonialSection />
      <TeamSection />
      <CommunitySection />
      <PricingSection />
      <ContactSection />
      <FAQSection />
      <FooterSection />
    </>
  );
}
