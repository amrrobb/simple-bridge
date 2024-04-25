/** @type {import('next').NextConfig} */

const nextConfig = {
  // env: {
  //   integratorId: process.env.INTEGRATOR_ID,
  // },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com",
        port: "",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "ethereum-optimism.github.io",
        port: "",
        pathname: "/data/**",
      },
      {
        protocol: "https",
        hostname: "https://assets.coingecko.com",
        port: "",
        pathname: "/coins/**",
      },
    ],
  },

  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
