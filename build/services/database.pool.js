"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
require('dotenv').config();
var Pool = require('pg').Pool;
exports.pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});
exports.pool.on('error', function (err, client) {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});
