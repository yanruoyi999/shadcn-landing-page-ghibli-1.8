import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface BenefitsProps {
  icon: string;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: "Palette",
    title: "Authentic Ghibli Style",
    description:
      "Powered by advanced Flux models trained on authentic Studio Ghibli artwork, ensuring every creation captures the magical essence and distinctive visual style.",
  },
  {
    icon: "Zap",
    title: "Lightning Fast Generation",
    description:
      "Generate stunning artwork in under 60 seconds. Our optimized pipeline delivers professional-quality results without the wait.",
  },
  {
    icon: "Image",
    title: "Dual Mode Support",
    description:
      "Create from text descriptions or transform your existing photos. Two powerful modes give you complete creative flexibility.",
  },
  {
    icon: "Cloud",
    title: "Cloud Storage & History",
    description:
      "All your creations are automatically saved and organized. Access your art gallery anytime, anywhere with full download capabilities.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-primary mb-2 tracking-wider">Benefits</h2>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Create Magic with Ghibli IMAGE Generator
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Experience the power of AI-driven art creation with authentic Studio Ghibli aesthetics. Our advanced technology delivers professional-quality results in minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={32}
                    color="hsl(var(--primary))"
                    className="mb-6 text-primary"
                  />
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
