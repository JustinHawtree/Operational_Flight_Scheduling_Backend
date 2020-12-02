import ModelPosition, { validModelPositionUpdateProps, baseModelPositionData } from "../models/modelPositionInterface";
import { pool } from "./database.pool";
import { formatSetSQL } from "../util/util";
import CrewPosition from "../models/crewPositionInterface";


export const getModelPosition = async (model_position_uuid: string): Promise<CrewPosition> => {
  let client: any = null;
  const SQL: string = baseModelPositionData + `WHERE model_position_uuid = $1`;
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [model_position_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Model Position Error :"+error);
  }
  return sqlResult.rows[0];
}


export const getAllModelPosition = async (): Promise<Array<CrewPosition>> => {
  let client: any = null;
  const SQL: string = baseModelPositionData;
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Model Positions Error :"+error);
  }
  return sqlResult.rows;
}


export const createModelPosition = async (model_position: ModelPosition): Promise<{ error: any, newModelPositionUUID: string }> => {
  let client: any = null;
  const SQL: string = `INSERT INTO model_position (model_uuid, crew_position_uuid, position_order) VALUES ($1, $2, $3) RETURNING model_position_uuid`;
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [model_position.model_uuid, model_position.crew_position_uuid, model_position.position_order]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Create Model Position Error :"+error);
  }

  return {error: false, newModelPositionUUID: sqlResult.rows[0].model_position_uuid};
}


export const updateModelPosition = async (model_position_uuid: string, updateProps: any): Promise< { error: any } > => {
  if (!updateProps) {
    return {error: "Update Model Position was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE model_position ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetSQL(validModelPositionUpdateProps, updateProps, false);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Model Position"};
  }

  sql += (sqlSubSet + ` WHERE model_position = $${values.length+1}`);
  console.log("SQL:", sql);
  values.push(model_position_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update Model Position Error: "+error);
  }
  
  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }
  return { error: false };
}


export const replaceModelPosition = async (model_position_uuid: string, model_position: ModelPosition): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE model_position ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetSQL(validModelPositionUpdateProps, model_position, false);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Aircraft Model"};
  }

  sql += (sqlSubSet + ` WHERE model_position_uuid = $${values.length+1}`);
  console.log("SQL:", sql);
  values.push(model_position_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(sql, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Replace Model Position Error from SQL Query error: "+error);
  }

  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }

  return {error: false};
}


export const removeModelPosition = async (model_position_uuid: string): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = 'DELETE FROM model_position WHERE model_position_uuid = $1';

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [model_position_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Delete Model Position Error from SQL Query erorr: "+error);
  }

  if (sqlResult.rowCount <= 0) {
    return {error: "No row deleted"};
  }

  return {error: false};
}