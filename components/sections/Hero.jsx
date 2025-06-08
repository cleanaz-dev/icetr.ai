import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play } from "lucide-react";
import heroImg from "/public/images/hero-1.png";
import Image from "next/image";
import Link from "next/link";
import { Header } from "./Header";

export const Hero = () => {
  return (
    <div className="h-screen">
      <Header />
      <div className="container mx-auto max-w-3xl px-4  md:pb-20 text-center">
        <Badge
          variant="secondary"
          className="mb-4 bg-sky-100 text-primary border-primary rounded-full bg-transparent"
        >
          <span className="md:text-lg px-4 tracking-wide">
            TRUSTED BY 10,000+ COMPANIES
          </span>
        </Badge>

        <h1 className="text-4xl md:text-6xl font-light text-sky-400 mb-8 leading-tight">
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
          <p className="text-secondary font-medium">AI-powered outreach</p>
        </h1>

        <p className="md:text-xl text-sky-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Transform your <span className="font-semibold ">cold outreach</span>{" "}
          with intelligent emails and{" "}
          <span className="font-semibold ">AI-driven cold calls</span> — all
          powered by built-in calling tools that help you{" "}
          <span className="font-semibold ">reach leads faster</span> and close
          deals smarter.
          <span className="hidden md:block">
            Increase response rates by{" "}
            <span className="font-semibold ">10x</span> and close more deals
            faster.
          </span>
        </p>

        <div className="flex justify-center items-center mb-12">
          <Button size="huge" asChild>
            <Link href="/onboarding">Get Started Today!</Link>
          </Button>
        </div>

        <div className="relative flex justify-center">
          <Image
            src={heroImg}
            alt="hero-image-phone"
            className="object-cover z-40"
            height={400}
            width={400}
          />

          {/* Overlay with better rotation and sizing */}
          <div className="absolute  hidden md:block bottom-0 top-0 h-[300px] w-[300px] max-w-sm bg-black opacity-50 rotate-x-50 rotate-z-45 transform origin-center rounded-full z-30" />
        </div>
      </div>
    </div>
  );
};
