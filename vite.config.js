import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import autoprefixer from "autoprefixer";
import path from "path";

const production = !process.env.ROLLUP_WATCH;

const resolve = (p) => {
  return path.resolve(__dirname, p);
};

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return defineConfig({
    base: "",
    define: {
      "process.env": production ? {} : process.env,
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess({
          typescript: true,
          scss: true,
          postcss: {
            plugins: [autoprefixer()],
          },
        }),
        compilerOptions: {
          dev: !production,
          // 添加样式隔离，防止与其他系统样式冲突
          cssHash: ({ css, hash }) => {
            return `shopify-${hash(css)}`;
          },
        },
        // 关键配置：确保CSS内联到JS文件中
        emitCss: false,
      }),
    ],
    resolve: {
      alias: {
        "@": resolve("./src"),
        "@components": resolve("./src/components"),
        "@services": resolve("./src/services"),
        "@types": resolve("./src/types"),
      },
      // 避免重复打包Svelte
      dedupe: ["svelte", "svelte/transition", "svelte/internal"],
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        extensions: [".js", ".cjs", ".ts", ".svelte"],
        strictRequires: true,
      },
      lib: {
        entry: `src/index.ts`,
        formats: ["iife"],
        name: "ShopifyHistory",
        fileName: (format) => {
          if (format === "iife") {
            return "shopify-history.js";
          } else {
            return `shopify-history.${format}.js`;
          }
        },
      },
      sourcemap: false,
      // 使用Vite 5默认的esbuild，无需额外依赖
      //   minify: "esbuild",
      target: "es2015", // 兼容性目标
    },
  });
};
