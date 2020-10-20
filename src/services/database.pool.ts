require('dotenv').config();
const { Pool } = require('pg');

export const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

pool.on('error', (err: any, client: any) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
})