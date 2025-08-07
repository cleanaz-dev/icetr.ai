"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeChanger } from "@/lib/hooks/useChangeTheme";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { navItems } from "@/lib/constants/frontend";

export const Header = () => {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <header className="md:sticky top-0 z-50 w-full pt-4 ">
      <div className="container max-w-6xl mx-auto px-2 md:px-4  flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <span className="text-2xl font-bold text-primary">
            icetr<span>.</span>ai
          </span>
          {/* <ThemeChanger /> */}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden xl:flex items-center space-x-4">
          {/* <Button variant="outlineHero" asChild>
            <Link href="/waitlist">Join Waitlist Today!</Link>
          </Button> */}
          <Button size="huge" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          {/* <Button size="huge">Try for free</Button> */}
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <div className="border-2 border-primary/50 rounded-full p-1 hover:bg-sky-400 transition-all duration-300 group">
              <Button variant="ghost" size="icon" className=" bg-transparent">
                <MenuIcon className="size-6 text-primary group-hover:text-white transition-all duration-300" />
              </Button>
            </div>
          </SheetTrigger>

          <SheetContent
            side="top"
            className="w-full h-full backdrop-blur-lg bg-sky-400/10 flex flex-col items-center"
          >
            <SheetHeader className="text-center">
              <SheetTitle>
                {" "}
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">I</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    icetr<span>.</span>ai
                  </span>
                  <ThemeChanger />
                </div>
              </SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>

            <div className="flex flex-col items-center space-y-4 pt-6 w-full max-w-md bg-white/10  mb-16 rounded-lg ">
              {navItems.map((i, index) => (
                <Link
                  key={index}
                  href={i.href}
                  className="capitalize group mt-4"
                  onClick={handleLinkClick}
                >
                  <span className="group-hover:text-primary text-white transition-all duration-300 text-lg  tracking-wide group-hover:tracking-widest">
                    {i.label}
                  </span>
                </Link>
              ))}

              <div className="flex flex-col space-y-2 py-12 w-full max-w-xs gap-4">
                <Button size="huge" asChild>
                  <Link href="/sign-in" onClick={handleLinkClick}>Sign In</Link>
                </Button>
                {/* <Button size="hugeTransparent">Try for free</Button> */}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};