"use strict";
const websocket = require("./websocket");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const PORT = process.env.PORT || 3000;

import routes from "./routes";

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cors({
  origin: ['https://localhost:3000', 'http://localhost:3000', 'https://www.airforceofs.com', 'https://airforceofs.com']
}))


app.use("/api", routes);

app.listen(PORT, (err: any) => {
  if (err) {
    console.log("Server Error", err)
  } else {
    console.log(`Listening on Port ${PORT}`);
  }
});
