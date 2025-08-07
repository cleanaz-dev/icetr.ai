"use client";
import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function BillingSwitch({ isYearly, setIsYearly }) {
  const id = useId();

  return (
    <div className="bg-slate-800/40 border border-sky-400/20 rounded-lg p-1 backdrop-blur-sm">
      <RadioGroup
        value={isYearly ? "yearly" : "monthly"}
        onValueChange={(value) => setIsYearly(value === "yearly")}
        className="relative inline-grid grid-cols-[1fr_1fr] items-center gap-1"
      >
        <label
          className={`relative z-10 inline-flex h-8 cursor-pointer items-center justify-center rounded px-4 whitespace-nowrap transition-all ${
            !isYearly
              ? "bg-sky-400/10 text-sky-400 border border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
              : "text-sky-400/70 hover:text-sky-400"
          }`}
        >
          Monthly
          <RadioGroupItem id={`${id}-monthly`} value="monthly" className="sr-only" />
        </label>
        <label
          className={`relative z-10 inline-flex h-8 cursor-pointer items-center justify-center rounded px-4 whitespace-nowrap transition-all ${
            isYearly
              ? "bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 border border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] font-medium"
              : "text-sky-400/70 hover:text-sky-400"
          }`}
        >
          Yearly <span className="ml-1 text-xs">(20% off)</span>
          <RadioGroupItem id={`${id}-yearly`} value="yearly" className="sr-only" />
        </label>
        
        {/* Animated background highlight */}
        <div 
          className={`absolute inset-y-0 w-1/2 rounded-md bg-sky-400/10 border border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all duration-300 ${
            isYearly ? "translate-x-full" : "translate-x-0"
          }`}
          aria-hidden="true"
        />
      </RadioGroup>
    </div>
  );
}