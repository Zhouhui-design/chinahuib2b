module.exports = {
  apps: [
    {
      name: 'chinahuib2b-next',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/chinahuib2b',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
