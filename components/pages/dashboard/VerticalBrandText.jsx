// components/layout/VerticalBrandText.js
"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function VerticalBrandText({ isVisible }) {
  const letters = "icetrai".split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3, // Delay before letters start appearing
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2, // Fast disappear
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="flex flex-col items-center py-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              variants={letterVariants}
              className="text-primary/20 font-bold text-2xl tracking-wider mb-1 select-none"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}