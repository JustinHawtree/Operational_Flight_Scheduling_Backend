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

// TODO:
  // Create another table that links users to a universal crew position "rank"
  // Create another table that links universal ranks to crew_positions
  // Aircrafts need an generated id like  MY 12-3456
    // First 2 Letters represent the Aircraft Base Code
    // First 2 Numbers represent the year of order for that aircraft
    // Last 4 Numbers is in serial from that ordered year of aircrafts 

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
      rank_uuid UUID DEFAULT uuid_generate_v4(),
      rank_name VARCHAR(50) UNIQUE NOT NULL,
      priority SMALLINT UNIQUE NOT NULL,
      pay_grade VARCHAR(4) NOT NULL,
      abbreviation VARCHAR(5) NOT NULL,
      PRIMARY KEY(rank_uuid)
  );`,

  `INSERT INTO rank (rank_uuid, rank_name, priority, pay_grade, abbreviation)
      VALUES ('05b8945b-4480-47cf-a3b0-926217abadac', 'Airman Basic', 1, 'E-1', 'AB');`,

  `INSERT INTO rank (rank_name, priority, pay_grade, abbreviation)
      VALUES ('Airman', 2, 'E-2', 'Amn'),
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

 `CREATE TABLE user_status (
      status_uuid UUID UNIQUE DEFAULT uuid_generate_v4() NOT NULL,
      status VARCHAR(30) UNIQUE NOT NULL,
      PRIMARY KEY (status)
  );`,
            
  `INSERT INTO user_status (status)
       VALUES ('Available'),
              ('Active_Duty_Available'),
              ('Deployed_Unavailable'),
              ('Unavailable')`,     

  /* General account, holds login info and using the flight experience enum */
  `CREATE TABLE account (
      account_uuid UUID DEFAULT uuid_generate_v4(),
      email VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      accepted BOOLEAN NOT NULL DEFAULT FALSE,
      rank_uuid uuid NOT NULL DEFAULT '05b8945b-4480-47cf-a3b0-926217abadac',
      pilot_status VARCHAR(5) DEFAULT 'N/A',
      role VARCHAR(20) NOT NULL DEFAULT 'User',
      created_on TIMESTAMP,
      last_login TIMESTAMP,
      user_status VARCHAR(30) NOT NULL DEFAULT 'Available',
      FOREIGN KEY (rank_uuid) REFERENCES rank (rank_uuid),
      FOREIGN KEY (pilot_status) REFERENCES pilot_status (status),
      FOREIGN KEY (role) REFERENCES role (role_name),
      FOREIGN KEY (user_status) REFERENCES user_status (status),
      PRIMARY KEY (account_uuid)
  );`,


   //  TODO: make an approved default user
  `INSERT INTO account (email, password, first_name, last_name, role, accepted, pilot_status)
      VALUES ('admin@home.com', '$2b$10$pFjaR2eMGfdpoKnLAXM46uyafjDVbWO8WjpcG.oR9Cspfkmq3W9tK', 'Daniel', 'Lam', 'Admin', TRUE, 'EP'),
             ('admin@gmail.com', '$2b$10$yXFKoxeb3o/9AWuS5DSyLekD.1cL4Ggu5Wu42Sc.4RthXujCM.IAu', 'Admin', 'Admin', 'Admin', TRUE, 'EP'),
             ('im@home.com', '$2b$10$w3PHCj3iOKJpUdodvRv6N.yP4DJB9twfrayhcg/42LmSBRjW6QPbS', 'Kenny', 'Cheng', 'Admin', TRUE, 'EP'),
             ('user@user.com', '$2b$10$SS6ZJYEsv3eskzRb2m6tSusUt9SXolyrR8Wptggm5Oe4s72KKkBEK', 'User', 'User', 'User', TRUE, 'N/A'),
             ('scheduler@gmail.com', '$2b$10$pFjaR2eMGfdpoKnLAXM46uyafjDVbWO8WjpcG.oR9Cspfkmq3W9tK', 'scheduler', 'scheduler', 'Scheduler', TRUE, 'N/A');`,

   `INSERT INTO account (account_uuid, email, password, first_name, last_name, role, accepted, pilot_status)
      VALUES ('8880549d-40c6-4efe-a9dc-f3f276fb8837', 'pilot1@gmail.com', '$2b$10$pFjaR2eMGfdpoKnLAXM46uyafjDVbWO8WjpcG.oR9Cspfkmq3W9tK', 'John', 'Doe', 'User', TRUE, 'FP'),
             ('d205a550-f6e5-47ce-a9e1-f2fc0e2cb113', 'pilot2@gmail.com', '$2b$10$pFjaR2eMGfdpoKnLAXM46uyafjDVbWO8WjpcG.oR9Cspfkmq3W9tK', 'Jane', 'Doe', 'User', TRUE, 'FP');`,
    





  `CREATE TABLE aircraft_model (
      model_uuid UUID DEFAULT uuid_generate_v4(),
      model_name VARCHAR(50) UNIQUE NOT NULL,
      PRIMARY KEY (model_uuid)
  );`,

  `INSERT INTO aircraft_model (model_uuid, model_name)
      VALUES ('b0f4cd21-9e4c-4b4d-b4ae-88668b492a7b', 'A-10C Thunderbolt Ⅱ'),
             ('2c04be67-fc24-4eba-b6ca-57c81daab9c4', 'HC-130J Combat King Ⅱ'),
             ('db2863ea-369e-4262-ad17-bda986ae9632', 'HH-60 Pave Hawk');`,
  
  /* The position of a person on any given aircraft */
  `CREATE TABLE crew_position (
      crew_position_uuid UUID UNIQUE DEFAULT uuid_generate_v4() NOT NULL,
      position VARCHAR(30) NOT NULL,
      required BOOLEAN NOT NULL,
      PRIMARY KEY(position, required)
  );`,

  `INSERT INTO crew_position (crew_position_uuid, position, required)
      VALUES ('b15bd146-0d92-4080-9740-2112fed365fd', 'Pilot', TRUE),
             ('991dd169-dc45-4049-8a8d-58173d66223b', 'Copilot', TRUE),
             ('f45f9297-c7af-40ef-88cc-6c137e44b534', 'Load-Master', TRUE),
             ('e770fd78-2d5a-4065-a01c-8dcb1cd2e558', 'Load-Master', FALSE),
             ('0ddfcd5e-54e8-4571-8fdf-3630fd484f6c', 'Combat System Officer', TRUE),
             ('1785b149-862d-46ca-b4cd-73b975de19dd', 'Flight Engineer', TRUE),
             ('f6d5268e-69d4-4cd0-b932-610341143548', 'Gunner', TRUE);`,

  `CREATE TABLE model_position (
      model_position_uuid UUID DEFAULT uuid_generate_v4(),
      model_uuid UUID,
      crew_position_uuid UUID,
      PRIMARY KEY (model_position_uuid),
      FOREIGN KEY (model_uuid) REFERENCES aircraft_model (model_uuid),
      FOREIGN KEY (crew_position_uuid) REFERENCES crew_position (crew_position_uuid)
  )`,

  `INSERT INTO model_position (model_uuid, crew_position_uuid)
      VALUES ('b0f4cd21-9e4c-4b4d-b4ae-88668b492a7b', 'b15bd146-0d92-4080-9740-2112fed365fd'),
             ('2c04be67-fc24-4eba-b6ca-57c81daab9c4', 'b15bd146-0d92-4080-9740-2112fed365fd'),
             ('2c04be67-fc24-4eba-b6ca-57c81daab9c4', '991dd169-dc45-4049-8a8d-58173d66223b'),
             ('2c04be67-fc24-4eba-b6ca-57c81daab9c4', 'f45f9297-c7af-40ef-88cc-6c137e44b534'),
             ('2c04be67-fc24-4eba-b6ca-57c81daab9c4', 'e770fd78-2d5a-4065-a01c-8dcb1cd2e558'),
             ('2c04be67-fc24-4eba-b6ca-57c81daab9c4', '0ddfcd5e-54e8-4571-8fdf-3630fd484f6c'),
             ('db2863ea-369e-4262-ad17-bda986ae9632', 'b15bd146-0d92-4080-9740-2112fed365fd'),
             ('db2863ea-369e-4262-ad17-bda986ae9632', '991dd169-dc45-4049-8a8d-58173d66223b'),
             ('db2863ea-369e-4262-ad17-bda986ae9632', '1785b149-862d-46ca-b4cd-73b975de19dd'),
             ('db2863ea-369e-4262-ad17-bda986ae9632', 'f6d5268e-69d4-4cd0-b932-610341143548');`,


