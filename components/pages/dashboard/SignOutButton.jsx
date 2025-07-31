"use client";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import React from "react";

export default function SignOutButton({
  signOut,
  sidebarCollapsed,
  useRef,
  isHovering,
  setIsHovering,
  showDialog,
  setShowDialog,
}) {
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Start the timer for sign out dialog
    timeoutRef.current = setTimeout(() => {
      setShowDialog(true);
      setIsHovering(false);
    }, 1500); // 1.5 seconds to complete the fill
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Clear the timeout if user stops hovering
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleSignOut = () => {
    setShowDialog(false);
    signOut();
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <>
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-2 p-2 text-muted-foreground hover:text-primary-foreground rounded-lg transition-colors w-full cursor-pointer group relative overflow-hidden"
      >
        {/* Background fill effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-primary to-primary transform origin-left transition-transform duration-1500 ease-out ${
            isHovering ? "scale-x-100" : "scale-x-0"
          }`}
        />

        {/* Progress bar at bottom */}

        <LogOut className="w-4 h-4 relative z-10" />
        {!sidebarCollapsed && (
          <AnimatePresence mode="wait">
            <motion.div
              key="signout"
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{
                opacity: 1,
                x: 0,
                width: "auto",
                transition: {
                  opacity: { delay: 1, duration: 0.5 },
                  x: { delay: 1, duration: 0.5 },
                  width: { delay: 1, duration: 0.5 },
                },
              }}
              exit={{
                opacity: 0,
                x: -10,
                width: 0,
                transition: { duration: 0.1 },
              }}
              className="flex items-center gap-8 whitespace-nowrap relative z-10"
            >
              <span className="flex text-sm ml-2 font-medium">Sign out </span>
            </motion.div>
          </AnimatePresence>
        )}
      </button>

      {/* Sign out confirmation dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  flex items-center justify-center z-90"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border rounded-lg px-6 py-5 max-w-sm mx-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <LogOut className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Sign Out</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSignOut}
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showDialog && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 pointer-events-none" />
        )}
    </>
  );
}
