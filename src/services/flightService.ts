import Flight, { validFlightUpdateProps, baseFlightData } from "../models/flightInterface";
import { pool } from "./database.pool";
import { formatSetPatchSQL } from "../util/util";


export const getFlight = async (flight_uuid: string): Promise<Flight> => {
  let client: any = null;
  const SQL: string = baseFlightData + `WHERE FT.flight_uuid = $1 GROUP BY FT.flight_uuid, FT.start_time, FT.end_time, FT.color, 
    FT.title, FT.description, location_uuid, aircraft_uuid`;
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [flight_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Flight Error :"+error);
  }
  return sqlResult.rows[0];
}


export const getAllFlights = async (): Promise<Array<Flight>> => {
  let client: any = null;
  const SQL: string = baseFlightData + `GROUP BY FT.flight_uuid, FT.start_time, FT.end_time, FT.color, 
  FT.title, FT.description, location_uuid, aircraft_uuid`;
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Flights Error: "+error);
  }
  return sqlResult.rows;
}


export const getAllFlightsBetweenTimes = async (start_date: Date, end_date: Date): Promise<Array<Flight>> => {
  let client: any = null;
  const SQL: string = baseFlightData + `WHERE FT.end_time > $1 OR FT.start_time < $2 ` +
    `GROUP BY FT.flight_uuid, FT.start_time, FT.end_time, FT.color, FT.title, FT.description,
      location_uuid, aircraft_uuid`
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [start_date, end_date]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Flights Between Times Error: "+error);
  }
  return sqlResult.rows;
}


export const createFlight = async (flight: Flight, crew_members: Array<{ account_uuid: string, crew_position_uuid: string }>): Promise<{ error: any, newFlightUUID: string }> => {
  let client: any = null;
  const SQL = `INSERT INTO flight (aircraft_uuid, location_uuid, start_time, end_time, color, title, description, allDay)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING flight_uuid`;
  const values = [flight.aircraft_uuid, flight.location_uuid, flight.start_time, flight.end_time, flight.color, flight.title, flight.description, flight.allDay];
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
  } catch (error) {
    if (client) client.release();
    throw new Error("Create Flight Error :"+error);
  }
  console.log("SQLResult for Creating Flight:", sqlResult);
  let new_flight_uuid = sqlResult.rows[0].flight_uuid

  if (crew_members && crew_members.length > 0) {
    let valueArray = [];
    let crewMembersSQL = "INSERT INTO flight_crew (flight_uuid, account_uuid, crew_position_uuid) VALUES ";
    let valuesIndex = 1;

    for (const item of crew_members) {
      crewMembersSQL += `($${valuesIndex++}, $${valuesIndex++}, $${valuesIndex++}),`;
      valueArray.push(new_flight_uuid, item.account_uuid, item.crew_position_uuid);
    }
    crewMembersSQL = crewMembersSQL.slice(0, -1);
  } else {
    if (client) client.release();
  }

  return {error: false, newFlightUUID: sqlResult.rows[0].flight_uuid}
}


export const updateAircraftModel = async (model_uuid: string, updateProps: any): Promise< { error: any } > => {
  if (!updateProps) {
    return {error: "Update Aircraft Model was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let SQL: string = "UPDATE aircraft_model ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetPatchSQL(validAircraftModelUpdateProps, updateProps);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Aircraft Model"};
  }

  SQL += (sqlSubSet + ` WHERE model_uuid = $${values.length+1}`);
  console.log("SQL:", SQL);
  values.push(model_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update Aircraft Model Error: "+error);
  }
  
  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }
  return { error: false };
}


export const replaceAircraftModel = async (model_uuid: string, aircraft_model: AircraftModel): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = `UPDATE aircraft_model SET model_name = $1 WHERE model_uuid = $2`;
  let values = [aircraft_model.model_name, model_uuid];
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Replace Aircraft Model Error from SQL Query error: "+error);
  }
  console.log("SQLResult for replace:", sqlResult);

  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }

  return {error: false};
}


export const removeAircraftModel = async (model_uuid: string): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = 'DELETE FROM aircraft_model WHERE model_uuid = $1';

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [model_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Delete Aircraft Model Error from SQL Query erorr: "+error);
  }
  console.log("SQLResult for replace:", sqlResult);

  if (sqlResult.rowCount <= 0) {
    return {error: "No row deleted"};
  }

  return {error: false};
}