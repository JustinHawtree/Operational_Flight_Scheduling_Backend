import { pool } from "./database.pool";
import { formatSetPatchSQL } from "../util/util";
import CrewPosition, { baseCrewPositionData, validCrewPositionUpdateProps } from "../models/crewPositionInterface";


export const getCrewPosition = async (crew_position_uuid: string): Promise<CrewPosition> => {
  let client: any = null;
  const SQL: string = baseCrewPositionData + "WHERE crew_position_uuid = $1";
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [crew_position_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Crew Position Error :"+error);
  }
  return sqlResult.rows[0];
}


export const getAllCrewPositions = async (): Promise<Array<CrewPosition>> => {
  let client: any = null;
  const SQL: string = baseCrewPositionData;
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Crew Positions Error :"+error);
  }
  return sqlResult.rows;
}


export const createCrewPosition = async (crewPosition: CrewPosition): Promise<{ error: any, newCrewPositionUUID: string }> => {
  let client: any = null;
  const SQL: string = `INSERT INTO crew_positon (position, required) VALUES ($1, $2) RETURNING crew_position_uuid`;
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [crewPosition.position, crewPosition.required]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Create Crew Position Error :"+error);
  }
  console.log("SQLResult for Creating Crew Position:", sqlResult);

  return {error: false, newCrewPositionUUID: sqlResult.rows[0].crew_position_uuid}
}


export const updateCrewPosition = async (crew_position_uuid: string, updateProps: any): Promise< { error: any } > => {
  if (!updateProps) {
    return {error: "Update Crew Position was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let SQL: string = "UPDATE crew_position ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetPatchSQL(validCrewPositionUpdateProps, updateProps);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for Crew Position"};
  }

  SQL += (sqlSubSet + ` WHERE crew_position_uuid = $${values.length+1}`);
  console.log("SQL:", SQL);
  values.push(crew_position_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update Crew Position Error: "+error);
  }
  
  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }
  return { error: false };
}


export const replaceCrewPosition = async (crew_position_uuid: string, crewPosition: CrewPosition): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = `UPDATE crew_position SET position = $1, required = $2 WHERE crew_position_uuid = $3`;
  let values = [crewPosition.position, crewPosition.required, crew_position_uuid];
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Replace Crew Position Error from SQL Query error: "+error);
  }
  console.log("SQLResult for replace:", sqlResult);

  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }

  return {error: false};
}


export const removeCrewPosition = async (crew_position_uuid: string): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = 'DELETE FROM crew_position WHERE crew_position_uuid = $1';

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [crew_position_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Delete Crew Position Error from SQL Query erorr: "+error);
  }
  console.log("SQLResult for replace:", sqlResult);

  if (sqlResult.rowCount <= 0) {
    return {error: "No row deleted"};
  }

  return {error: false};
}