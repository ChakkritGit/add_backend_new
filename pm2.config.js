module.exports = {
  apps: [
    {
      name: 'add-backend',
      script: 'dist/index.js',
      interpreter: 'node',
      exec_mode: 'fork',
      autorestart: true,

      watch: false,
      max_memory_restart: '500M',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      env: {
        SERVER_PORT: 3000,
        TCP_PORT: 2004,
        CRYPTO_SECRET:
          'd8e3fcd6ae5a422f173efb2a2a73b48f115a48601add61df363837a8590e0130',
        JWT_SECRET:
          'd8e3fcd6ae5a422f173efb2a2a73b48f115a48601add61df363837a8590e0130',
        DATABASE_URL: 'postgresql://admin:admin@localhost:5432/add_backend',
        RABBIT_HOST: 'localhost',
        RABBIT_PORT: 5672,
        RABBIT_USER: 'admin',
        RABBIT_PASS: 'admin',
        PHARMACY_API_URL: 'http://pharmacy.api/service',
        NODE_ENV: 'production',
        LOG_LEVEL: 'INFO'
      }
    }
  ]
}

// pm2 install pm2-logrotate

// pm2 set pm2-logrotate:retain 30
// pm2 set pm2-logrotate:compress true
// pm2 set pm2-logrotate:dateFormat YYYY-MM-DD
// pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

// pm2 conf
