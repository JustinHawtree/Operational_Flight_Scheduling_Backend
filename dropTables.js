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

let preparedSQL = [
   `DROP TABLE IF EXISTS "account";`
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
    } catch (err) {
    	console.log("Postgress Error:\n", err);
	success = 0;
    }
    if (client) {
	client.release();
    } 
    if (success) {
	    console.log("Tables successfully dropped");
    } else {
	    console.log("Tables failed to drop.");
    }
    process.exit();
}
