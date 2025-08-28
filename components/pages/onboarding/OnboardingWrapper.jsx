"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingSplashScreen from "./OnboardingSplashScreen";
import Onboarding from "./Onboarding";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function OnboardingWrapper({ sessionId }) {
  const [showSplash, setShowSplash] = useState(true);
  const { data, error, isLoading } = useSWR(
    sessionId ? `/api/public/onboarding?sessionId=${sessionId}` : null,
    fetcher,
    // { refreshInterval: 5000 } // optional polling
  );

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <OnboardingSplashScreen onFinish={() => setShowSplash(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Onboarding onboardingData={data} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
