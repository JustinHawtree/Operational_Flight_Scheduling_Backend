import Flight, { validFlightUpdateProps, baseFlightData, flightGroupBy } from "../models/flightInterface";
import { pool } from "./database.pool";
import { formatSetSQL } from "../util/util";


export const getFlight = async (flight_uuid: string): Promise<Flight> => {
  let client: any = null;
  const SQL: string = baseFlightData + `WHERE FT.flight_uuid = $1 `+ flightGroupBy;
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
  const SQL: string = baseFlightData + flightGroupBy;
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
  const SQL: string = baseFlightData + `WHERE FT.end_time > $1 OR FT.start_time < $2 ` + flightGroupBy;
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


export const createFlight = async (flight: Flight): Promise<{ error: any, newFlightUUID: string }> => {
  let client: any = null;
  const SQL = `INSERT INTO flight (aircraft_uuid, location_uuid, start_time, end_time, color, title, description, allDay)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING flight_uuid`;
  const values = [flight.aircraft_uuid, flight.location_uuid, flight.start_time, flight.end_time, flight.color, flight.title, flight.description, flight.allDay];
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Create Flight Error :"+error);
  }
  console.log("SQLResult for Creating Flight:", sqlResult);

  return {error: false, newFlightUUID: sqlResult.rows[0].flight_uuid}
}


export const updateFlight = async (flight_uuid: string, updateProps: any): Promise< { error: any } > => {
  if (!updateProps) {
    return {error: "Update Flight was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE flight ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetSQL(validFlightUpdateProps, updateProps, false);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Flight"};
  }

  sql += (sqlSubSet + ` WHERE flight_uuid = $${values.length+1}`);
  console.log("SQL:", sql);
  values.push(flight_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update Flight Error: "+error);
  }
  
  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }
  return { error: false };
}


export const replaceFlight = async (flight_uuid: string, flight: Flight): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE flight ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetSQL(validFlightUpdateProps, flight, false);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Flight"};
  }

  sql += (sqlSubSet + ` WHERE flight_uuid = $${values.length+1}`);
  console.log("SQL:", sql);
  values.push(flight_uuid);
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Replace Flight Error from SQL Query error: "+error);
  }

  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }

  return {error: false};
}


export const removeFlight = async (flight_uuid: string): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = 'DELETE FROM flight WHERE flight_uuid = $1';

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [flight_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Delete Flight Error from SQL Query error: "+error);
  }

  if (sqlResult.rowCount <= 0) {
    return {error: "No row deleted"};
  }

  return {error: false};
}