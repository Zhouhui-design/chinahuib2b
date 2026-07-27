module.exports = {
  apps: [
    {
      name: 'chinahuib2b-prod',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/chinahuib2b',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=4096',
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://x2xhub.com',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 10000,
      listen_timeout: 5000,
      shutdown_with_message: true,
      exp_backoff_restart_delay: 1000,
      max_restarts: 5,
      min_uptime: '30s',
      node_args: '--max-old-space-size=4096',
      exec_interpreter: 'node',
      exec_mode: 'cluster',
      health_check: {
        url: 'http://localhost:3000/api/health',
        interval: 30000,
        timeout: 5000,
        max_retries: 3,
      }
    }
  ]
}
