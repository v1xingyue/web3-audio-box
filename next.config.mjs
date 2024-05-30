import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config, { isServer, dev, dir }) => {
    if (isServer) {
      if (dev) {
        config.plugins.push(
          new CopyWebpackPlugin({
            patterns: [
              {
                from: path.resolve(
                  dir,
                  "node_modules/kzg-wasm/dist/wasm/kzg.wasm"
                ),
                to: path.resolve(dir, ".next/server/wasm/kzg.wasm"),
              },
            ],
          })
        );
      } else {
        config.plugins.push(
          new CopyWebpackPlugin({
            patterns: [
              {
                from: path.resolve(
                  dir,
                  "node_modules/kzg-wasm/dist/wasm/kzg.wasm"
                ),
                to: path.resolve(dir, ".next/server/app/api/wasm/kzg.wasm"),
              },
            ],
          })
        );
      }
    }
    return config;
  },
};

export default nextConfig;
