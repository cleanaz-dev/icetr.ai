"use client";
import { Snowflake } from "lucide-react";
import { motion } from "framer-motion";

const NUM_SNOWFLAKES = 15;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function NotFound({ title }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-primary px-4 max-w-3xl mx-auto">
      {[...Array(NUM_SNOWFLAKES)].map((_, i) => {
        const size = randomBetween(6, 10);
        const left = randomBetween(0, 100); // anywhere full width
        const startY = randomBetween(-10, 10); // start slightly above container top
        const duration = randomBetween(4, 8);
        const delay = randomBetween(0, 5);

        return (
          <motion.div
            key={i}
            initial={{ y: startY, opacity: 0 }}
            animate={{
              y: [startY, startY + 60], // fall down ~60px
              x: [
                0,
                randomBetween(-6, 6), // gentle sway
                0,
              ],
              opacity: [0, 1, 0],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration,
              delay,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: 0,
              left: `${left}%`,
              width: size,
              height: size,
              color: "rgba(0 188 255 / 0.7)",
            }}
          >
            <Snowflake size={size} />
          </motion.div>
        );
      })}
      {/* Big central snowflake */}
      <Snowflake className="w-16 h-16 text-primary  z-10" />

      {/* Mini snowflakes falling across full width */}

      {/* Text content */}
      <div className="bg-card p-4 rounded-md text-center max-w-md mt-8 z-20">
        <h1 className="text-4xl font-extrabold mb-2">{`Oops! ${title} not found.`}</h1>
        <p className="text-lg">
          {`Check your URL or try selecting another ${title}.`}
        </p>
      </div>
    </div>
  );
}
