"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.getHash = void 0;
var bcrypt = require('bcrypt');
var saltRounds = 12;
exports.getHash = function (password) {
    return new Promise(function (resolve, reject) {
        if (!password)
            reject("Bcrypt Error: Undefined/Null password for getHash function");
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                console.log("Bcrypt Error:", err);
                reject(err);
            }
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    console.log("Bcrypt Error:", err);
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
};
exports.compareHash = function (plainPassword, hashPassword) {
    return new Promise(function (resolve, reject) {
        bcrypt.compare(plainPassword, hashPassword, function (err, result) {
            if (err) {
                console.log("Bcrypt Error:", err);
                reject(err);
            }
            resolve(result);
        });
    });
};
