"use client";

import { Icon } from "@/components/ui/icon";
import { Marquee } from "@devnomic/marquee";
import "@devnomic/marquee/dist/index.css";
import { icons } from "lucide-react";

interface techStackProps {
  icon: string;
  name: string;
}

const techStack: techStackProps[] = [
  {
    icon: "Crown",
    name: "Next.js",
  },
  {
    icon: "Vegan",
    name: "React",
  },
  {
    icon: "Ghost",
    name: "TypeScript",
  },
  {
    icon: "Puzzle",
    name: "Flux",
  },
  {
    icon: "Squirrel",
    name: "Tailwind CSS",
  },
  {
    icon: "Cookie",
    name: "Replicate",
  },
  {
    icon: "Drama",
    name: "Cloudflare",
  },
];

export const TechStackSection = () => {
  return (
    <section id="tech-stack" className="max-w-[75%] mx-auto pb-24 sm:pb-32">
      <h2 className="text-lg md:text-xl text-center mb-6">
        Powered by Modern Technology
      </h2>

      <div className="mx-auto">
        <Marquee
          className="gap-[3rem]"
          fade
          innerClassName="gap-[3rem]"
          pauseOnHover
        >
          {techStack.map(({ icon, name }) => (
            <div
              key={name}
              className="flex items-center text-xl md:text-2xl font-medium"
            >
              <Icon
                name={icon as keyof typeof icons}
                size={32}
                color="white"
                className="mr-2"
              />
              {name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}; 