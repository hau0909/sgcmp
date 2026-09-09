"use client";

import React from "react";
import { ContractServiceInfo } from "./ContractServiceInfo";

interface CustomerServiceInfoProps {
  serviceName: string;
  quantity: number;
  duration: string;
  location: string;
  timeSlots?: string[];
  workingDays?: string[];
  description?: string | null;
}

export function CustomerServiceInfo(props: CustomerServiceInfoProps) {
  return <ContractServiceInfo {...props} />;
}

