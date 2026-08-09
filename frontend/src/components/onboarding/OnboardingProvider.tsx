import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ONBOARDING_VERSION = "1.0";

interface OnboardingContextProps {
  showWelcome: boolean;
  isTourActive: boolean;
  currentStep: number;
  totalSteps: number;
  startTour: () => void;
  skipTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
  replayTour: () => void;
  markWelcomeCompleted: () => void;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 13;

  useEffect(() => {
    const isCompleted = localStorage.getItem("fingerflow_onboarding_completed");
    const version = localStorage.getItem("fingerflow_onboarding_version");

    if (isCompleted !== "true" || version !== ONBOARDING_VERSION) {
      setShowWelcome(true);
    }
  }, []);

  const markWelcomeCompleted = () => {
    setShowWelcome(false);
    localStorage.setItem("fingerflow_onboarding_completed", "true");
    localStorage.setItem("fingerflow_onboarding_version", ONBOARDING_VERSION);
  };

  const startTour = () => {
    markWelcomeCompleted();
    setCurrentStep(1);
    setIsTourActive(true);
  };

  const skipTour = () => {
    markWelcomeCompleted();
    setIsTourActive(false);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const endTour = () => {
    setIsTourActive(false);
  };

  const replayTour = () => {
    setCurrentStep(1);
    setIsTourActive(true);
  };

  return (
    <OnboardingContext.Provider value={{
      showWelcome,
      isTourActive,
      currentStep,
      totalSteps,
      startTour,
      skipTour,
      nextStep,
      prevStep,
      endTour,
      replayTour,
      markWelcomeCompleted
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
