import { userHandler } from "./handlers/userHandler";

require('uWebSockets.js').App().ws('/*', {
  // Websocket Settings
  idleTimeout: 300,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: 0,

  open: (ws: any, req: any) => {
      console.log("A Websocket connected!");
  },

  message: (ws: any, wsmessage: any, isBinary: any) => {
    let stringy = "";
    try {
      let buffer = Buffer.from(wsmessage);
      stringy = buffer.toString();
      let parsedMessage = JSON.parse(stringy);
      let token = parsedMessage.token;
      let topic = parsedMessage.topic;
      let action = parsedMessage.action;
      let message = parsedMessage.message;
      // decrypt the token

      // Down below ensure the request is from an admin
      // for changes like in the users account

      switch (topic) {
        case "user":
          userHandler(action, message, (error: any, response: any) => {
            if (error) {
              ws.send('error', error);
              return;
            }
            ws.publish('user', response);
          });
          break;
        case "flight_crew":
          switch (action) {
            case "add":
              console.log("this is addding case!");
              break;
            case "edit":
              console.log("this is editing case!");
              break;
            case "delete":
              console.log("this is deleting case!");
              break;
            default:
              console.log("not a valid action");
              break;
          }
          ws.publish('flight_crew', message);
          break;
        case "flight":
          switch (action) {
            case "add":
              console.log("this is addding case!");
              break;
            case "edit":
              console.log("this is editing case!");
              break;
            case "delete":
              console.log("this is deleting case!");
              break;
            default:
              console.log("not a valid action");
              break;
          }
          ws.publish('flight', message);
          break;
        case "location":
          switch (action) {
            case "add":
              console.log("this is addding case!");
              break;
            case "edit":
              console.log("this is editing case!");
              break;
            case "delete":
              console.log("this is deleting case!");
              break;
            default:
              console.log("not a valid action");
              break;
          }
          ws.publish('location', message);
          break;
        case "crew_position":
          switch (action) {
            case "add":
              console.log("this is addding case!");
              break;
            case "edit":
              console.log("this is editing case!");
              break;
            case "delete":
              console.log("this is deleting case!");
              break;
            default:
              console.log("not a valid action");
              break;
          }
          ws.publish('crew_position', message);
          break;
        case "aircraft":
          switch (action) {
            case "add":
              console.log("this is addding case!");
              break;
            case "edit":
              console.log("this is editing case!");
              break;
            case "delete":
              console.log("this is deleting case!");
              break;
            default:
              console.log("not a valid action");
              break;
          }
          break;
        default:
          console.log("this is default shit, no good topic");
          break;
        }
      // console.log("Message: ", message);
      // ws.publish('users', JSON.stringify(message));
    } catch (error) {
      console.log("Websocket: not valid json message", error);
      console.log("Websocket: Message:", stringy);
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