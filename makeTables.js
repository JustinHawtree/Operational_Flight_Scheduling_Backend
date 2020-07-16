'use strict';
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
});

const preparedSQL = [
    `CREATE TABLE account(
	    user_id serial PRIMARY KEY,
	    username VARCHAR(50) UNIQUE NOT NULL,
	    password VARCHAR (100) NOT NULL,
	    email VARCHAR (50) UNIQUE NOT NULL,
	    created_on TIMESTAMP,
	    last_login TIMESTAMP
    );`,
	
    `CREATE TABLE ranks(
	    id serial PRIMARY KEY,
	    rank VARCHAR(50) UNIQUE NOT NULL,
	    priority SMALLINT UNIQUE NOT NULL,
	    got_wings BOOLEAN NOT NULL
    );`,
    
    `CREATE TABLE aircraft(
	    id serial PRIMARY KEY,
	    name VARCHAR(50) UNIQUE NOT NULL,
	    airspace VARCHAR(50) NOT NULL,
	    people_required INTEGER NOT NULL,
     );`,

    `CREATE TABLE airspace(
	    id serial PRIMARY KEY,
	    name VARCHAR(50) UNIQUE NOT NULL,
     );`,
];

makeTables();
async function makeTables() {
    await setupDatabase(preparedSQL);
    process.exit();
}

async function setupDatabase(sqlList) {
    let success = 1;
    let client;
    try {
    client = await pool.connect();
	for(const sql of sqlList) {
	    await client.query(sql);    
    }
} catch (err) {
    console.log("Postgres Error:\n", err);
    success = 0;
}
if(client) {
    client.release();
}
if (success) {
    console.log("Tables successfully created");
} else {
    console.log("Tables failed");
}
}
