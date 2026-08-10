"use client";

import { useEffect } from "react";

export default function PreventZoom() {
  useEffect(() => {
    const prevent = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };

    const preventKeyZoom = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("keydown", preventKeyZoom);

    return () => {
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("keydown", preventKeyZoom);
    };
  }, []);

  return null;
}