import Flight, { validFlightUpdateProps } from "../../models/flightInterface";
import * as flightService from "../../services/flightService";
import * as flightCrewService from "../../services/flightCrewService";

const flightHandler = async (action: string, payload: { [key: string]: any }, callback: (error: any, response: any) => any) => {
  switch (action) {

    case "add":
      console.log("Websocket Flight Add case!");
      try {
        let flight: Flight = {
          flight_uuid: "",
          aircraft_uuid: payload.aircraft_uuid,
          location_uuid: payload.location_uuid,
          start_time: payload.start_time,
          end_time: payload.end_time,
          color: payload.color,
          title: payload.title,
          description: payload.description,
          allDay: Boolean(payload.allDay)
        };

        let newFlight = await flightService.createFlight(flight);

        if (payload.crew_members && payload.crew_members.length > 0) {
          let crewResult = await flightCrewService.createFlightCrewsByFlight(newFlight.newFlightUUID, payload.crew_members);
          if (crewResult.error) {
            console.error("Create Flight Crew Members Error:", crewResult.error);
            callback(crewResult.error, { success: false });
          }
        }
        let returnFlight: any = { ...flight, flight_uuid: newFlight.newFlightUUID, crew_members: payload.crew_members };
        let start = payload.start_time;
        let end = payload.end_time;
        delete returnFlight["start_time"];
        delete returnFlight["end_time"];

        callback(false, {...returnFlight, end, start});

      } catch (error) {
        console.error("Websocket Flight add error:", error);
        callback("Websocket Flight add error: " + error, null);
      }

      break;

    case "edit":
      console.log("Websocket Flight Edit case!");
      let updateProps: any = {};
      try {
        Object.keys(payload).forEach(element => {
          if (validFlightUpdateProps.includes(element)) {
            updateProps[element] = payload[element]
          }
        });
        if (Object.keys(updateProps).length === 0) {
          console.log("Websocket Flight edit: no valid key found");
          callback("Websocket Flight edit: no valid key found", null);
          break;
        }
        let result = await flightService.updateFlight(payload.flight_uuid, updateProps);
        if (result.error) {
          console.log("Websocket Flight edit error:", result.error);
          callback(result.error, null);
          break;
        }
        console.log("Crew members?:", payload.crew_members);
        if (payload.crew_members && payload.crew_members.length > 0) {
	        console.log("Got inside here", payload.crew_members);
          let deleteCrewResult = await flightCrewService.removeAllFlightCrewsByFlight(payload.flight_uuid);
	        console.log("Delete Crews:", deleteCrewResult);
          let crewResult = await flightCrewService.createFlightCrewsByFlight(payload.flight_uuid, payload.crew_members);
	        console.log("crewResult:", crewResult);
          if (crewResult.error) {
            console.error("Create Flight Crew Members Error:", crewResult.error);
            callback(crewResult.error, { success: false });
          }
        }

        let returnFlight: any = { ...updateProps, flight_uuid: payload.flight_uuid, crew_members: payload.crew_members };
        let start = payload.start_time;
        let end = payload.end_time;
        delete returnFlight["start_time"];
        delete returnFlight["end_time"];

        callback(false, {...returnFlight, end, start});
        
      
      } catch (error) {
        console.log("Websocket Flight edit error:", error);
        callback("Websocket Flight edit error: " + error, null);
      }
      break;

    case "delete":
      console.log("this is deleting case!");
      try {
        if (payload.flight_uuid) {
          let result = await flightService.removeFlight(payload.flight_uuid);
          if (result.error) {
            console.log("Websocket Flight delete error:", result.error);
            callback(result.error, { success: false });
            break;
          }
          callback(false, { flight_uuid: payload.flight_uuid });
          break;
        } else {
          console.log("Websocket Flight delete error: Flight_uuid not provided");
          callback("Websocket Flight delete error: Flight_uuid not provided", { success: false });
        }
      } catch (error) {
        console.log("Websocket Flight delete error:", error);
        callback("Websocket Flight delete error: " + error, null);
      }
      break;

    default:
      callback("Websocket Flight: No valid action provided", null);
      break;
  }
}

export default flightHandler;
