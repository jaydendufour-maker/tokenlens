import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Compacte, self-contained build voor de VM (next start zonder full node_modules).
  output: "standalone",
  // Twee lockfiles in de boom → trace vanaf deze app, niet vanaf /home/jayden.
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; upgrade-insecure-requests" },
      ],
    }];
  },
};

export default nextConfig;
