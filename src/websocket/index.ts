import locationHandler from "./handlers/locationHandler";
import aircraftHandler from "./handlers/aircraftHandler";
import aircraftModelHandler from "./handlers/aircraftModelHandler";
import crewPositionHandler from "./handlers/crewPositionHandler";
import flightHandler from "./handlers/flightHandler";
import flightCrewHandler from "./handlers/flightCrewHandler";
import { parse } from "dotenv/types";

require('uWebSockets.js').App().ws('/*', {
  // Websocket Settings
  idleTimeout: 300,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: 0,

  open: (ws: any, req: any) => {
    console.log("A Websocket connected!");
    ws.subscribe('location');
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
              {
                topic: "flight_crew",
                action: action,
                message: response
              });
          });
          break;


        case "flight":
          flightHandler(action, message, (error: any, response: any) => {
            if (error) {
              ws.send('error', error);
              return;
            }
            ws.publish('flight',
              {
                topic: "flight",
                action: action,
                message: response
              });
          });
          break;


        case "location":
          locationHandler(action, message, (error: any, response: any) => {
            console.log("Got Here3");
            if (error) {
              console.log("Error Websocket location sending");
              ws.send(JSON.stringify({error: "Location blew up!"}));
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
              ws.send('error', error);
              return;
            }
            ws.publish('crew_position',
              {
                topic: "crew_position",
                action: action,
                message: response
              });
          });
          break;


        case "aircraft":
          aircraftHandler(action, message, (error: any, response: any) => {
            if (error) {
              ws.send('error', error);
              return;
            }
            ws.publish('aircraft',
              {
                topic: "aicraft",
                action: action,
                message: response
              });
          });
          break;

        case "aircraft_model":
          aircraftModelHandler(action, message, (error: any, response: any) => {
            if (error) {
              ws.send('error', error);
              return;
            }
            ws.publish('aircraft_model',
              {
                topic: "aicraft_model",
                action: action,
                message: response
              });
          });
          break;


        default:
          console.log("this is default, no valid topic given");
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