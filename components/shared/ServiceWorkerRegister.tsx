// src/components/shared/ServiceWorkerRegister.tsx
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // optional: ignore registration failures in unsupported browsers
    });
  }, []);

  return null;
}
