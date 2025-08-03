import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play } from "lucide-react";
import heroImg from "/public/images/hero-1.png";
import Image from "next/image";
import Link from "next/link";
import { Header } from "./Header";

export const Hero = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-3xl px-4 text-center mt-20 min-h-screen">
        <Badge
          variant="secondary"
          className="mb-4 text-primary border-primary rounded-full bg-transparent"
        >
          <span className="text-sm md:text-lg px-4 tracking-wide">
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

        <p className="md:text-lg text-sky-400 mb-6 md:mb-4 max-w-xl md:max-w-3xl mx-auto leading-relaxed">
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

        <div className="md:hidden flex justify-center items-center mb-6">
          <Button size="huge" asChild>
            <Link href="/waitlist">Join Waitlist Today!</Link>
          </Button>
        </div>

        <div className="flex justify-center relative">
          <div className="z-40">
            <Image
              src={heroImg}
              alt="hero-image-phone"
              className="object-cover size-60 md:size-96" // 192px on mobile, 384px on md+
              height={400}
              width={400}
            />
          </div>

        </div>
      </div>
    </>
  );
};
