import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Payload (CMS) and image remote patterns are added in Phase 3.
};

export default withNextIntl(nextConfig);
