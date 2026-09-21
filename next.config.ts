import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  // Some backend routes (e.g. /admin/management/) are defined with a
  // trailing slash. Without this, Next.js redirect-normalizes trailing
  // slashes off incoming requests before rewrites run, so `/backend/admin/
  // management/` silently becomes `/backend/admin/management` and 404s
  // against the real backend.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // The backend only serves plain HTTP. Proxy client requests through this
    // same-origin (HTTPS) path so browsers don't block them as mixed content.
    const backendOrigin = (
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://20.205.184.153:5013"
    ).replace(/\/$/, "");

    return [
      {
        source: "/backend/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default withNextIntl(nextConfig);
