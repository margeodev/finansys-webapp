require('dotenv').config();

const PROXY_CONFIG = [
  {
    context: ['/auth', '/api'],
    target: process.env.API_URL,
    secure: false,
    logLevel: 'debug',
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;