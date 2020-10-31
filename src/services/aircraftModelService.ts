import AircraftModel, { validAircraftModelUpdateProps, baseAircraftModelData } from "../models/aircraftModelInterface";
import { pool } from "./database.pool";
import { formatSetPatchSQL } from "../util/util";


export const getAircraftModel = async (model_uuid: string): Promise<AircraftModel> => {
  let client: any = null;
  const SQL: string = baseAircraftModelData + `WHERE AM.model_uuid = $1 GROUP BY AM.model_uuid, AM.model_name`;
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [model_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Aircraft Model Error :"+error);
  }
  return sqlResult.rows[0];
}


export const getAllAircraftModels = async (): Promise<Array<AircraftModel>> => {
  let client: any = null;
  const SQL: string = baseAircraftModelData + `GROUP BY AM.model_uuid, AM.model_name`;
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Aircraft Models Error :"+error);
  }
  return sqlResult.rows;
}


export const createAircraftModel = async (aircraft_model: AircraftModel): Promise<{ error: any, newAircraftModelUUID: string }> => {
  let client: any = null;
  const SQL: string = `INSERT INTO aircraft_model (model_name) VALUES ($1) RETURNING model_uuid`;
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [aircraft_model.model_name]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Create Aircraft Model Error :"+error);
  }
  console.log("SQLResult for Creating Aircraft Model:", sqlResult);

  return {error: false, newAircraftModelUUID: sqlResult.rows[0].model_uuid}
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