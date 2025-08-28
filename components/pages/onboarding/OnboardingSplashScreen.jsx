"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingSplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const loadingTexts = ["Loading, please wait...", "Preparing your experience..."];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 5000);

    const textTimer = setInterval(() => {
      setTextIndex((i) => (i + 1) % loadingTexts.length);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(textTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
     

      <div className="mt-4 min-h-[1.25rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="text-muted-foreground select-none text-2xl font-light"
          >
            {loadingTexts[textIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
