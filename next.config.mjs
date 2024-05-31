/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
    outputFileTracingIncludes: {
      "/api/upload": "./node_modules/kzg-wasm/dist/wasm/kzg.wasm",
    },
  },
};

export default nextConfig;
