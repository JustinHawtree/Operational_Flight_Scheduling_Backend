import { pool } from "./database.pool";
import { formatSetPatchSQL } from "../util/util";
import Location, { baseLocationData, validLocationUpdateProps } from "../models/locationInterface";


export const getLocation = async (location_uuid: string): Promise<Location> => {
  let client: any = null;
  const SQL: string = baseLocationData + " WHERE location_uuid = $1";
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [location_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Location Error :"+error);
  }
  return sqlResult.rows[0];
}


export const getAllLocations = async (): Promise<Array<Location>> => {
  let client: any = null;
  const SQL: string = baseLocationData;
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Locations Error :"+error);
  }
  return sqlResult.rows;
}


export const createLocation = async (location: Location): Promise<{ error: any, newLocationUUID: string }> => {
  let client: any = null;
  const SQL: string = `INSERT INTO location (location_name, track_num) VALUES ($1, $2) RETURNING location_uuid`;
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [location.location_name, location.track_num]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Create Location Error :"+error);
  }
  console.log("SQLResult for Creating Location:", sqlResult);

  return {error: false, newLocationUUID: sqlResult.rows[0].location_uuid}
}


export const updateLocation = async (location_uuid: string, updateProps: any): Promise< { error: any } > => {
  if (!updateProps) {
    return {error: "Update Location was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let SQL: string = "UPDATE location ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetPatchSQL(validLocationUpdateProps, updateProps);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Location"};
  }

  SQL += (sqlSubSet + ` WHERE location_uuid = $${values.length+1}`);
  console.log("SQL:", SQL);
  values.push(location_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update Location Error: "+error);
  }
  
  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }
  return { error: false };
}


export const replaceLocation = async (location_uuid: string, location: Location): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = `UPDATE location SET location_name = $1, track_num = $2 WHERE location_uuid = $3`;
  let values = [location.location_name, location.track_num, location_uuid];
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Replace Location Error from SQL Query error: "+error);
  }
  console.log("SQLResult for replace:", sqlResult);

  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }

  return {error: false};
}


export const removeLocation = async (location_uuid: string): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = 'DELETE FROM location WHERE location_uuid = $1';

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, location_uuid);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Delete Location Error from SQL Query erorr: "+error);
  }
  console.log("SQLResult for replace:", sqlResult);

  if (sqlResult.rowCount <= 0) {
    return {error: "No row deleted"};
  }

  return {error: false};
}