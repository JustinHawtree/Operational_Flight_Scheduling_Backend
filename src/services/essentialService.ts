import Essential from "../models/essentialInterface";
import { pool } from "./database.pool";
import { baseAircraftModelData,  aircraftModelGroupBy} from "../models/aircraftModelInterface";
import { baseAircraftData } from "../models/aircraftInterface";
import { baseCrewPositionData } from "../models/crewPositionInterface";
import { baseUserData } from "../models/userInterface";
import { baseFlightData, flightGroupBy } from "../models/flightInterface";
import { baseLocationData } from "../models/locationInterface";


export const getEssential = async (start_date: string, end_date: string): Promise<Essential> => {
  let client: any = null;
  if (!start_date || !end_date) {
    throw new Error("Get Essential Service was given bad start_date or end_date");
  }

  const aircraftSQL: string = baseAircraftData;
  const locationSQL: string = baseLocationData;
  const crewPositionSQL: string = baseCrewPositionData;
  const airmenSQL: string = baseUserData + "WHERE role = 'User'";
  const aircraftModelSQL: string = baseAircraftModelData + aircraftModelGroupBy;
  const flightSQL: string =  baseFlightData + `WHERE FT.end_time > $1 OR FT.start_time < $2 ` + flightGroupBy;
  const flightValues: Array<string> = [start_date, end_date];
  
  try {
    client = await pool.connect();
    let promises: Array<any> = [];
    promises.push(client.query(aircraftSQL), client.query(locationSQL),
      client.query(crewPositionSQL), client.query(airmenSQL), 
      client.query(aircraftModelSQL), client.query(flightSQL, flightValues));
    let responseHeaders = ["aircrafts", "locations", "crew_positions", "airmen", "aircraft_models", "flights"];
    let responsePayload: any = {};

    await Promise.all(promises).then((results) => {
      results.forEach((response, index) => {
        responsePayload[responseHeaders[index]] = response.rows;
      });
    });
    client.release();
    return responsePayload;

  } catch (error) {
    if (client) client.release();
    throw new Error("Get Essentials Error :"+error);
  }
}

