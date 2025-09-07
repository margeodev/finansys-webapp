const PROXY_CONFIG = [
  {
    context: ['/auth', '/api'],
    target: 'http://localhost:8080',
    // target: 'https://finansys-api-production.up.railway.app',
    secure: false,
    logLevel: 'debug',
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;
