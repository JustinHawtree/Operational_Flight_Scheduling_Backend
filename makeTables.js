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
  /* Allows for the use of UUIDs to be used for the public facing ids in our API */
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,

  /* A enum of the flight experience a pilot can have */
  `CREATE TABLE pilot_status (
      status VARCHAR(5),
      PRIMARY KEY(status)
  );`,
  `INSERT INTO pilot_status (status)
      VALUES ('N/A'), ('UP'), ('FP'), ('MP'), ('IP'), ('EP');`,


  /* The position of a person on any given aircraft */
  `CREATE TABLE crew_position (
      position VARCHAR(20),
      PRIMARY KEY(position)
  );`,
  `INSERT INTO crew_position (position)
      VALUES ('Pilot'), ('Copilot'), ('Loader'), ('Gunner');`,


  `CREATE TABLE role (
      role_name VARCHAR(20),
      PRIMARY KEY(role_name)
  )`,
  `INSERT INTO role (role_name)
      VALUES ('Admin'), ('Scheduler'), ('User');`,


  /* The rank for a given member of the air force */
	`CREATE TABLE rank (
      rank_id INT GENERATED ALWAYS AS IDENTITY,
      rank_name VARCHAR(50) UNIQUE NOT NULL,
      priority SMALLINT UNIQUE NOT NULL,
      pay_grade VARCHAR(4) NOT NULL,
      abbreviation VARCHAR(5) NOT NULL,
      PRIMARY KEY(rank_id)
  );`,
  `INSERT INTO rank (rank_name, priority, pay_grade, abbreviation)
      VALUES ('Airman Basic', 1, 'E-1', 'AB'),
             ('Airman', 2, 'E-2', 'Amn'),
             ('Airman First Class', 3, 'E-3', 'A1C'),
             ('Senior Airman', 4, 'E-4', 'SrA'),
             ('Staff Sergeant', 5, 'E-5', 'SSgt'),
             ('Technical Sergeant', 6, 'E-6', 'TSgt'),
             ('Master Sergeant', 7, 'E-7', 'MSgt'),
             ('Senior Master Sergeant', 8, 'E-8', 'SMSgt'),
             ('Chief Master Sergeant', 9, 'E-9', 'CMSgt'),
             ('Command Cheif Master Sergeant', 10, 'E-9', 'CCM'),
             ('Chief Master Sergeant Of The Air Force', 11, 'E-9', 'CMSAF'),
             ('Second Lieutenant', 12, 'O-1', '2d Lt'),
             ('First Lieutenant', 13, 'O-2', '1st L'),
             ('Captain', 14, 'O-3', 'Capt'),
             ('Major', 15, 'O-4', 'Maj'),
             ('Lieutenant Colonel', 16, 'O-5', 'Lt Co'),
             ('Colonel', 17, 'O-6', 'Col'),
             ('Brigadier General', 18, 'O-7', 'Brig'),
             ('Major General', 19, 'O-8', 'Maj G'),
             ('Lieutenant General', 20, 'O-9', 'Lt Ge'),
             ('General', 21, 'O-10', 'Gen'),
             ('General of the Air Force', 22, 'O-10', 'GAF');`,
  

  /* General account, holds login info and using the flight experience enum */
  `CREATE TABLE account (
      account_id INT GENERATED ALWAYS AS IDENTITY,
      account_uuid uuid DEFAULT uuid_generate_v4(),
      email VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      military_id VARCHAR(50) UNIQUE NOT NULL,
      accepted BOOLEAN NOT NULL DEFAULT FALSE,
      rank_id INT NOT NULL DEFAULT 1,
      pilot_status VARCHAR(5) DEFAULT 'N/A',
      role VARCHAR(20) NOT NULL DEFAULT 'User',
      created_on TIMESTAMP,
      last_login TIMESTAMP,
      FOREIGN KEY (rank_id) REFERENCES rank (rank_id),
      FOREIGN KEY (pilot_status) REFERENCES pilot_status (status),
      FOREIGN KEY (role) REFERENCES role (role_name),
      PRIMARY KEY (account_id)
  );`,

  `INSERT INTO account (email, password, first_name, last_name, military_id, role, accepted, pilot_status)
    VALUES ('admin@home.com', '$2b$10$pFjaR2eMGfdpoKnLAXM46uyafjDVbWO8WjpcG.oR9Cspfkmq3W9tK', 'Daniel', 'Lam', '321', 'Admin', TRUE, 'EP'),
           ('admin@gmail.com', '$2b$10$yXFKoxeb3o/9AWuS5DSyLekD.1cL4Ggu5Wu42Sc.4RthXujCM.IAu', 'Admin', 'Admin', '-1', 'Admin', TRUE, 'EP'),
           ('im@home.com', '$2b$10$w3PHCj3iOKJpUdodvRv6N.yP4DJB9twfrayhcg/42LmSBRjW6QPbS', 'Kenny', 'Cheng', '12345', 'Admin', TRUE, 'EP');`,
    

  `CREATE TABLE aircraft_model (
      model_id INT GENERATED ALWAYS AS IDENTITY,
      name VARCHAR(50) UNIQUE NOT NULL,
      pilot BOOLEAN NOT NULL,
      copilot BOOLEAN NOT NULL,
      loader BOOLEAN NOT NULL,
      gunner BOOLEAN NOT NULL,
      PRIMARY KEY (model_id)
  );`,


  `CREATE TABLE aircraft (
      aircraft_id INT GENERATED ALWAYS AS IDENTITY,
      type_id INT,
      status VARCHAR(50),
      PRIMARY KEY(aircraft_id),
      FOREIGN KEY (type_id) REFERENCES aircraft_model (model_id)
  );`,


  `CREATE TABLE location (
      location_id INT GENERATED ALWAYS AS IDENTITY,
      name VARCHAR(20),
      track_num SMALLINT,
      PRIMARY KEY (location_id)
  );`,


  `CREATE TABLE flight (
      flight_id INT GENERATED ALWAYS AS IDENTITY,
      aircraft_id INT,
      location_id INT,
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      PRIMARY KEY (flight_id),
      FOREIGN KEY (aircraft_id) REFERENCES aircraft (aircraft_id),
      FOREIGN KEY (location_id) REFERENCES location (location_id)
  );`,


  `CREATE TABLE flight_pilot (
      flight_pilot_id INT GENERATED ALWAYS AS IDENTITY,
      flight_id INT,
      account_id INT,
      position VARCHAR(20),
      PRIMARY KEY (flight_pilot_id),
      FOREIGN KEY (flight_id) REFERENCES flight (flight_id),
      FOREIGN KEY (account_id) REFERENCES account (account_id),
      FOREIGN KEY (position) REFERENCES crew_position (position)
  );`
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
