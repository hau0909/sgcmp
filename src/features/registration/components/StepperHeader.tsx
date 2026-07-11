"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepperHeaderProps {
  currentStep: number;
  steps: string[];
}

export default function StepperHeader({ currentStep, steps }: StepperHeaderProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline-variant/40 -translate-y-1/2 -z-10" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 ease-in-out -z-10"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center gap-2 relative bg-surface">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ring-4 ring-background
                  ${
                    isCompleted
                      ? "bg-primary text-white scale-100"
                      : isActive
                      ? "border-2 border-primary bg-white text-primary scale-110 shadow-md animate-pulse-subtle"
                      : "bg-surface-container text-on-surface-variant border border-outline-variant/60"
                  }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span
                className={`text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-300 absolute top-12 text-center w-16 sm:w-24 md:w-32 break-words left-1/2 -translate-x-1/2
                  ${
                    isActive
                      ? "text-primary font-bold scale-[1.02] block z-10 bg-surface px-1 rounded-md"
                      : "hidden sm:block text-on-surface-variant"
                  }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
      {/* Spacer to avoid absolute overlap of labels */}
      <div className="h-12 sm:h-10" />
    </div>
  );
}
