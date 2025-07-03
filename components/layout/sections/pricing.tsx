"use client"

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles, Crown, Building } from "lucide-react";
import { SubscriptionButton } from "@/components/ui/subscription-button";
import { useSubscription } from "@/hooks/use-subscription";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";

enum PopularPlan {
  NO = 0,
  YES = 1,
}

interface PlanProps {
  title: string;
  popular: PopularPlan;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
  icon: React.ReactNode;
  priceId: string;
  planKey: string;
}

const plans: PlanProps[] = [
  {
    title: "Free",
    popular: 0,
    price: 0,
    description: "Perfect for trying out our Ghibli AI generator with basic features",
    buttonText: "Start Free",
    icon: <Sparkles className="w-6 h-6" />,
    priceId: "free",
    planKey: "FREE",
    benefitList: [
      "5 generations per day",
      "Standard quality (512x512)",
      "Basic Ghibli style filters",
      "Community support",
      "Watermarked images",
    ],
  },
  {
    title: "Pro",
    popular: 1,
    price: 19,
    description: "Best for creators and artists who need more generations and higher quality",
    buttonText: "Get Pro",
    icon: <Crown className="w-6 h-6" />,
    priceId: SUBSCRIPTION_PLANS.PRO.priceId,
    planKey: "PRO",
    benefitList: [
      "100 generations per day",
      "HD quality (1024x1024)",
      "Advanced Ghibli style options",
      "Priority support",
      "No watermarks",
      "Commercial usage rights",
    ],
  },
  {
    title: "Enterprise",
    popular: 0,
    price: 99,
    description: "For teams and businesses with high-volume needs and custom requirements",
    buttonText: "Get Enterprise",
    icon: <Building className="w-6 h-6" />,
    priceId: SUBSCRIPTION_PLANS.ENTERPRISE.priceId,
    planKey: "ENTERPRISE",
    benefitList: [
      "Unlimited generations",
      "Ultra HD quality (2048x2048)",
      "Custom style training",
      "Dedicated support",
      "API access",
      "Team management dashboard",
    ],
  },
];

export const PricingSection = () => {
  const { subscription, isSubscribed, user } = useSubscription();

  return (
    <section className="container py-24 sm:py-32" id="pricing">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Pricing
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Choose Your Creative Journey
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground pb-14">
        Start creating magical Ghibli-style artwork today. Upgrade anytime to unlock more features and higher quality generations.
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-4">
        {plans.map(
          ({ title, popular, price, description, buttonText, benefitList, icon, priceId, planKey }) => {
            const isCurrentPlan = isSubscribed(planKey.toLowerCase());
            const currentButtonText = isCurrentPlan ? "Current Plan" : buttonText;
            
            return (
              <Card
                key={title}
                className={
                  popular === PopularPlan?.YES
                    ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10 border-[1.5px] border-primary lg:scale-[1.1] relative"
                    : isCurrentPlan
                    ? "border-[1.5px] border-green-500 relative"
                    : ""
                }
              >
                {popular === PopularPlan.YES && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/20 p-2 rounded-full">
                      {icon}
                    </div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                  </div>

                  <CardDescription className="pb-4 text-base">
                    {description}
                  </CardDescription>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground text-lg"> /month</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {benefitList.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-3">
                        <Check className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <SubscriptionButton
                    priceId={priceId}
                    plan={planKey}
                    buttonText={currentButtonText}
                    variant={
                      popular === PopularPlan?.YES && !isCurrentPlan ? "default" : "secondary"
                    }
                    className="w-full"
                    disabled={isCurrentPlan}
                  />
                </CardFooter>
              </Card>
            );
          }
        )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground mb-4">
          All plans include our core Ghibli AI technology and regular updates
        </p>
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <span>✓ 30-day money-back guarantee</span>
          <span>✓ Cancel anytime</span>
          <span>✓ Secure payments</span>
        </div>
      </div>
    </section>
  );
};