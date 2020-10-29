import Location from "../../models/locationInterface";
import * as locationService from "../../services/locationService";

const locationHandler = async (action: string, payload: any, callback: any) => {
  switch (action) {

    case "add":
      console.log("Websocket: Location Add this is addding case!");
      try {
        let location: Location = {
          location_name: payload.location_name,
          location_uuid: "",
          track_num: payload.track_num
        };

        let newLocation = await locationService.createLocation(location)
        callback(false, { ...location, location_uuid: newLocation.newLocationUUID});

      } catch(error) {
        console.error("Websocket: Location add error:", error);
        callback("Websocket: Location add error: "+error, null);
      }

      break;

    case "edit":
      console.log("this is editing case!");

      callback(false, {sucess: true});
      break;

    case "delete":
      console.log("this is deleting case!");

      callback(false, {sucess: true});
      break;

    default:
      
      callback(false, {sucess: true});
      break;
  }
}

export default locationHandler;