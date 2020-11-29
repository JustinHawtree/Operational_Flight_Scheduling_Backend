
const aircraftHandler = async (action: string, payload: { [key: string]: string }, callback: (error: any, response: any) => any) => {
  switch (action) {

    case "generate":
      console.log("Websocket Generation generate case!");
      try {
        callback(false, { success: true });

      } catch (error) {
        console.error("Websocket Generation generate error:", error);
        callback("Websocket Generation generate error: " + error, null);
      }
      break;
 
    default:
      callback("Websocket Aircraft: No valid action provided", null);
      break;
  }
}

export default aircraftHandler;