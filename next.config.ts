import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Payload (CMS) wired in Phase 3.
  // Image remote patterns for Payload media are added here when S3/CDN is configured.
};

export default withPayload(withNextIntl(nextConfig));