/* Denote the status of a specific aircraft */
`CREATE TABLE aircraft_status (
    status_uuid UUID UNIQUE DEFAULT uuid_generate_v4() NOT NULL,
    status VARCHAR(20) UNIQUE NOT NULL,
    PRIMARY KEY (status)
);`,

`INSERT INTO aircraft_status (status)
    VALUES ('Available'),
           ('Unavailable'),
           ('Under_Maintenance');`,         

  `CREATE TABLE aircraft (
      aircraft_uuid UUID DEFAULT uuid_generate_v4(),
      model_uuid UUID,
      status VARCHAR(20),
      PRIMARY KEY (aircraft_uuid),
      FOREIGN KEY (model_uuid) REFERENCES aircraft_model (model_uuid),
      FOREIGN KEY (status) REFERENCES aircraft_status (status)
  );`,


  `INSERT INTO aircraft (aircraft_uuid, model_uuid, status)
      VALUES ('63c6821a-fb98-418b-9336-c60beb837708', '2c04be67-fc24-4eba-b6ca-57c81daab9c4', 'Available'),
             ('5a3db7a6-ffea-427d-8093-4c2d26392fb8', 'db2863ea-369e-4262-ad17-bda986ae9632', 'Available'),
             ('475eb3d2-5b9a-4efc-8a09-96849a136b00', 'b0f4cd21-9e4c-4b4d-b4ae-88668b492a7b', 'Available');`,



  `CREATE TABLE location (
      location_uuid UUID DEFAULT uuid_generate_v4(),
      location_name VARCHAR(20),
      track_num SMALLINT,
      PRIMARY KEY (location_uuid)
  );`,

  `INSERT INTO location (location_uuid, location_name, track_num)
      VALUES ('96017add-cf3d-4075-b09b-7fd9ad690e04', 'Fort Mooty', 420),
             ('ea703189-31ea-4235-bdbb-b017731fb29c', 'Mooty 1', 724),
             ('40ba35ba-92a9-4255-8960-e47b83df1cd0', 'Mooty 2', 725),
             ('a88796b2-9613-48d4-833f-77564e6e89a5', 'Mooty 3', 726);`,



  `CREATE TABLE flight (
      flight_uuid UUID DEFAULT uuid_generate_v4(),
      aircraft_uuid UUID,
      location_uuid UUID,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      color VARCHAR(30) NOT NULL,
      title VARCHAR(50) NOT NULL,
      description VARCHAR(200),
      all_day BOOLEAN NOT NULL DEFAULT FALSE,
      PRIMARY KEY (flight_uuid),
      FOREIGN KEY (aircraft_uuid) REFERENCES aircraft (aircraft_uuid),
      FOREIGN KEY (location_uuid) REFERENCES location (location_uuid)
  );`,

  `INSERT INTO flight (flight_uuid, aircraft_uuid, location_uuid, start_time, end_time, color, title, description, all_day)
      VALUES ('0bf6a55d-a5e7-4835-8d90-3a6bdd4f07d6', '63c6821a-fb98-418b-9336-c60beb837708', '96017add-cf3d-4075-b09b-7fd9ad690e04', '${moment().utc().format()}', '${moment().utc().add(4, 'h').format()}', '#eb8334', 'Mock Flight', 'Mock Flight testing backend', FALSE),
             ('e74aa81e-e861-4329-823c-0c646c3f3a38', '5a3db7a6-ffea-427d-8093-4c2d26392fb8', 'ea703189-31ea-4235-bdbb-b017731fb29c', '${moment().utc().add(2, 'h').format()}', '${moment().utc().add(6, 'h').format()}', '#eb8334', 'Mock Flight 2', 'Mock Flight testing backend 2', FALSE);`,


  `CREATE TABLE flight_crew (
      flight_crew_uuid UUID DEFAULT uuid_generate_v4(),
      flight_uuid UUID,
      account_uuid UUID,
      crew_position_uuid UUID,
      PRIMARY KEY (flight_crew_uuid),
      FOREIGN KEY (flight_uuid) REFERENCES flight (flight_uuid) ON DELETE CASCADE,
      FOREIGN KEY (account_uuid) REFERENCES account (account_uuid) ON DELETE CASCADE,
      FOREIGN KEY (crew_position_uuid) REFERENCES crew_position (crew_position_uuid)
  );`,

  `INSERT INTO flight_crew (flight_uuid, account_uuid, crew_position_uuid)
      VALUES ('0bf6a55d-a5e7-4835-8d90-3a6bdd4f07d6', '8880549d-40c6-4efe-a9dc-f3f276fb8837', 'b15bd146-0d92-4080-9740-2112fed365fd'),
             ('0bf6a55d-a5e7-4835-8d90-3a6bdd4f07d6', 'd205a550-f6e5-47ce-a9e1-f2fc0e2cb113', '991dd169-dc45-4049-8a8d-58173d66223b'),
             ('e74aa81e-e861-4329-823c-0c646c3f3a38', '8880549d-40c6-4efe-a9dc-f3f276fb8837', 'b15bd146-0d92-4080-9740-2112fed365fd');`
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
