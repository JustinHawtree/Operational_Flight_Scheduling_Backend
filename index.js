'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const validator = require('validator');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const jwtHttpOptions = {
  issuer: "scheduler",
  subject: "Main Auth",
  audience: "http://Scheduler.com",
  expiresIn: "2h",
  algorithm: "RS512"
}

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001']
}));


require('dotenv').config();
const { Pool } = require('pg');
const pg = require('pg');

// Needed for default type date in postgresql to utc, removing Z so javascript on the frontend can easily parse it.
// This will only work once the index.js starts, so any timestamps in the makeTables.js still need to explicitly be UTC.
pg.types.setTypeParser(1114, str => moment.utc(str).format().replace("Z", ""));

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

pool.on('error', (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

//Security keys for jwt 
const privateKey = fs.readFileSync('./private.key', 'utf8');
const publicKey = fs.readFileSync('./public.key', 'utf8');


function getHash(password) {
  return new Promise((resolve, reject) => {
    if (!password) reject("undefined/null password");
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        console.log("Bcrypt Error:", err);
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          console.log("Bcrypt Error:", err);
          reject(err);
        }
	      resolve(hash);
      });
    });
  });
}


function compareHash(plainPassword, hashPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainPassword, hashPassword, (err, result) => {
      if (err) {
        console.log("Bcrypt Error:", err);
        reject(err);
      }
      resolve(result);
     });
   });
}


function setToken(obj) {
  return new Promise((resolve, reject) => {
    let expires_in = 7200;
    // Small different way to get UTC timestamp
    let tokenDate = new Date().toISOString().replace("Z", "");
    jwt.sign(obj, privateKey, jwtHttpOptions, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve([token, tokenDate, expires_in]);
      }
    });
  });
};


