"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"
import { Apple, Calculator, Goal } from "lucide-react";

const features = [
  {
    title: "Food Tracking",
    description:
      "Easily log your meals, count calories and macros, and stay on track.",
    icon: Apple, // Use the Apple icon
  },
  {
    title: "TDEE Calculator",
    description:
      "Determine your Total Daily Energy Expenditure to personalize your calorie intake.",
    icon: Calculator, // Use the Calculator icon
  },
  {
    title: "Goal Setting",
    description:
      "Set clear fitness goals and monitor your progress every step of the way.",
    icon: Goal, // Use the Goal icon
  },
];

export default function Home() {
  return (
    <section className="py-24">
      <div className="container">
        {/* Hero Section */}
        <div className="bg-background py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold">
              Achieve Your Fitness Goals
            </h1>
            <p className="text-xl md:text-2xl mt-4">
              Track your meals, calculate your TDEE, and reach your full
              potential.
            </p>
            <a href='/protected/home'><Button className={"mt-8"}>Gaet Started</Button></a>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="shadow-md hover:shadow-lg transition"
              >
                <div className="p-8 text-center flex flex-col items-center gap-4">
                  {/* Render the Lucide React Icon */}
                  <feature.icon className="w-12 h-12 text-muted-foreground" /> 
                  <h2 className="text-2xl font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
