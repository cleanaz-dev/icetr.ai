"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bird, Squirrel, Rabbit } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  bounceVariants,
} from "@/lib/constants/framer-motion";

export default function ComingSoon() {
  const pathname = usePathname();
  const pagename = pathname.slice(1);

  return (
    <div className="relative flex flex-col items-center justify-center px-6 overflow-hidden">
  

      {/* Main content */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-7xl mb-6 font-bold leading-tight tracking-wide text-primary drop-shadow">
          Coming Soon
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-12">
          We’re building{" "}
          <span className="font-semibold capitalize">{pagename}</span>!
        </p>

        {/* Bouncing Animal Icons */}
        <div className="flex justify-center gap-8">
          {[Bird, Squirrel, Rabbit].map((Icon, idx) => (
            <motion.div
              key={idx}
              variants={bounceVariants}
              animate="animate"
              className="text-primary"
            >
              <Icon className="w-12 h-12 md:w-14 md:h-14 drop-shadow-lg" strokeWidth={1.2} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
