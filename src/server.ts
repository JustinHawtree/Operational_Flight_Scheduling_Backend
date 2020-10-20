"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const PORT = process.env.PORT || 3001;

import { UserRouter } from "./controllers/user.controller";

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001']
}))


app.use("/", UserRouter);

app.listen(PORT, (err: any) => {
  if (err) {
    console.log("Server Error", err)
  } else {
    console.log(`Listening on Port ${PORT}`);
  }
});
