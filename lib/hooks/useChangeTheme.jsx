"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun } from "lucide-react";
import { MoonStar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeChanger = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="flex gap-4">
      <Button
        className="h-auto bg-transparent hover:bg-transparent group"
        onClick={toggleTheme}
      >
        {theme === "light" ? (
          <Sun
            className={`${
              theme === "light" && "text-primary"
            } size-4 group-hover:rotate-360 transition-all duration-500 group-hover:scale-150`}
          />
        ) : (
          <MoonStar className={`${
              theme === "dark" && "text-primary"
            } size-4 group-hover:rotate-360 transition-all duration-500 group-hover:scale-150`} />
        )}
      </Button>
    </div>
  );
};
