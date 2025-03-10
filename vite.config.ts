import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { type BuildOptions, defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';
import tailwindcss from '@tailwindcss/vite';

function generateManifest() {
  const manifest = readJsonFile('src/manifest.json');
  const pkg = readJsonFile('package.json');
  return {
    name: 'PublicAI Data Hunter',
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  const build: BuildOptions = isDev
    ? { outDir: 'dist-test' }
    : {
        minify: 'terser',
        terserOptions: {
          compress: {
            dead_code: true,
            drop_console: true,
          },
          format: {
            comments: false,
          },
        },
      };

  return {
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
      webExtension({
        additionalInputs: [
          'src/offscreen.html',
          'src/offscreen.tsx',
          'src/pages/Offscreen.tsx',
        ],
        manifest: generateManifest,
      }),
    ],
    resolve: {
      alias: {
        // In dev mode, make sure fast refresh works
        '/@react-refresh': path.resolve(
          'node_modules/@vitejs/plugin-react-swc/refresh-runtime.js',
        ),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build,
  };
});
