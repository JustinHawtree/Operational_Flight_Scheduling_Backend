import Aircraft, { validAircraftUpdateProps, baseAircraftData } from "../models/aircraftInterface";
import { pool } from "./database.pool";
import { formatSetSQL } from "../util/util";


export const getAircraft = async (aircraft_uuid: string): Promise<Aircraft> => {
  let client: any = null;
  const SQL: string = baseAircraftData + "WHERE aircraft_uuid = $1";
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [aircraft_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Aircraft Error: "+error);
  }
  return sqlResult.rows[0];
}


export const getAllAvaliableAircrafts = async (): Promise<Array<Aircraft>> => {
  let client: any = null;
  const SQL: string = baseAircraftData + "WHERE status = 'Available'";
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Avaliable Aircrafts Error "+error);
  }
  return sqlResult.rows;
}


export const getAllAircrafts = async (): Promise<Array<Aircraft>> => {
  let client: any = null;
  const SQL: string = baseAircraftData;
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Aircrafts Error: "+error);
  }
  return sqlResult.rows;
}


export const createAircraft = async (aircraft: Aircraft): Promise<{ error: any, newAircraftUUID: string }> => {
  let client: any = null;
  let values: Array<any> = [];
  let sql: string;
  if (aircraft.status) {
    sql = `INSERT INTO aircraft (model_uuid, status, tail_code) VALUES ($1, $2, $3) RETURNING aircraft_uuid`;
    values.push(aircraft.model_uuid, aircraft.status, aircraft.tail_code)
  } else {
    sql = `INSERT INTO aircraft (model_uuid, tail_code) VALUES ($1, $2) RETURNING aircraft_uuid`;
    values.push(aircraft.model_uuid, aircraft.tail_code);
  }
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Create Aircraft Error :"+error);
  }
  //console.log("SQLResult for Creating Aircraft:", sqlResult);

  return {error: false, newAircraftUUID: sqlResult.rows[0].aircraft_uuid}
}


export const updateAircraft = async (aircraft_uuid: string, updateProps: any): Promise< { error: any } > => {
  if (!updateProps) {
    return {error: "Update Aircraft was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE aircraft ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetSQL(validAircraftUpdateProps, updateProps, false);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Aircraft"};
  }

  sql += (sqlSubSet + ` WHERE aircraft_uuid = $${values.length+1}`);
  console.log("SQL:", sql);
  values.push(aircraft_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update Aircraft Error: "+error);
  }
  
  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }
  return { error: false };
}


export const replaceAircraft = async (aircraft_uuid: string, aircraft: Aircraft): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE aircraft ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetSQL(validAircraftUpdateProps, aircraft, true);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Aircraft"};
  }

  sql += (sqlSubSet + ` WHERE aircraft_uuid = $${values.length+1}`);
  console.log("SQL:", sql);
  values.push(aircraft_uuid);
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Replace Aircraft Error from SQL Query error: "+error);
  }

  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }

  return {error: false};
}


export const removeAircraft = async (aircraft_uuid: string): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = 'DELETE FROM aircraft WHERE aircraft_uuid = $1';

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [aircraft_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Delete Aircraft Error from SQL Query erorr: "+error);
  }

  if (sqlResult.rowCount <= 0) {
    return {error: "No row deleted"};
  }

  return {error: false};
}