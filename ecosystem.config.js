module.exports = {
  apps: [
    {
      name: 'chinahuib2b-prod',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/chinahuib2b',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster', // Enable cluster mode
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        PRISMA_CLIENT_ENGINE_TYPE: 'binary',
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Advanced PM2 settings
      kill_timeout: 10000, // Extended timeout for graceful shutdown
      listen_timeout: 5000, // Extended timeout for server listening
      shutdown_with_message: true,
      // Auto restart settings - more conservative to prevent infinite restart loops
      exp_backoff_restart_delay: 1000, // Start with 1 second delay
      max_restarts: 5, // Limit restarts to prevent overload
      min_uptime: '30s', // Require at least 30 seconds uptime before considering stable
      // Cluster-specific settings
      node_args: '--max-old-space-size=4096',
      // Graceful reload settings
      exec_interpreter: 'node',
      exec_mode: 'cluster',
      // Health check settings
      health_check: {
        url: 'http://localhost:3000/api/health',
        interval: 30000,
        timeout: 5000,
        max_retries: 3,
      }
    }
  ]
}
