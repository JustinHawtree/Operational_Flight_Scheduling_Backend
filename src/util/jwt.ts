const jwt = require('jsonwebtoken');
const fs = require('fs');

//Security keys for jwt 
const privateKey = fs.readFileSync('./build/util/private.key', 'utf8');
const publicKey = fs.readFileSync('./build/util/public.key', 'utf8');

// JWT Expire in 2 hours (7,200 seconds)
let expires_in = 7200;

// Options for JWT
const jwtHttpOptions = {
  issuer: "scheduler",
  subject: "Main Auth",
  audience: "http://Scheduler.com",
  expiresIn: "2h",
  algorithm: "RS512"
}


export const setToken = (obj: Object): Promise<object> => {
  return new Promise((resolve, reject) => {
    if (!obj) reject("JWT Error: no obj provided to setToken()");
    let tokenDate = new Date().toISOString().replace("Z", "");
    jwt.sign(obj, privateKey, jwtHttpOptions, (error: any, token: any) => {
      if (error) {
        reject(error);
      } else {
        resolve({token, tokenDate, expires_in});
      }
    });
  });
}


export const decryptToken = (token: any): Promise<any> =>{
  return new Promise ((resolve, reject) => {
    if (!token) reject("JWT Error: no token provided to decryptToken()");
    jwt.verify(token.replace("Bearer ", ""), publicKey, jwtHttpOptions, (error: any, value: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    })
  })
}