import type { NextConfig } from "next";

const repo = "sitemanon";
const isProd = process.env.NODE_ENV === "production";
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isProd && isPages ? `/${repo}` : "";

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
