const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const http = require('http');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// pnpm hoists to the monorepo root — Metro needs to watch there
config.watchFolders = [monorepoRoot];

// Resolve modules from both the project and the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure Metro doesn't choke on symlinked packages
config.resolver.disableHierarchicalLookup = false;

// Proxy /api and /health requests to the Fastify server on port 3000.
// This avoids CORS issues in cloud IDE environments (Coder, Gitpod, etc.)
// where each port gets a different origin.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url.startsWith('/api/') || req.url.startsWith('/health')) {
        const proxyReq = http.request(
          {
            hostname: 'localhost',
            port: 3000,
            path: req.url,
            method: req.method,
            headers: { ...req.headers, host: 'localhost:3000' },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          }
        );
        proxyReq.on('error', () => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API server not reachable on localhost:3000' }));
        });
        req.pipe(proxyReq, { end: true });
        return;
      }
      middleware(req, res, next);
    };
  },
};

module.exports = config;
