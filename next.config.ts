import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  // Prevent clickjacking — legacy browsers (SAMEORIGIN allows same-origin iframes).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Modern replacement for X-Frame-Options; only this CSP directive, not a full policy.
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  // Prevent MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer exposure on cross-origin requests.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the site never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Image remote patterns for Payload media are added here when S3/CDN is configured.
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withPayload(withNextIntl(nextConfig));
