"use client";
import { Wand2, Menu } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { ToggleTheme } from "./toogle-theme";
import { UserNav } from "@/components/auth/user-nav";

interface RouteProps {
  href: string;
  label: string;
}

interface FeatureProps {
  title: string;
  description: string;
}

const routeList: RouteProps[] = [
  {
    href: "#ai-generator",
    label: "Generator",
  },
  {
    href: "#",
    label: "Gallery",
  },
  {
    href: "#",
    label: "Guide",
  },
  {
    href: "#",
    label: "Price",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

const featureList: FeatureProps[] = [
  {
    title: "Text to Image",
    description: "Transform your text descriptions into stunning Ghibli-style artwork.",
  },
  {
    title: "Image to Image",
    description: "Convert your photos into magical Studio Ghibli scenes.",
  },
  {
    title: "Style Guide",
    description: "Learn tips and tricks for creating the perfect Ghibli prompts.",
  },
  {
    title: "Examples",
    description: "Explore our gallery of beautiful AI-generated Ghibli artwork.",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <header className="shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-card">
      <Link href="/" className="font-bold text-lg flex items-center">
        <Wand2 className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white" />
        Ghibli AI
      </Link>
      {/* <!-- Mobile --> */}
      <div className="flex items-center lg:hidden gap-2">
        <UserNav />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer lg:hidden"
            />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <Wand2 className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white" />
                    Ghibli AI
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={(e) => {
                      setIsOpen(false);
                      if (label === "Gallery" || label === "Guide" || label === "Price") {
                        e.preventDefault();
                      }
                    }}
                    asChild={!(label === "Gallery" || label === "Guide" || label === "Price")}
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    {label === "Gallery" || label === "Guide" || label === "Price" ? (
                      <span>{label}</span>
                    ) : (
                    <Link href={href}>{label}</Link>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />

              <ToggleTheme />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* <!-- Desktop --> */}
      <NavigationMenu className="hidden lg:block mx-auto">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-card text-base">
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[450px] p-4">
                <ul className="flex flex-col gap-2">
                  {featureList.map(({ title, description }) => (
                    <li
                      key={title}
                      className="rounded-md p-3 text-sm hover:bg-muted"
                    >
                      <p className="mb-1 font-semibold leading-none text-foreground">
                        {title}
                      </p>
                      <p className="line-clamp-2 text-muted-foreground">
                        {description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            {routeList.map(({ href, label }) => (
              <NavigationMenuLink key={href} asChild={!(label === "Gallery" || label === "Guide" || label === "Price")}>
                {label === "Gallery" || label === "Guide" || label === "Price" ? (
                  <span className="text-base px-2 cursor-default text-muted-foreground">
                    {label}
                  </span>
                ) : (
                <Link href={href} className="text-base px-2">
                  {label}
                </Link>
                )}
              </NavigationMenuLink>
            ))}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="hidden lg:flex items-center gap-2">
        <ToggleTheme />
        <UserNav />
        <Button asChild size="sm" className="bg-gradient-to-r from-[#D247BF] to-primary text-white hover:opacity-90">
          <Link href="#ai-generator">
            Start Creating
          </Link>
        </Button>
      </div>
    </header>
  );
};
