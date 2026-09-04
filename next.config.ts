import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Firebase Hosting static export (JOBREADY-PLAN.md §A5).
  output: "export",
  // Static export has no runtime image optimizer.
  images: { unoptimized: true },
};

export default nextConfig;
