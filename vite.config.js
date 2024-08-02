import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import packageJSON from './package.json';

const manifest = {
  name: 'Envault',
  short_name: 'Envault',
  description: 'Your data, your way.',
  theme_color: '#131313',
  background_color: '#001b54',
  display: 'standalone',
  icons: [
    {
      src: 'pwa-64x64.png',
      sizes: '64x64',
      type: 'image/png',
    },
    {
      src: 'pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: 'maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

const workbox = {
  globPatterns: ['**/*.{js,css,html,png,svg,ttf,webmanifest}'],
  skipWaiting: true,
  clientsClaim: true,
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [
    // Exclude URLs starting with /api
    /^\/api/,
    // Exclude URLs containing a dot, e.g. /index.html
    /\/[^/]*\.[^/]*$/,
  ],
  runtimeCaching: [
    {
      // Network first for API calls
      urlPattern: /^\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
  ],
};

export default defineConfig(({mode}) => {
  /*global process*/
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root: 'src',
    envDir: '../',
    build: {
      outDir: '../dist',
      rollupOptions: {
        output: {
          chunkFileNames: 'chunks/[hash].js',
          assetFileNames: 'assets/[hash][extname]',
        },
      },
    },
    define: {
      __BUILD_VERSION__: JSON.stringify(packageJSON.version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    plugins: [
      react({
        include: '**/*.{jsx,tsx}',
        babel: {
          plugins: ['antd-style'],
        },
      }),
      svgr({
        svgrOptions: {
          memo: true,
          svgo: true,
          plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        },
      }),
      basicSsl(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: workbox,
        manifest: manifest,
      }),
    ],
    resolve: {
      alias: {
        /*global __dirname */
        app: path.resolve(__dirname, 'src/app/'),
        assets: path.resolve(__dirname, 'src/app/assets/'),
        components: path.resolve(__dirname, 'src/app/components'),
        config: path.resolve(__dirname, 'src/app/config'),
        constant: path.resolve(__dirname, 'src/app/constant'),
        layouts: path.resolve(__dirname, 'src/app/layouts'),
        pages: path.resolve(__dirname, 'src/app/pages'),
        services: path.resolve(__dirname, 'src/app/services'),
        api: path.resolve(__dirname, 'src/app/services/api'),
        hooks: path.resolve(__dirname, 'src/app/services/hooks'),
        utils: path.resolve(__dirname, 'src/app/utils'),
      },
      extensions: ['.js', '.jsx'],
    },
    server: {
      host: env.APP_HOST,
      port: env.APP_PORT,
      https: true,
      server: {
        open: true,
      },
      proxy: {
        '/api': {
          target: `${env.API_HOST}:${env.API_PORT}`,
          cookieDomainRewrite: '',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
