import Aircraft, { validAircraftUpdateProps } from "../../models/aircraftInterface";
import * as aircraftService from "../../services/aircraftService";

const aircraftHandler = async (action: string, payload: { [key: string]: string }, callback: (error: any, response: any) => any) => {
  switch (action) {

    case "add":
      console.log("Websocket Aircraft Add case!");
      try {
        let aircraft: Aircraft = {
          aircraft_uuid: "",
          model_uuid: payload.model_uuid,
          tail_code: payload.tail_code,
          status: payload.status
        };

        let newAircraft = await aircraftService.createAircraft(aircraft);
        callback(false, { ...aircraft, aircraft_uuid: newAircraft.newAircraftUUID });

      } catch (error) {
        console.error("Websocket Aircraft add error:", error);
        callback("Websocket Aircraft add error: " + error, null);
      }

      break;

    case "edit":
      console.log("Websocket Aircraft Edit case!");
      let updateProps: any = {};
      try {
        Object.keys(payload).forEach(element => {
          if (validAircraftUpdateProps.includes(element)) {
            updateProps[element] = payload[element]
          }
        });
        if (Object.keys(updateProps).length === 0) {
          console.log("Websocket Aircraft edit: no valid key found");
          callback("Websocket Aircraft edit: no valid key found", null);
          break;
        }
        let result = await aircraftService.updateAircraft(payload.aircraft_uuid, updateProps);
        if (result.error) {
          console.log("Websocket Aircraft edit error:", result.error);
          callback(result.error, null);
          break;
        }
        callback(false, { ...updateProps, aircraft_uuid: payload.aircraft_uuid });
      } catch (error) {
        console.log("Websocket Aircraft edit error:", error);
        callback("Websocket Aircraft edit error: " + error, null);
      }
      break;

    case "delete":
      console.log("this is deleting case!");
      try {
        if (payload.aircraft_uuid) {
          let result = await aircraftService.removeAircraft(payload.aircraft_uuid);
          if (result.error) {
            console.log("Websocket Aircraft delete error:", result.error);
            callback(result.error, { success: false });
            break;
          }
          callback(false, { aircraft_uuid: payload.aircraft_uuid });
          break;
        } else {
          console.log("Websocket Aircraft delete error: Aircraft_uuid not provided");
          callback("Websocket Aircraft delete error: Aircraft_uuid not provided", { success: false });
        }
      } catch (error) {
        console.log("Websocket Aircraft delete error:", error);
        callback("Websocket Aircraft delete error: " + error, null);
      }
      break;

    default:
      callback("Websocket Aircraft: No valid action provided", null);
      break;
  }
}

export default aircraftHandler;