"use client"
import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Dialpad({ onDigitPress, onBackspace, disabled }) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <div className="px-2 pt-4 pb-2 bg-card rounded-xl border shadow-sm gap-2">
      <CardContent className="">
        <div className="grid grid-cols-3 gap-2">
          {digits.map((digit) => (
            <Button
              key={digit}
              onClick={() => onDigitPress(digit)}
              variant="outline"
              className="h-12 text-lg font-semibold hover:scale-105 transition-transform"
            >
              {digit}
            </Button>
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          <Button
            onClick={onBackspace}
            variant="ghost"
            size="icon"
            disabled={disabled}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </div>
  );
}