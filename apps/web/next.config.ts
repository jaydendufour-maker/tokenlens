import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Compacte, self-contained build voor de VM (next start zonder full node_modules).
  output: "standalone",
  // Twee lockfiles in de boom → trace vanaf deze app, niet vanaf /home/jayden.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
