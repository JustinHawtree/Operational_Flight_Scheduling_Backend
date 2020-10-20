"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require('cors');
var PORT = process.env.PORT || 3001;
var user_controller_1 = require("./controllers/user.controller");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001']
}));
app.use("/", user_controller_1.UserRouter);
app.listen(PORT, function (err) {
    if (err) {
        console.log("Server Error", err);
    }
    else {
        console.log("Listening on Port " + PORT);
    }
});
