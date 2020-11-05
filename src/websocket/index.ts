import locationHandler from "./handlers/locationHandler";
import aircraftHandler from "./handlers/aircraftHandler";
import aircraftModelHandler from "./handlers/aircraftModelHandler";
import crewPositionHandler from "./handlers/crewPositionHandler";
import flightHandler from "./handlers/flightHandler";
import flightCrewHandler from "./handlers/flightCrewHandler";
import { parse } from "dotenv/types";

require('uWebSockets.js').App().ws('/*', {
  // Websocket Settings
  idleTimeout: 60, // Author of ws library hard codes the timeout to 1 min
  maxBackpressure: 1024,
  maxPayloadLength: 16 * 1024 * 1024,
  compression: 0,

  open: (ws: any, req: any) => {
    console.log("A Websocket connected!");
    ws.subscribe('location');
    ws.subscribe('flight');
  },

  message: (ws: any, wsmessage: any, isBinary: any) => {
    let stringy = "";
    try {
      let buffer = Buffer.from(wsmessage);
      stringy = buffer.toString();
      let parsedMessage = JSON.parse(stringy);
      console.log("Websocket Message:",parsedMessage);
      
      let token = parsedMessage.token;
      let error = parsedMessage.error;


      let topic = parsedMessage.topic;
      let action = parsedMessage.action;
      let message = parsedMessage.message;
      // decrypt the token

      // Down below ensure the request is from an admin
      // for changes like in the users account



      switch (topic) {
        case "user":
          // userHandler(action, message, (error: any, response: any) => {
          //   if (error) {
          //     ws.send('error', error);
          //     return;
          //   }
          //   ws.publish('user', response);
          // });
          break;


        case "flight_crew":
          flightCrewHandler(action, message, (error: any, response: any) => {
            if (error) {
              ws.send('error', error);
              return;
            }
            ws.publish('flight_crew',
              JSON.stringify({
                topic: "flight_crew",
                action: action,
                message: response
              }));
          });
          break;


        case "flight":
          flightHandler(action, message, (error: any, response: any) => {
            if (error) {
              console.log("Websocket Error: Flight Error:", error);
              ws.send(JSON.stringify({error: "Flight Error"}));
              return;
            }
            console.log("Got here in flight");
            ws.publish('flight',
              JSON.stringify({
                topic: "flight",
                action: action,
                message: response
              }));
          });
          break;


        case "location":
          locationHandler(action, message, (error: any, response: any) => {
            console.log("Got Here3");
            if (error) {
              console.log("Websocket Error: Location Error:", error);
              ws.send(JSON.stringify({error: "Location Error"}));
              return;
            }
            console.log("Got Here4");
            ws.publish('location',
              JSON.stringify({
                topic: "location",
                action: action,
                message: response
              }));
            console.log("Got Here5");
          });
          break;


        case "crew_position":
          crewPositionHandler(action, message, (error: any, response: any) => {
            if (error) {
              console.log("Websocket Error: Crew_Position Error:", error);
              ws.send(JSON.stringify({error: "Crew_Position Error"}));
              return;
            }
            ws.publish('crew_position',
              JSON.stringify({
                topic: "crew_position",
                action: action,
                message: response
              }));
          });
          break;


        case "aircraft":
          aircraftHandler(action, message, (error: any, response: any) => {
            if (error) {
              console.log("Websocket Error: Aircraft Error:", error);
              ws.send(JSON.stringify({error: "Aircraft Error"}));
              return;
            }
            ws.publish('aircraft',
              JSON.stringify({
                topic: "aicraft",
                action: action,
                message: response
              }));
          });
          break;


        case "aircraft_model":
          aircraftModelHandler(action, message, (error: any, response: any) => {
            if (error) {
              console.log("Websocket Error: Aircraft Model Error:", error);
              ws.send(JSON.stringify({error: "Aircraft Modal  Error"}));
              return;
            }
            ws.publish('aircraft_model',
              JSON.stringify({
                topic: "aicraft_model",
                action: action,
                message: response
              }));
          });
          break;


        case "ping":
          let date = new Date();
          console.log("pong", date);
          break;

          
        default:
          console.log("Websocket Error: Invalid Topic Error: Topic Given:", topic);
          ws.send(JSON.stringify({error: "Invalid Topic Error:"}));
          break;
      }
      // console.log("Message: ", message);
      // ws.publish('users', JSON.stringify(message));
    } catch (error) {
      console.log("Websocket not valid json message", error);
      console.log("Websocket Message:", stringy);
      return;
    }

    /* Here we echo the message back, using compression if available */
    // let ok = ws.send(message, isBinary, true);
  },

  close: (ws: any, code: any, message: any) => {
    console.log("WebSocket Closed");
  }

}).listen(3002, (listenSocket: any) => {

  if (listenSocket) {
    console.log('WebSocket Server Listening to port 3002');
  }

});