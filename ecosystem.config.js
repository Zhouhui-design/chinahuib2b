module.exports = {
  apps: [
    {
      name: 'chinahuib2b-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/chinahuib2b',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/chinahuib2b-error.log',
      out_file: '/var/log/pm2/chinahuib2b-out.log',
      log_file: '/var/log/pm2/chinahuib2b-combined.log',
      time: true,
    },
  ],
};
