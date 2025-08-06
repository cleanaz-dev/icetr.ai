import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import heroImg from "/public/images/hero-1.png";
import Image from "next/image";
import Link from "next/link";
import { Header } from "./Header";

export const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Mobile Version (sm and below) */}
      <div className="sm:hidden container mx-auto max-w-3xl px-4 flex-grow flex flex-col justify-center pt-4">
        <div className="text-center">
          <Badge
            variant="secondary"
            className="mb-3 text-primary border-primary rounded-full bg-transparent"
          >
            <span className="text-xs px-3 tracking-wide">
              TRUSTED BY 10,000+ COMPANIES
            </span>
          </Badge>

          <h1 className="text-3xl font-light text-sky-400 mb-4 leading-tight">
            Break the{" "}
            <span className="relative">
              <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
                ice
              </span>
              <span className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-400 bg-clip-text text-transparent opacity-80">
                ice
              </span>
            </span>{" "}
            with
            <span className="text-secondary font-medium block mt-2">
              AI-powered outreach
            </span>
          </h1>

          <p className="text-sm text-sky-400 mb-6 mx-auto leading-relaxed">
            Transform your{" "}
            <span className="font-semibold">cold outreach</span> with
            intelligent emails and{" "}
            <span className="font-semibold">AI-driven cold calls</span> — all
            powered by built-in calling tools.
          </p>

          <div className="flex justify-center mb-6">
            <Button size="lg" className="px-6 py-4 text-sm" asChild>
              <Link href="/waitlist">
                Learn More!
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Version (md and above) */}
      <div className="hidden sm:flex container mx-auto max-w-3xl px-4 flex-grow flex-col justify-center">
        <div className="text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-primary border-primary rounded-full bg-transparent"
          >
            <span className="text-sm md:text-base px-4 tracking-wide">
              TRUSTED BY 10,000+ COMPANIES
            </span>
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-sky-400 mb-6 leading-tight">
            Break the{" "}
            <span className="relative">
              <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
                ice
              </span>
              <span className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-400 bg-clip-text text-transparent opacity-80">
                ice
              </span>
            </span>{" "}
            with
            <br />
            <span className="text-secondary font-medium">
              AI-powered outreach
            </span>
          </h1>

          <p className="text-base md:text-lg text-sky-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Transform your{" "}
            <span className="font-semibold">cold outreach</span> with
            intelligent emails and{" "}
            <span className="font-semibold">AI-driven cold calls</span> — all
            powered by built-in calling tools that help you{" "}
            <span className="font-semibold">reach leads faster</span> and close
            deals smarter.
            <span className="block mt-2">
              Increase response rates by{" "}
              <span className="font-semibold">10x</span> and close more deals
              faster.
            </span>
          </p>

          <div className="flex justify-center mb-10">
            <Button size="lg" className="px-8 py-6 text-base" asChild>
              <Link href="/waitlist">
                Learn More!
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="flex justify-center items-center mt-8">
            <div className="relative w-full max-w-md">
              <Image
                src={heroImg}
                alt="AI-powered outreach platform"
                className="object-contain w-full h-auto"
                priority
                sizes="50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};