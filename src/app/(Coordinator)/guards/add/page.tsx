"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddGuardPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/guards");
  }, [router]);

  return null;
}
