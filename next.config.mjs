/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  transpilePackages: ["react-icons"],
  async headers() {
    // Allowed origins: production domain + localhost for dev
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            // In dev we allow both; in prod the env var controls this
            value: allowedOrigins[0],
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), payment=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://checkout.razorpay.com https://maps.googleapis.com https://unpkg.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://maps.googleapis.com https://maps.gstatic.com https://*.tile.openstreetmap.org https://unpkg.com https://images.unsplash.com https://cdn.grabon.in https://companieslogo.com https://upload.wikimedia.org https://commons.wikimedia.org https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              "connect-src 'self' https://api.razorpay.com https://maps.googleapis.com https://nominatim.openstreetmap.org",
              "frame-src https://checkout.razorpay.com https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin%20login",
        destination: "/admin-login",
        permanent: true,
      },
      {
        source: "/admin login",
        destination: "/admin-login",
        permanent: true,
      },
      {
        source: "/explore-offers",
        destination: "/",
        permanent: true,
      },
      {
        source: "/explore",
        destination: "/",
        permanent: true,
      },
      {
        source: "/explore%20offers",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
