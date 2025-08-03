import { Gem } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  return (
    <section className="relative py-16 px-4 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center h-64 overflow-hidden ">
      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="text-center max-w-4xl mx-auto h-full flex flex-col justify-center relative z-10">
        <h3 className="text-3xl md:text-4xl font-light text-sky-400 mb-4">
          Ready to transform your{" "}
          <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
            cold outreach
          </span>
          ?
        </h3>
        <p className="text-sky-400/80 text-lg max-w-2xl mx-auto mb-4">
          Join thousands of sales teams who have already increased their
          conversion rates by 10x with our AI-powered platform.
        </p>
        <div className="flex gap-2 items-center justify-center text-slate-600">
          <p><Link href="https://llmgem.com">Powered by LLM GEM</Link> </p>
          <Gem className="size-3" />
        </div>
      </div>
    </section>
  );
};
