import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev, dir }) => {
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });
    if (isServer) {
      if (dev) {
        config.plugins.push(
          new CopyWebpackPlugin({
            patterns: [
              {
                from: path.resolve("node_modules/kzg-wasm/dist/wasm/kzg.wasm"),
                to: path.resolve(".next/server/wasm/kzg.wasm"),
              },
            ],
          })
        );
      } else {
        config.plugins.push(
          new CopyWebpackPlugin({
            patterns: [
              {
                from: path.resolve("node_modules/kzg-wasm/dist/wasm/kzg.wasm"),
                to: path.resolve(".next/server/app/api/wasm/kzg.wasm"),
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
