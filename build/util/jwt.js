"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptToken = exports.setToken = void 0;
var jwt = require('jsonwebtoken');
var fs = require('fs');
//Security keys for jwt 
var privateKey = fs.readFileSync('./build/util/private.key', 'utf8');
var publicKey = fs.readFileSync('./build/util/public.key', 'utf8');
// JWT Expire in 2 hours (7,200 seconds)
var expires_in = 7200;
// Options for JWT
var jwtHttpOptions = {
    issuer: "scheduler",
    subject: "Main Auth",
    audience: "http://Scheduler.com",
    expiresIn: "2h",
    algorithm: "RS512"
};
exports.setToken = function (obj) {
    return new Promise(function (resolve, reject) {
        if (!obj)
            reject("JWT Error: no obj provided to setToken()");
        var tokenDate = new Date().toISOString().replace("Z", "");
        jwt.sign(obj, privateKey, jwtHttpOptions, function (error, token) {
            if (error) {
                reject(error);
            }
            else {
                resolve({ token: token, tokenDate: tokenDate, expires_in: expires_in });
            }
        });
    });
};
exports.decryptToken = function (token) {
    return new Promise(function (resolve, reject) {
        if (!token)
            reject("JWT Error: no token provided to decryptToken()");
        jwt.verify(token.replace("Bearer ", ""), publicKey, jwtHttpOptions, function (error, value) {
            if (error) {
                reject(error);
            }
            else {
                resolve(value);
            }
        });
    });
};