function decryptToken(token) {
  return new Promise ((resolve, reject) => {
    if(!token) reject("Token does not exist");
    jwt.verify(token.replace('Bearer ', ''), publicKey, jwtHttpOptions, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
};


async function expectToken(req, res, next) {
  try {
    req.token = await decryptToken(req.headers.authorization);
    next();
  } catch (error) {
    //console.log(error);
    console.log(error.name, error.message)
    return res.status(400).send({error: 'Authentication Failure: Token Denied'});
  }
}


function expectAdmin(req, res, next) {
  if (!req.token) {
    console.log("There is no token, please put expectToken function first to fix", req.method, req.url);
    return res.sendStatus(400);
  }

  if (req.token.role !== "Admin") {
    console.log("An Admin role is required for:", req.method, req.url);
    return res.sendStatus(400);
  }
  next();
}


function expectAdmin_Scheduler(req, res, next) {
  if (!req.token) {
    console.log("There is no token, please put expectToken function first to fix", req.method, req.url);
    return res.sendStatus(400);
  }

  if (req.token.role !== "Admin" && req.token.role !== "Scheduler") {
    console.log("An Admin role or a Scheduler role is required for", req.method, req.url);
    return res.sendStatus(400);
  }
  next();
}




function checkBody(body, params) {
  if (!body) return false;
  
  for (const param of params) {
    if(!body[param]) return false;
  }
  return true;
}


function formatSetPatchSQL(validArray, body) {
  let validObj = {};
  let values = [];
  let setArray = ["SET "];

  for (let i = 0; i < validArray.length; i++) {
    validObj[validArray[i]] = 1;
  }

  let valuePos = 1;
  Object.keys(body).forEach((bodyProp) => {
    if (validObj[bodyProp]) {
      // add column_name = $#,
      setArray.push(`${bodyProp} = ${"$"+valuePos},`);
      // update valid position
      valuePos += 1;
      // appends the value from the user to the values array
      values.push(body[bodyProp]);
    }
  })

  let stringSet = setArray.join("").slice(0, -1);

  return [stringSet, values]
}



app.listen(PORT, (err) => {
    if (err) {
        console.log("Port Connection unsuccessful");
	console.log(err);
    } else {
        console.log(`Listening on Port ${PORT}`);
    }
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());







app.post('/login', async (req, res) => {
  let dbClient;
  try {
    if (!checkBody(req.body, ['email', 'password'])) {
      return res.sendStatus(400);
    }
    
    dbClient = await pool.connect();
    
    const sql = `SELECT password, accepted, role, account_uuid FROM account WHERE email = $1`;

    const result = await dbClient.query(sql, [req.body.email]);
    dbClient.release();

    //Check to see if the email is in the table
    if (result.rows.length === 0) {
      return res.sendStatus(400);
    }

    let passwordCheck = await compareHash(req.body.password, result.rows[0].password);

    if (passwordCheck === false) {
      console.log("Bad Password attempt for:", req.body.email);
      return res.sendStatus(400);
    }

    // Check to see if the admin approved this user
    if (!result.rows[0].accepted) {
      console.log("User:", req.body.email, "tried to log in but is not accepted!");
      return res.status(400).send({error: {status: 400, message: "User has not been accepted yet."}});
    }

    let [token, tokenDate, expires_in] = await setToken({ email: req.body.email, role: result.rows[0].role });
    console.log("User:", req.body.email, "has logged in!");
    return res.status(200).send(
      { 
        account_uuid: result.rows[0].account_uuid,
        access_token: token,
        access_token_created: tokenDate,
        access_token_expires_in: expires_in,
        role: result.rows[0].role,
        email: req.body.email
      }
    );
  
  } catch (err) {
    console.log("Login Error:\n", err);
    if (dbClient) dbClient.release();
    return res.sendStatus(400);
  }
});


app.post('/signup', async (req, res) => {
  let client; 
  try {
    if (!checkBody(req.body, ['email', 'password', 'first_name', 'last_name'])){
      console.log("Bad Body");
      return res.sendStatus(400);
    }
    let hashPassword = await getHash(req.body.password);
    const SQL = "INSERT INTO account(email, password, first_name, last_name, accepted) VALUES($1, $2, $3, $4, $5)";
    const values = [req.body.email, hashPassword, req.body.first_name, req.body.last_name, false];
    
    client = await pool.connect();
    let sqlResult = await client.query(SQL, values);
    
    client.release();
 
  } catch(error) {
    if(client) client.release();
    console.log("Signup Error:\n", error);
    // Unique key constraint error (means we are using a value already in use)
    if (error.code === '23505') {
      if (error.constraint === 'account_email_key') {
        return res.status(400).send({error: "Email is already in use."});
    }
    return res.sendStatus(500);
  }
  return res.sendStatus(201);
});


app.patch('/account', expectToken, expectAdmin, async (req, res) => {
  if (!checkBody(req.body, ['id'])) {
    console.log("Patch /account need id in body");
    return res.sendStatus(400);
  }

  let SQL = "UPDATE account ";
  let [stringSet, values] = formatSetPatchSQL(["first_name","last_name","accepted", "rank_id", "pilot_status", "role", "status"], req.body);
  if (values.length <= 0) {
    console.log("Body didnt have any valid column names for", req.method, req.url);
    return res.sendStatus(400);
  }
  
  //TODO: If we are editing the role make sure we are not changing an Admin user (demoting a admin user is a bad thing)

  SQL += (stringSet + ` WHERE account_id = $${values.length+1}`);
  console.log("SQL:", SQL);
  values.push(req.body.id);

  let client;
  try {
    client = await pool.connect();
    let sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Patch account error", error);
    return res.sendStatus(500);
  }
  return res.sendStatus(200);
});


app.get('/pilots', expectToken, expectAdmin_Scheduler, async (req, res) => {
  let client, sqlResult;
  try {
    const SQL = "SELECT first_name, last_name, account_uuid, pilot_status FROM account WHERE pilot_status <> 'N/A'";
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Insert pilot error", error);
    return res.sendStatus(500);
  }
  return res.status(200).send({pilots: sqlResult.rows});
});


app.get('/approval', expectToken, expectAdmin, async (req, res) => {
  let client, sqlResult;
  try {
    const SQL = "SELECT account_uuid, email, first_name, last_name FROM account WHERE accepted = false";
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Get waiting for approval error:", error);
    return res.sendStatus(500);
  }
  return res.status(200).send({pilots: sqlResult.rows});
});

app.get('/users', expectToken, expectAdmin, async (req, res) => {
  let client, sqlResult;
  try {
    const SQL = "SELECT account_uuid, first_name, last_name, rank_id, pilot_status, role, user_status FROM account WHERE role != 'Admin'";
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Get users error:", error);
    return res.sendStatus(500);
  }
  return res.status(200).send({pilots: sqlResult.rows});
});

app.patch('/approve', expectToken, expectAdmin, async (req, res) => {
  if (!checkBody(req.body, ['approve'])) {
    console.log("Patch /approve need approve in body");
    return res.sendStatus(400);
  }
  if (!req.body.approve.length) {
    console.log("Patch /approve body approve needs to be an non-empty array");
    return res.sendStatus(400);
  }

  let client, sqlResult;
  try {
    let SQL = "UPDATE account SET accepted = true WHERE account_uuid IN (";
    let stringArray = []
    let valueArray = []
    let valuePos = 1;

    for(let i = 0; i < req.body.approve.length; i++) {
      if (validator.isUUID(req.body.approve[i], 4)) {
        stringArray.push(`$${valuePos}, `);
        valuePos += 1;
        valueArray.push(req.body.approve[i]);
      }
    }

    if (stringArray.length === 0) {
      console.log("Patch /approve no valid account uuid's");
      return res.sendStatus(400);
    }

    SQL += stringArray.join("").slice(0, -2);
    SQL += ")";

    client = await pool.connect();
    sqlResult = await client.query(SQL, valueArray);
    client.release();
    
  } catch (error) {
    if (client) client.release();
    console.log("Patch approving accounts error:", error);
    return res.sendStatus(500);
  }
  res.sendStatus(200);
});














app.post('/rank', expectToken, expectAdmin, async (req, res) => {
  if (!checkBody(req.body, ['rank_name', 'priority', 'pay_grade', 'abbreviation'])){
    console.log("Bad Body");
    return res.sendStatus(400);
  }

  let client, sqlResult;
  try {
    const SQL = "INSERT INTO rank(rank_name, priority, pay_grade, abbreviation) VALUES($1, $2, $3, $4)";
    const values = [req.body.rank_name, req.body.priority, req.body.pay_grade, req.body.abbreviation];
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch(error) {
    if (client) client.release();
    console.log("Insert Rank Error:\n", error);
    return res.sendStatus(500);
  }
  return res.status(201).send({id: sqlResult.rows[0].id});
});


app.get('/rank', expectToken, expectAdmin, async (req, res) => {
  let client, sqlResult;
  try {
    const SQL = "SELECT * FROM rank";
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch(error) {
    if (client) client.release();
    console.log("Get Ranks Error:\n", error);
    return res.sendStatus(500);
  }
  let rankData = sqlResult.rows;
  return res.status(200).send({ranks: rankData});
});


app.put('/rank/:id', expectToken, expectAdmin, async (req, res) => {
  // Make sure the parameter is an integer
  if (!validator.isInt(req.params.id+"")) {
    return res.sendStatus(400);
  }
  // Make sure the body has all the information we need to fully update this resource
  if (!checkBody(req.body, ['rank_name', 'priority', 'pay_grade', 'abbreviation'])){
    console.log("Bad Body");
    return res.sendStatus(400);
  }

  let SQL = "UPDATE rank ";
  let [stringSet, values] = formatSetPatchSQL(['rank_name', 'priority', 'pay_grade', 'abbreviation'], req.body);
  
  SQL += (stringSet + ` WHERE rank_id = $${values.length+1}`);
  values.push(req.params.id);


  let client, sqlResult;
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Put Rank Error:\n", error);
    return res.sendStatus(500);
  }

  res.sendStatus(200);
});


app.patch('/rank/:id', expectToken, expectAdmin, async (req, res) => {
  // Make sure the parameter is an integer
  if (!validator.isInt(req.params.id+"")) {
    return res.sendStatus(400);
  }

  let SQL = "UPDATE rank ";
  let [stringSet, values] = formatSetPatchSQL(['rank_name', 'priority', 'pay_grade', 'abbreviation'], req.body);
  if (values.length <= 0) {
    console.log("Body didnt have any valid column names for:", req.method, req.url);
    return res.sendStatus(400);
  }
  
  SQL += (stringSet + ` WHERE rank_id = $${values.length+1}`);
  values.push(req.params.id);

  let client, sqlResult;
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Patch Rank Error:\n", error);
    return res.sendStatus(500);
  }

  res.sendStatus(200);
});


app.delete('/rank/:id', expectToken, expectAdmin, async (req, res) => {
  // Make sure the parameter is an integer
  if (!validator.isInt(req.params.id+"")) {
    return res.sendStatus(400);
  }
  
  const SQL = "DELETE FROM rank WHERE rank_id = $1";

  let client, sqlResult;
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [req.params.id]);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Delete Rank Error:\n", error);
    return res.sendStatus(500);
  }

  res.sendStatus(200);
});












app.post('/aircraft_model', expectToken, expectAdmin, async (req, res) => {
  if (!checkBody(req.body, ['name'])){
    console.log("Bad Body");
    return res.sendStatus(400);
  }
  const SQL = "INSERT INTO aircraft_model (model_name) VALUES ($1)";
  const values = [req.body.name, req.body.pilot, req.body.copilot, req.body.loader, req.body.gunner];
  let client, sqlResult;
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Insert aircraft_model error", error);
    return res.sendStatus(500);
  }
  return res.status(201).send({id: sqlResult.rows[0].id});
});


app.get('/aircraft_model/:id', expectToken, expectAdmin_Scheduler, async (req, res) => {
  const SQL = "SELECT * FROM aircraft_model WHERE model_id = $1";
  const values = [req.params.id];
  let client, sqlResult;
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Get aircraft_model error", error);
    return res.sendStatus(500);
  }
  return res.status(200).send({model: sqlResult.rows[0]});
});









// TODO airplanes might need a id or serial number between other airplanes? I guess we can use table id for now
app.post('/aircraft', expectToken, expectAdmin, async (req, res) => {
  if (!checkBody(req.body, ['model_id', 'status'])){
    console.log("POST airplane bad body");
    return res.sendStatus(400);
  }
  const SQL = "INSERT INTO aircraft (model_id, status) VALUES ($1, $2)";
  const values = [req.body.model_id, req.body.status];
  let client, sqlResult;
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Insert airplane error", error);
    return res.sendStatus(500);
  }
  return res.status(201).send({id: sqlResult.rows[0].id});
});



