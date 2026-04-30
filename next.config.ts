import type { NextConfig } from "next";

const repo = "sitemanon";
const isProd = process.env.NODE_ENV === "production";
const isPages = process.env.GITHUB_PAGES === "true";

const config: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isProd && isPages ? `/${repo}` : "",
  assetPrefix: isProd && isPages ? `/${repo}/` : "",
};

export default config;
