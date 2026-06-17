"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_BUSINESS_LICENSE,
  ONBOARDING_STORAGE_KEY,
  type BusinessLicenseData,
  type CompanyComponent,
  type OnboardingData,
} from "../types";

const defaultData: OnboardingData = {
  components: [],
  businessLicense: DEFAULT_BUSINESS_LICENSE,
};

function loadData(): OnboardingData {
  if (typeof window === "undefined") return defaultData;

  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!stored) return defaultData;
    return { ...defaultData, ...JSON.parse(stored) };
  } catch {
    return defaultData;
  }
}

export function useOnboardingData() {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setIsLoaded(true);
  }, []);

  const persist = useCallback((next: OnboardingData) => {
    setData(next);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveComponents = useCallback(
    (components: CompanyComponent[]) => {
      persist({ ...data, components });
    },
    [data, persist],
  );

  const saveBusinessLicense = useCallback(
    (businessLicense: BusinessLicenseData) => {
      persist({ ...data, businessLicense });
    },
    [data, persist],
  );

  const saveProgress = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return {
    data,
    isLoaded,
    saveComponents,
    saveBusinessLicense,
    saveProgress,
  };
}
