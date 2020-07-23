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
	    user_id SERIAL,
	    username VARCHAR(50) UNIQUE NOT NULL,
	    password VARCHAR (100) NOT NULL,
	    email VARCHAR (50) UNIQUE NOT NULL,
	    created_on TIMESTAMP,
	    last_login TIMESTAMP,
	    PRIMARY KEY (user_id)
    );`,

    `CREATE TABLE pilot(
	    pilot_id SERIAL,
	    first_name VARCHAR(30),
	    last_name VARCHAR(30),
	    rank SERIAL,
	    FOREIGN KEY (rank) REFERENCES ranks (id),
	    FOREIGN KEY (pilot_id) REFERENCES account (user_id)
    );`,
	
    `CREATE TABLE rank(
	    id SERIAL,
	    rank VARCHAR(50) UNIQUE NOT NULL,
	    priority SMALLINT UNIQUE NOT NULL,
	    can_fly BOOLEAN NOT NULL,
	    PRIMARY KEY(id)
    );`,
    
    `CREATE TABLE aircraft_type(
	    id SERIAL,
	    name VARCHAR(50) UNIQUE NOT NULL,
	    airspace VARCHAR(50) NOT NULL,
	    people_required INTEGER NOT NULL,
	    PRIMARY KEY (id)
     );`,

     `CREATE TABLE aircraft_record(
	    aircraft_id INTEGER,
	    type_id SERIAL,
	    maintenance_status VARCHAR(50),
	    PRIMARY KEY(aircraft_id),
	    FOREIGN KEY (type_id) REFERENCES aircraft_type (id)
    );`,

    `CREATE TABLE airspace(
	    id SERIAL,
	    name VARCHAR(50) UNIQUE NOT NULL,
	    lower_altitude INTEGER NOT NULL,
	    upper_altitude INTEGER NOT NULL,
	    PRIMARY KEY (id)
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
