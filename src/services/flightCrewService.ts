import FlightCrew, { validFlightCrewUpdateProps, baseFlightCrewData } from "../models/flightCrewInterface";
import { pool } from "./database.pool";
import { formatSetSQL } from "../util/util";


export const getFlightCrew = async (flight_crew_uuid: string): Promise<FlightCrew> => {
  let client: any = null;
  const SQL: string = baseFlightCrewData + `WHERE flight_crew_uuid = $1 `;
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [flight_crew_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Flight Crew Error :"+error);
  }
  return sqlResult.rows[0];
}


export const getAllFlightCrews = async (): Promise<Array<FlightCrew>> => {
  let client: any = null;
  const SQL: string = baseFlightCrewData;
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Flight Crews Error: "+error);
  }
  return sqlResult.rows;
}


export const createFlightCrew = async (flightCrew: FlightCrew): Promise<{ error: any, newFlightCrewUUID: string }> => {
  let client: any = null;
  const SQL = `INSERT INTO flight (flight_uuid, account_uuid, crew_position_uuid)
                VALUES ($1, $2, $3) RETURNING flight_crew_uuid`;
  const values = [flightCrew.flight_uuid, flightCrew.account_uuid, flightCrew.crew_position_uuid];
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
  } catch (error) {
    if (client) client.release();
    throw new Error("Create Flight Crew Error :"+error);
  }
  console.log("SQLResult for Creating Flight Crew:", sqlResult);

  return {error: false, newFlightCrewUUID: sqlResult.rows[0].flight_crew_uuid}
}


export const updateFlightCrew = async (flight_crew_uuid: string, updateProps: any): Promise< { error: any } > => {
  if (!updateProps) {
    return {error: "Update Flight Crew was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE flight_crew ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetSQL(validFlightCrewUpdateProps, updateProps, false);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Flight Crew"};
  }

  sql += (sqlSubSet + ` WHERE flight_crew_uuid = $${values.length+1}`);
  console.log("SQL:", sql);
  values.push(flight_crew_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update Flight Crew Error: "+error);
  }
  
  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }
  return { error: false };
}


export const replaceFlightCrew = async (flight_crew_uuid: string, flight: FlightCrew): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE flight_crew ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetSQL(validFlightCrewUpdateProps, flight, false);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Flight Crew"};
  }

  sql += (sqlSubSet + ` WHERE flight_crew_uuid = $${values.length+1}`);
  console.log("SQL:", sql);
  values.push(flight_crew_uuid);
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Replace Flight Crew Error from SQL Query error: "+error);
  }

  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }

  return {error: false};
}


export const removeFlightCrew = async (flight_crew_uuid: string): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = 'DELETE FROM flight_crew WHERE flight_crew_uuid = $1';

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [flight_crew_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Delete Flight Crew Error from SQL Query erorr: "+error);
  }

  if (sqlResult.rowCount <= 0) {
    return {error: "No row deleted"};
  }

  return {error: false};
}