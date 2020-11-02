import Location, { validLocationUpdateProps } from "../../models/locationInterface";
import * as locationService from "../../services/locationService";

const locationHandler = async (action: string, payload: { [key: string]: string }, callback: (error: any, response: any) => any) => {
  switch (action) {

    case "add":
      console.log("Websocket: Location Add case!");
      try {
        let location: Location = {
          location_name: payload.location_name,
          location_uuid: "",
          track_num: parseInt(payload.track_num)
        };

        let newLocation = await locationService.createLocation(location)
        callback(false, { ...location, location_uuid: newLocation.newLocationUUID });

      } catch (error) {
        console.error("Websocket Location add error:", error);
        callback("Websocket Location add error: " + error, null);
      }

      break;

    case "edit":
      console.log("Websocket Location Edit case!");
      let updateProps: any = {};
      try {
        Object.keys(payload).forEach(element => {
          if (validLocationUpdateProps.includes(element)) {
            updateProps[element] = payload[element]
          }
        });
        if (Object.keys(updateProps).length === 0) {
          console.log("Websocket Location edit: no valid key found");
          callback("Websocket Location edit: no valid key found", null);
          break;
        }
        let result = await locationService.updateLocation(payload.location_uuid, updateProps);
        if (result.error) {
          console.log("Websocket Location edit error:", result.error);
          callback(result.error, null);
          break;
        }
        callback(false, { ...updateProps, location_uuid: payload.location_uuid });
      } catch (error) {
        console.log("Websocket Location edit error:", error);
        callback("Websocket Location edit error: " + error, null);
      }
      break;

    case "delete":
      console.log("this is deleting case!");
      try {
        if (payload.location_uuid) {
          let result = await locationService.removeLocation(payload.location_uuid);
          if (result.error) {
            console.log("Websocket Location delete error:", result.error);
            callback(result.error, { success: false });
            break;
          }
          callback(false, { location_uuid: payload.location_uuid });
          break;
        } else {
          console.log("Websocket Location delete error: Location_uuid not provided");
          callback("Websocket Location delete error: Location_uuid not provided", { success: false });
        }
      } catch (error) {
        console.log("Websocket Location delete error:", error);
        callback("Websocket Location delete error: " + error, null);
      }
      break;

    default:
      callback("Websocket Location: No valid action provided", null);
      break;
  }
}

export default locationHandler;