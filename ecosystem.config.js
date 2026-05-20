module.exports = {
  apps: [
    {
      name: 'chinahuib2b-next',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/sardenesy/projects/chinahuib2b',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXTAUTH_SECRET: 'super-secret-key-change-in-production-12345678',
        NEXTAUTH_URL: 'https://chinahuib2b.top',
        DATABASE_URL: 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
        REDIS_URL: 'redis://localhost:6379'
      },
      error_file: '/home/sardenesy/projects/chinahuib2b/logs/err.log',
      out_file: '/home/sardenesy/projects/chinahuib2b/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
