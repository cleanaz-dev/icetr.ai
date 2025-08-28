

import { AICapabilities } from "@/components/sections/AICapabilities";
import { Contact } from "@/components/sections/Contact";
import { Features } from "@/components/sections/Features";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Feather } from "lucide-react";
import React from "react";

export default function page() {
  return (
    <div className="bg-gradient-to-b from-background to-primary  overflow-hidden">
      
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <AICapabilities />
      <Testimonials />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
