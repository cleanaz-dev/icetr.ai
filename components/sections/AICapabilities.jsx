import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Brain, PhoneCall, GraduationCap, AI } from "lucide-react";
import Image from "next/image";
import aiImage1 from "/public/images/ai-research.png";
import aiImage2 from "/public/images/ai-cold-calling.png";
import aiImage3 from "/public/images/ai-training.png";

export const AICapabilities = () => {
  const capabilities = [
    {
      icon: Brain,
      title: "AI-Powered Research",
      description:
        "Conduct in-depth research on leads with our AI, uncovering insights that help you tailor your outreach strategy.",
      image: aiImage1,
    },
    {
      icon: PhoneCall,
      title: "AI Cold Calling",
      description:
        "Automate your cold calling process with AI that can make calls, handle objections, and qualify leads.",
      image: aiImage2,
    },
    {
      icon: GraduationCap,
      title: "AI Training and Grading",
      description:
        "Improve your team's performance with AI-driven training sessions that provide real-time feedback and grading.",
      image: aiImage3,
    },
  ];

  return (
    <section
      id="ai-capabilities"
      className="py-24 px-4 bg-gradient-to-b from-sky-950/30 to-sky-950/10 relative overflow-hidden"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center bg-sky-900/20 border border-sky-400/30 rounded-full px-6 py-2 mb-6 backdrop-blur-sm">
            <span className="text-sky-300 text-sm md:text-base tracking-wider font-medium">
              AI CAPABILITIES
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-sky-300 mb-6">
            Leverage AI to Transform Your{" "}
            <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">Sales Process</span>
          </h2>
          <p className="text-sky-200 text-lg max-w-3xl mx-auto leading-relaxed">
            Experience the next level of sales efficiency with our advanced AI
            features designed to boost your outreach and close more deals.
          </p>
        </div>

        {/* Carousel Section */}
        <div className="max-w-4xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent>
              {capabilities.map((capability, index) => (
                <CarouselItem key={index}>
                  <div className="p-4">
                    <CardContent className="flex flex-col md:flex-row items-center p-0">
                      {/* Image with 14:10 ratio */}
                      <div className="relative w-full md:w-1/2 aspect-[14/10]">
                        <Image
                          src={capability.image}
                          alt={capability.title}
                          fill
                          className="object-cover"
                        />
               
                      </div>

                      {/* Content */}
                      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                     
                        <h3 className="text-2xl font-semibold text-white mb-4">
                          {capability.title}
                        </h3>
                        <p className="text-sky-200 leading-relaxed">
                          {capability.description}
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-sky-900/70 hover:bg-sky-800/90 border border-sky-400/30 text-sky-300" />
            <CarouselNext className="right-2 bg-sky-900/70 hover:bg-sky-800/90 border border-sky-400/30 text-sky-300" />
          </Carousel>
        </div>

        {/* Decorative elements */}
        <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-sky-400/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl -z-10"></div>
      </div>
    </section>
  );
};