app.get('/aircrafts', expectToken, expectAdmin_Scheduler, async (req, res) => {
  const SQL = `SELECT aircraft_uuid as id, model_id, status FROM aircraft`;
  const SQL2 = `SELECT AM.model_uuid, AM.model_name,
                  json_agg( json_build_object('crew_position_uuid', CP.crew_position_uuid, 'position_name', CP.position, 'required', CP.required) ) as positions
                  FROM aircraft_model AM
                  INNER JOIN model_position MP
                  ON AM.model_id = MP.model_id
                  INNER JOIN crew_position CP
                  ON MP.crew_position_id = CP.crew_position_id
                  GROUP BY AM.model_uuid, AM.model_name `;
  let client, sqlResult, sql2Result;
  let modelArray = [];
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    sql2Result = await client.query(SQL2);

    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Get airplane error", error);
    return res.sendStatus(500);
  }
  return res.status(200).send({aircraft_models: sql2Result.rows, aircrafts: sqlResult.rows,});
});





app.get('/locations', expectToken, expectAdmin_Scheduler, async (req, res) => {
  const SQL = `SELECT location_uuid, name, track_num from location`;
  let client, sqlResult;
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Get Locations error", error);
    return res.sendStatus(500);
  }
  return res.status(200).send({locations: sqlResult.rows});
});



