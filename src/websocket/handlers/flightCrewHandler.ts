import FlightCrew, { validFlightCrewUpdateProps } from "../../models/flightCrewInterface";
import * as flightCrewService from "../../services/flightCrewService";

const flightCrewHandler = async (action: string, payload: { [key: string]: string }, callback: (error: any, response: any) => any) => {
  switch (action) {

    case "add":
      console.log("Websocket FlightCrew Add case!");
      try {
        let flight_crew: FlightCrew = {
          flight_crew_uuid: "",
          flight_uuid: payload.flight_uuid,
          account_uuid: payload.account_uuid,
          crew_position_uuid: payload.crew_position_uuid
        };

        let newFlightCrew = await flightCrewService.createFlightCrew(flight_crew);
        callback(false, { ...flight_crew, flight_crew_uuid: newFlightCrew.newFlightCrewUUID });

      } catch (error) {
        console.error("Websocket FlightCrew add error:", error);
        callback("Websocket FlightCrew add error: " + error, null);
      }

      break;

    case "edit":
      console.log("Websocket FlightCrew Edit case!");
      let updateProps: any = {};
      try {
        Object.keys(payload).forEach(element => {
          if (validFlightCrewUpdateProps.includes(element)) {
            updateProps[element] = payload[element]
          }
        });
        if (Object.keys(updateProps).length === 0) {
          console.log("Websocket FlightCrew edit: no valid key found");
          callback("Websocket FlightCrew edit: no valid key found", null);
          break;
        }
        let result = await flightCrewService.updateFlightCrew(payload.flight_crew_uuid, updateProps);
        if (result.error) {
          console.log("Websocket FlightCrew edit error:", result.error);
          callback(result.error, null);
          break;
        }
        callback(false, { ...updateProps, flight_crew_uuid: payload.flight_crew_uuid });
      } catch (error) {
        console.log("Websocket FlightCrew edit error:", error);
        callback("Websocket FlightCrew edit error: " + error, null);
      }
      break;

    case "delete":
      console.log("this is deleting case!");
      try {
        if (payload.flight_crew_uuid) {
          let result = await flightCrewService.removeFlightCrew(payload.flight_crew_uuid);
          if (result.error) {
            console.log("Websocket FlightCrew delete error:", result.error);
            callback(result.error, { success: false });
            break;
          }
          callback(false, { flight_crew_uuid: payload.flight_crew_uuid });
          break;
        } else {
          console.log("Websocket FlightCrew delete error: Flight_crew_uuid not provided");
          callback("Websocket FlightCrew delete error: Flight_crew_uuid not provided", { success: false });
        }
      } catch (error) {
        console.log("Websocket FlightCrew delete error:", error);
        callback("Websocket FlightCrew delete error: " + error, null);
      }
      break;

    default:
      callback("Websocket FlightCrew: No valid action provided", null);
      break;
  }
}

export default flightCrewHandler;