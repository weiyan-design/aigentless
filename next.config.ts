import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests in dev (e.g. cloudflared / localtunnel for phone testing).
  // Safe in dev only; production deployments use their own origin.
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "192.168.7.83",
  ],
};

export default nextConfig;