app.get('/essential', expectToken, expectAdmin_Scheduler, async (req, res) => {
  console.log("Query?:", req.query);
  if (!req.query.start || !req.query.end) {
    console.log("Get Essential Error: did not have all required paramters");
    return res.sendStatus(400);
  }
  if (isNaN(Date.parse(req.query.start)) || isNaN(Date.parse(req.query.end))) {
    console.log("Get Essential Error: Query Parameters are not valid dates");
    return res.sendStatus(400);
  }

  const aircraftSQL = `SELECT aircraft_uuid as uuid, model_uuid, status
                        FROM aircraft AT
                        INNER JOIN aircraft_model AM
                        ON AT.model_id = AM.model_id
                      `;
  
  const locationSQL = `SELECT location_uuid as uuid, name, track_num
                        FROM location
                      `;

  const crewPositionSQL = `SELECT crew_position_uuid as uuid, position, required
                            FROM crew_position`

  const airmenSQL = `SELECT account_uuid as uuid, first_name, last_name, rank_name, pilot_status, user_status
                      FROM account ACT
                      INNER JOIN rank RK
                      ON ACT.rank_id = RK.rank_id
                      WHERE role = 'User'
                    `;
  
  const aircraftModelSQL = `SELECT AM.model_uuid as uuid, AM.model_name,
                  json_agg( json_build_object('crew_position_uuid', CP.crew_position_uuid) ) as positions
                  FROM aircraft_model AM
                  INNER JOIN model_position MP
                  ON AM.model_id = MP.model_id
                  INNER JOIN crew_position CP
                  ON MP.crew_position_id = CP.crew_position_id
                  GROUP BY AM.model_uuid, AM.model_name `;

  const flightSQL = `SELECT flight_uuid as uuid, flight_uuid, LN.location_uuid, AT.aircraft_uuid, start_time as start, end_time as end, color, title, description,
                  json_agg( json_build_object('airman_uuid', ACT.account_uuid, 'crew_position_uuid', CP.crew_position_uuid) ) as crew_members
                FROM flight FT
                INNER JOIN flight_pilot FP
                ON FT.flight_id = FP.flight_id
                INNER JOIN account ACT
                ON FP.account_id = ACT.account_id
                INNER JOIN crew_position CP
                ON FP.crew_position_id = CP.crew_position_id
                INNER JOIN location LN
                ON FT.location_id = LN.location_id
                INNER JOIN aircraft AT
                ON FT.aircraft_id = AT.aircraft_id
                WHERE FT.end_time > $1 OR FT.start_time < $2
                GROUP BY FT.flight_uuid, FT.start_time, FT.end_time, FT.color, 
                  FT.title, FT.description, LN.location_uuid, AT.aircraft_uuid
                `;
  const flightSQLValues = [req.query.start, req.query.end];
  let client;
  try {
    client = await pool.connect();

    let promises = [];
    promises.push(client.query(aircraftSQL));
    promises.push(client.query(locationSQL));
    promises.push(client.query(crewPositionSQL));
    promises.push(client.query(airmenSQL));
    promises.push(client.query(aircraftModelSQL));
    promises.push(client.query(flightSQL, flightSQLValues));

    let responseHeaders = ["aircrafts", "locations", "crew_positions", "airmen", "aircraft_models", "flights"];
    let responsePayload = {};

    await Promise.all(promises).then((results) => {
      results.forEach((response, index) => {
        let tempObj = {};
        response.rows.forEach((item) => {
          let uuid = item.uuid;
          delete item.uuid
          tempObj[uuid] = item; 
        })
        responsePayload[responseHeaders[index]] = tempObj;
      })
    })
    client.release();
    res.status(200).send(responsePayload);
  } catch (error) {
    if (client) client.release();
    console.log("Error:", error);
    return res.sendStatus(500);
  }
})



app.get('/flights', expectToken, expectAdmin_Scheduler, async (req, res) => {
  const SQL = `SELECT flight_uuid, LN.location_uuid, AT.aircraft_uuid, start_time as start, end_time as end, color, title, description,
                  json_agg( json_build_object('airman_uuid', ACT.account_uuid, 'crew_position_uuid', CP.crew_position_uuid) ) as crew_members
                FROM flight FT
                INNER JOIN flight_pilot FP
                ON FT.flight_id = FP.flight_id
                INNER JOIN account ACT
                ON FP.account_id = ACT.account_id
                INNER JOIN crew_position CP
                ON FP.crew_position_id = CP.crew_position_id
                INNER JOIN location LN
                ON FT.location_id = LN.location_id
                INNER JOIN aircraft AT
                ON FT.aircraft_id = AT.aircraft_id
                GROUP BY FT.flight_uuid, FT.start_time, FT.end_time, FT.color, 
                  FT.title, FT.description, LN.location_uuid, AT.aircraft_uuid
                `;

  let client, sqlResult;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    console.log("Get Flights error", error);
    return res.sendStatus(500);
  }
  return res.status(200).send(
    { 
      flights: sqlResult.rows
    }
  );
});