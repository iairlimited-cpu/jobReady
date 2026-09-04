"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { pageDimensions } from "@/features/resume/templates/preview";
import type { PageSize } from "@/features/resume/types";

/**
 * Wraps a full-size page sheet and scales it to fit its container width
 * (page-accurate preview without horizontal scroll on smaller panels).
 */
export function ScaleToFit({
  children,
  pageSize,
  className,
}: {
  children: ReactNode;
  pageSize?: PageSize;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const dimensions = pageDimensions(pageSize ?? "A4");

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? node.clientWidth;
      setContainerWidth(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(1, (containerWidth - 8) / dimensions.width);
  const scaledHeight = Math.ceil(dimensions.height * scale);

  if (containerWidth === 0) {
    return (
      <div ref={containerRef} className={className}>
        <div className="h-64 animate-pulse rounded-md bg-muted" aria-busy="true" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={{ height: scaledHeight }}>
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: dimensions.width,
        }}
      >
        {children}
      </div>
    </div>
  );
}
