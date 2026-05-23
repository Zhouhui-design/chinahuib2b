module.exports = {
  apps: [
    {
      name: 'chinahuib2b-prod',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/chinahuib2b',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Advanced PM2 settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      // Auto restart settings
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
    }
  ]
}
