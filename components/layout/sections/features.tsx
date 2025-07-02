import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface FeaturesProps {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "TabletSmartphone",
    title: "Text to Image",
    description:
      "Transform detailed text descriptions into beautiful Ghibli-style artwork. Simply describe your vision and watch it come to life.",
  },
  {
    icon: "BadgeCheck",
    title: "Image to Image",
    description:
      "Upload your photos and transform them into magical Studio Ghibli scenes while preserving the original composition and mood.",
  },
  {
    icon: "Goal",
    title: "Style Control",
    description:
      "Fine-tune the artistic style with advanced controls. Adjust colors, mood, and visual elements to match your creative vision.",
  },
  {
    icon: "PictureInPicture",
    title: "Multiple Ratios",
    description:
      "Generate artwork in various aspect ratios - square, portrait, landscape, or custom dimensions to fit any project need.",
  },
  {
    icon: "MousePointerClick",
    title: "High Resolution",
    description:
      "Create crisp, detailed artwork up to 1024x1024 pixels, perfect for prints, digital art, and professional presentations.",
  },
  {
    icon: "Newspaper",
    title: "Instant Download",
    description:
      "Download your creations immediately in high-quality formats. All generated artwork is yours to keep and use commercially.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Powerful AI Generation Features
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        Discover the advanced capabilities that make our Ghibli AI generator the perfect tool for creating stunning artwork with professional quality and authentic style.
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
