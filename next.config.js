/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 14: external packages for server components (not `serverExternalPackages`).
  experimental: {
    serverComponentsExternalPackages: ["pg", "unpdf"],
    // Next 14.2 requires this flag before it loads src/instrumentation.ts,
    // where the boot-time env check (assertEnv) lives.
    instrumentationHook: true,
  },

  // Emit a self-contained server bundle (.next/standalone) so the production
  // Docker image ships only the files it needs. See Dockerfile.
  output: "standalone",

  // Do not advertise the framework/version to attackers scanning for CVEs.
  poweredByHeader: false,

  // Fail the build on a type error rather than shipping a broken bundle.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: this app is never legitimately framed.
          { key: "X-Frame-Options", value: "DENY" },
          // Stop the browser from MIME-sniffing a response into a script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Do not leak the full URL (may contain ids) to third parties.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Deny hardware/APIs the app does not use.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Isolate this origin from cross-origin window references.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // HSTS: only meaningful over HTTPS; harmless on localhost (ignored
          // for http:// origins). Deploy behind TLS for this to take effect.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
