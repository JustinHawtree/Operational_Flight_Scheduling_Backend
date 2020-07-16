'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const fs = require('fs');
const jwtHttpOptions = {
  issuer: "scheduler",
  subject: "Main Auth",
  audience: "http://Scheduler.com",
  expiresIn: "2h",
  algorithm: "RS512"
}




require('dotenv').config();
const { Pool, Client } = require('pg');
const pg = require('pg');

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
    jwt.sign(obj, privateKey, jwtHttpOptions, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
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
    console.log("User used Token:", req.headers.authorization);
    req.token = await decryptToken(req.headers.authorization);
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send('Authentiction failure: token denied');
  }
}


function checkBody(req, params) {
  for (const param of params) {
    if(!req.body[param]) return false;
  }
  return true;
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

app.get('/', (request, result) => {
  result.send("Hello World");
});

app.post('/login', async (req, res) => {
  //console.log("Request", req);
  console.log("Body", req.body);
  console.log("Username:", req.body.username);
  console.log("Password:", req.body.password);
  let dbClient;
  try {
    if(!checkBody(req, ['username', 'password'])) return res.code(400).send('');
    dbClient = await pool.connect();
    
    const sql = `SELECT password FROM account WHERE username = $1`;

    const result = await dbClient.query(sql, [req.body.username]);
    //Check to see if the username is in the table
    if(result.rows.length === 0) {
      dbClient.release();
      return res.status(400).send('');
    }
    let passwordCheck = await compareHash(req.body.password, result.rows[0].password);
    //console.log("Look Here1:", result.rows[0]);
    console.log("PasswordCheck: ", passwordCheck);
    if (passwordCheck === false) {
      console.log("Bad Password attempt for:", req.body.username);
      dbClient.release();
      return res.sendStatus(400);
    }
    let token = await setToken({ username: req.body.username });
    dbClient.release();
    return res.status(200).send({
      token: token
    });
  
  } catch (err) {
    console.log("Login Error:\n", err);
    if (dbClient) dbClient.release();
    return res.status(400).send('');
  }
});


app.post('/signup', async (req, res) => {
  console.log("Username:", req.body.username);
  console.log("Password:", req.body.password);
  let client; 
  try {
    if (!req.body.username || !req.body.password || !req.body.email) {
      return res.sendStatus(400);
    }
    let hashPassword = await getHash(req.body.password);
    const SQL = "INSERT INTO account(email, username, password) VALUES($1, $2, $3) RETURNING *";
    const values = [req.body.email, req.body.username, hashPassword];
    client = await pool.connect();
    let sqlResult = await client.query(SQL, values);
    console.log("SQLResult:", sqlResult);
    client.release();
  } catch(error) {
    if(client) client.release();
    console.log("Signup Error:\n", error);
    return res.sendStatus(500);
  }

  return res.sendStatus(201);
});


app.post('/insertRank', expectToken, async (req, res) => {
  if (!checkBody(req, ['rank', 'priority', 'got_wings'])){
    console.log("Bad Body");
    return res.sendStatus(400);
  }
  console.log(req.body.rank, req.body.priority, req.body.got_wings);
  let client, sqlResult;
  try {
    const SQL = "INSERT INTO ranks(rank, priority, got_wings) VALUES($1, $2, $3) RETURNING id";
    const values = [req.body.rank, req.body.priority, req.body.got_wings];
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch(error) {
    if (client) client.release();
    console.log("Insert Rank Error:\n", error);
    return res.sendStatus(500);
  }
  return res.status(201).send({"id":sqlResult.rows[0].id});
});


app.get('/ranks', expectToken, async (req, res) => {
  let client, sqlResult;
  try {
    const SQL = "SELECT * FROM ranks";
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch(error) {
    if (client) client.release();
    console.log("Get Ranks Error:\n", error);
    return res.sendStatus(500);
  }
  //console.log("User that wants ranks",req.token);
  let rankData = sqlResult.rows;
  //console.log("SQL RESULT:",sqlResult);
  return res.status(200).send({rankData});
});
