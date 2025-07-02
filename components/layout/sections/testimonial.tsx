"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

interface ArtworkProps {
  image: string;
  prompt: string;
  style: string;
}

const artworkList: ArtworkProps[] = [
  {
    image: "/artwork-1.jpg",
    prompt: "Ghibli-style anime, serene spring scene, dark-haired girl in white dress with bow sitting on wooden bench beside a light brown bunny. Pink cherry blossoms falling, distant snow-capped mountain and log cabin.",
    style: "Nature Scene"
  },
  {
    image: "/artwork-2.jpg", 
    prompt: "A little girl carrying a brown bag, wearing a blue skirt and red shoes, is standing with her back to the camera on a winding path through green grass. On both sides, there are lush trees, a blue sky with white clouds, and in the distance, red-roofed houses layered over green mountains.",
    style: "Character Portrait"
  },
  {
    image: "/artwork-3.jpg",
    prompt: "French Bulldog in Christmas setting with red and white striped gift wrapping, Christmas ornaments, and festive decorations. Transformed into Ghibli anime style with soft watercolor textures and warm holiday atmosphere.",
    style: "Image Transform"
  },
  {
    image: "/artwork-4.jpg",
    prompt: "Magical forest pathway with glowing flowers and mystical lighting, Studio Ghibli style with lush green vegetation and ethereal atmosphere.",
    style: "Fantasy Scene"
  },
  {
    image: "/artwork-5.jpg",
    prompt: "Peaceful ocean sunset with golden light reflecting on water, Ghibli-style clouds and serene coastal landscape.",
    style: "Landscape"
  },
  {
    image: "/artwork-6.jpg", 
    prompt: "Cozy cottage nestled in rolling hills with warm lighting from windows, surrounded by green meadows and distant mountains in classic Ghibli style.",
    style: "Architecture"
  }
];

export const TestimonialSection = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          Gallery
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
          AI-Generated Ghibli Masterpieces
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto"
      >
        <CarouselContent>
          {artworkList.map((artwork, index) => (
            <CarouselItem
              key={index}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="bg-muted/50 dark:bg-card overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={artwork.image}
                    alt={artwork.style}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge variant="secondary" className="mb-2">
                      {artwork.style}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {artwork.prompt}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
