'use strict'
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
})

const preparedSQL = [
  `DROP TABLE IF EXISTS "model_position"`,
  `DROP TABLE IF EXISTS "flight_crew"`,
  `DROP TABLE IF EXISTS "account";`,
  `DROP TABLE IF EXISTS "role";`,
  `DROP TABLE IF EXISTS "meta_position";`,
  `DROP TABLE IF EXISTS "crew_position"`,
  `DROP TABLE IF EXISTS "pilot_status"`,
  `DROP TABLE IF EXISTS "pilot";`,
  `DROP TABLE IF EXISTS "flight"`,
  `DROP TABLE IF EXISTS "rank";`,
  `DROP TABLE IF EXISTS "aircraft";`,
  `DROP TABLE IF EXISTS "aircraft_model";`,
  `DROP TABLE IF EXISTS "aircraft_status"`,
  `DROP TABLE IF EXISTS "airspace";`,
  `DROP TABLE IF EXISTS "location"`,
  `DROP TABLE IF EXISTS "user_status"`,
  `DROP EXTENSION IF EXISTS "uuid-ossp";`
];

dropTables(preparedSQL);

async function dropTables(sqlList) {
  let success = 1;
  let client;
  try {
    client = await pool.connect();
    for (const sql of sqlList) {
      await client.query(sql);
    }
    client.release();
  } catch (err) {
    if (client) client.release();
    console.log("Postgress Error:\n", err);
	  success = 0;
  } 
  if (success) {
    console.log("Tables successfully dropped");
  } else {
    console.log("Tables failed to drop.");
  }
  process.exit();
}
