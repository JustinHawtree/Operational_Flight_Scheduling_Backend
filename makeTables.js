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
	`CREATE TABLE rank (
	    rank_id INT GENERATED ALWAYS AS IDENTITY,
	    rank VARCHAR(50) UNIQUE NOT NULL,
	    priority SMALLINT UNIQUE NOT NULL,
	    can_fly BOOLEAN NOT NULL,
	    PRIMARY KEY(rank_id)
	);`,
	
    `CREATE TABLE account (
	    account_id INT GENERATED ALWAYS AS IDENTITY,
	    username VARCHAR(50) UNIQUE NOT NULL,
	    password VARCHAR (100) NOT NULL,
		email VARCHAR (50) UNIQUE NOT NULL,
		first_name VARCHAR(30),
		last_name VARCHAR(30),
		rank_id INT,
	    created_on TIMESTAMP,
		last_login TIMESTAMP,
	    FOREIGN KEY (rank_id) REFERENCES rank (rank_id),
	    PRIMARY KEY (account_id)
    );`,
    
    `CREATE TABLE aircraft_model (
	    model_id INT GENERATED ALWAYS AS IDENTITY,
	    name VARCHAR(50) UNIQUE NOT NULL,
	    people_required INTEGER NOT NULL,
	    PRIMARY KEY (model_id)
	 );`,
	 //	airspace VARCHAR(50) NOT NULL,

     `CREATE TABLE aircraft (
	    aircraft_id INT GENERATED ALWAYS AS IDENTITY,
	    type_id INT,
	    status VARCHAR(50),
	    PRIMARY KEY(aircraft_id),
	    FOREIGN KEY (type_id) REFERENCES aircraft_model (model_id)
    );`,

    `CREATE TABLE airspace (
	    airspace_id INT GENERATED ALWAYS AS IDENTITY,
	    name VARCHAR(50) UNIQUE NOT NULL,
	    lower_altitude INTEGER NOT NULL,
	    upper_altitude INTEGER NOT NULL,
	    PRIMARY KEY (airspace_id)
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
