const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.rpxgjrngdldfzvmeskyc',
  password: '223245Eli.!',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;