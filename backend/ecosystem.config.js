/**
 * PM2 — keeps backend running after crash/restart on Spaceship VPS
 * Usage: pm2 start ecosystem.config.js && pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'dr-mahar-api',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_restarts: 20,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
