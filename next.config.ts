import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";

const repo = "sitemanon";
const isProd = process.env.NODE_ENV === "production";
const isPages = process.env.GITHUB_PAGES === "true";

// Si un fichier public/CNAME existe (= domaine custom), pas besoin de basePath.
const hasCustomDomain = existsSync(join(process.cwd(), "public", "CNAME"));
const basePath = isProd && isPages && !hasCustomDomain ? `/${repo}` : "";

const config: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default config;
