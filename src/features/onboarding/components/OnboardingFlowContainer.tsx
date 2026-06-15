"use client";

import React, { useState } from "react";
import OnboardingStepper from "./OnboardingStepper";
import BasicInfoForm from "./BasicInfoForm";
import ComponentProfileForm from "./ComponentProfileForm";
import BusinessLicenseForm from "./BusinessLicenseForm";
import ReviewSubmitForm from "./ReviewSubmitForm";

export default function OnboardingFlowContainer() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSkip = () => {
    setCurrentStep(4);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm onNext={handleNext} />;
      case 2:
        return <ComponentProfileForm onNext={handleNext} onBack={handleBack} />;
      case 3:
        return (
          <BusinessLicenseForm
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 4:
        return <ReviewSubmitForm onBack={handleBack} />;
      default:
        return <BasicInfoForm onNext={handleNext} />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left column: Stepper */}
      <div className="lg:col-span-1 bg-surface-container-low border border-outline-variant rounded-xl p-5 shadow-sm h-fit">
        <div className="mb-4 pb-4 border-b border-outline-variant/60">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Tiến trình Onboarding
          </p>
          <p className="text-sm font-semibold text-on-surface mt-1">
            Bước {currentStep} / 4
          </p>
        </div>
        <OnboardingStepper currentStep={currentStep} />
      </div>

      {/* Right column: Form viewport */}
      <div className="lg:col-span-3 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        {renderStep()}
      </div>
    </div>
  );
}
