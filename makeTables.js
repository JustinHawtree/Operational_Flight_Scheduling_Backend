'use strict';
require('dotenv').config();
const moment = require('moment');
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
      account_uuid uuid UNIQUE DEFAULT uuid_generate_v4(),
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
      user_status VARCHAR(30),
      FOREIGN KEY (rank_id) REFERENCES rank (rank_id),
      FOREIGN KEY (pilot_status) REFERENCES pilot_status (status),
      FOREIGN KEY (role) REFERENCES role (role_name),
      FOREIGN KEY (user_status) REFERENCES user_status (status),
      PRIMARY KEY (account_id)
  );`,

  `CREATE TABLE user_status (
    status_id INT GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL,
    status VARCHAR(30) UNIQUE NOT NULL,
    PRIMARY KEY (status)
  );`,

  `INSERT INTO user_status (status)
      VALUES ('Available'),
             ('Active_Duty_Available'),
             ('Deployed_Unavailable'),
             ('Unavailable')`,   



   //  TODO: make an approved default user
  `INSERT INTO account (email, password, first_name, last_name, military_id, role, accepted, pilot_status)
      VALUES ('admin@home.com', '$2b$10$pFjaR2eMGfdpoKnLAXM46uyafjDVbWO8WjpcG.oR9Cspfkmq3W9tK', 'Daniel', 'Lam', '321', 'Admin', TRUE, 'EP'),
             ('admin@gmail.com', '$2b$10$yXFKoxeb3o/9AWuS5DSyLekD.1cL4Ggu5Wu42Sc.4RthXujCM.IAu', 'Admin', 'Admin', '-1', 'Admin', TRUE, 'EP'),
             ('im@home.com', '$2b$10$w3PHCj3iOKJpUdodvRv6N.yP4DJB9twfrayhcg/42LmSBRjW6QPbS', 'Kenny', 'Cheng', '12345', 'Admin', TRUE, 'EP');`,
    





  `CREATE TABLE aircraft_model (
      model_id INT GENERATED ALWAYS AS IDENTITY,
      model_name VARCHAR(50) UNIQUE NOT NULL,
      PRIMARY KEY (model_id)
  );`,

  `INSERT INTO aircraft_model (model_name)
      VALUES ('A-10 Thunderbolt ii'),
             ('HC-130J Combat King ii'),
             ('HH-60 Pave Hawk')`,
  
  /* The position of a person on any given aircraft */
  `CREATE TABLE crew_position (
      crew_position_id INT GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL,
      position VARCHAR(30) NOT NULL,
      required BOOLEAN NOT NULL,
      PRIMARY KEY(position, required)
  );`,

  `INSERT INTO crew_position (position, required)
      VALUES ('Pilot', TRUE),
             ('Copilot', TRUE),
             ('Load-Master', TRUE),
             ('Load-Master', FALSE),
             ('Combat System Officer', TRUE),
             ('Flight Engineer', TRUE),
             ('Gunner', TRUE);`,

  `CREATE TABLE model_position (
      model_position_id INT GENERATED ALWAYS AS IDENTITY,
      model_id INT,
      crew_position_id INT,
      PRIMARY KEY (model_position_id),
      FOREIGN KEY (model_id) REFERENCES aircraft_model (model_id),
      FOREIGN KEY (crew_position_id) REFERENCES crew_position (crew_position_id)
  )`,

  `INSERT INTO model_position (model_id, crew_position_id)
      VALUES (1, 1),
             (2, 1),
             (2, 2),
             (2, 5),
             (2, 3),
             (2, 4),
             (3, 1),
             (3, 2),
             (3, 6),
             (3, 7)`,

/* Denote the status of a specific aircraft */
`CREATE TABLE aircraft_status (
    status_id INT GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL,
    status VARCHAR(20) UNIQUE NOT NULL,
    PRIMARY KEY (status)
);`,

`INSERT INTO aircraft_status (status)
    VALUES ('Available'),
           ('Unavailable'),
           ('In_Maintenance')`,         

  `CREATE TABLE aircraft (
      aircraft_id INT GENERATED ALWAYS AS IDENTITY,
      aircraft_uuid uuid UNIQUE DEFAULT uuid_generate_v4(),
      model_id INT,
      status VARCHAR(20),
      PRIMARY KEY(aircraft_id),
      FOREIGN KEY (model_id) REFERENCES aircraft_model (model_id),
      FOREIGN KEY (status) REFERENCES aircraft_status (status)
  );`,


  `INSERT INTO aircraft (model_id, status)
      VALUES (2, 'Available')`,











  `CREATE TABLE location (
      location_id INT GENERATED ALWAYS AS IDENTITY,
      location_uuid uuid UNIQUE DEFAULT uuid_generate_v4(),
      name VARCHAR(20),
      track_num SMALLINT,
      PRIMARY KEY (location_id)
  );`,

  `INSERT INTO location (name, track_num)
      VALUES ('Fort Mooty', 420),
             ('Mooty 1', 724),
             ('Mooty 2', 725),
             ('Mooty 3', 726)`,


  `CREATE TABLE flight (
      flight_id INT GENERATED ALWAYS AS IDENTITY,
      flight_uuid uuid UNIQUE DEFAULT uuid_generate_v4(),
      aircraft_id INT,
      location_id INT,
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      color VARCHAR(30),
      title VARCHAR(50),
      description VARCHAR(200),
      PRIMARY KEY (flight_id),
      FOREIGN KEY (aircraft_id) REFERENCES aircraft (aircraft_id),
      FOREIGN KEY (location_id) REFERENCES location (location_id)
  );`,

  `INSERT INTO flight (aircraft_id, location_id, start_time, end_time, color, title, description)
      VALUES (1, 1, '${moment().format()}', '${moment().add(4, 'h').format()}', '#eb8334', 'Mock Flight', 'Mock Flight testing backend')`,


  `CREATE TABLE flight_pilot (
      flight_pilot_id INT GENERATED ALWAYS AS IDENTITY,
      flight_id INT,
      account_id INT,
      crew_position_id INT,
      PRIMARY KEY (flight_pilot_id),
      FOREIGN KEY (flight_id) REFERENCES flight (flight_id),
      FOREIGN KEY (account_id) REFERENCES account (account_id),
      FOREIGN KEY (crew_position_id) REFERENCES crew_position (crew_position_id)
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
    client.release();
  } catch (err) {
      if (client) client.release();
      console.log("Postgres Error:\n", err);
      success = 0;
  }
  if (success) {
      console.log("Tables successfully created");
  } else {
      console.log("Tables failed");
  }
}
