import User, { validUserUpdateProps, baseUserData } from "../models/userInterface";
import { pool } from "./database.pool";
import { formatSetPatchSQL } from "../util/util";
import validator from "validator";


const makeUserObject = (account_uuid: string, email: string, first_name: string, last_name: string, accepted: boolean,
  rank_uuid: string, pilot_status: string, role: string, user_status: string): User => {
    return { account_uuid, email, first_name, last_name, accepted, rank_uuid, pilot_status, role, user_status };
  }


export const getUser = async (account_uuid: string): Promise<User> => {
  let client: any = null;
  const SQL: string = baseUserData + "WHERE account_uuid = $1";
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [account_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get User Error: "+error);
  }
  return sqlResult.rows[0];
}


export const getAllUsers = async (): Promise<Array<User>> => {
  let client: any = null;
  let userList: Array<User>;
  const SQL: string = baseUserData + "WHERE role != 'Admin'";
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Users Error: "+error);
  }

  userList = sqlResult.rows.map((user: any) => 
    makeUserObject(user.account_uuid, user.email, user.first_name, user.last_name, user.accepted, user.rank_uuid,
      user.pilot_status, user.role, user.user_status)
  )
  return userList;
}


export const getNonApprovedUsers = async (): Promise<Array<User>> => {
  let client: any = null;
  let userList: Array<User>;
  const SQL: string = baseUserData + " WHERE accepted = false";
  let sqlResult: any = null;

  try{
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Non Approved Users Error: "+error);
  }

  userList = sqlResult.rows.map((user: any) => 
    makeUserObject(user.account_uuid, user.email, user.first_name, user.last_name, user.accepted, user.rank_uuid,
      user.pilot_status, user.role, user.user_status)
  )
  return userList;
}


export const getPilots = async (): Promise<Array<User>> => {
  let client: any = null;
  let userList: Array<User>;
  const SQL: string = baseUserData + " WHERE pilot_status <> 'N/A'";
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get Pilots Users Error: "+error);
  }

  userList = sqlResult.rows.map((user: any) => 
    makeUserObject(user.account_uuid, user.email, user.first_name, user.last_name, user.accepted, user.rank_uuid,
      user.pilot_status, user.role, user.user_status)
  )
  return userList;
}


export const updateUser = async (account_uuid: string, updateProps: any): Promise< { error: any } > => {
  if (!updateProps) {
    return {error: "Update User was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let SQL: string = "UPDATE account ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetPatchSQL(validUserUpdateProps, updateProps);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for User"};
  }

  SQL += (sqlSubSet + ` WHERE account_uuid = $${values.length+1}`);
  console.log("SQL:", SQL);
  values.push(account_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update User Error :"+error);
  }
  
  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }
  return { error: false };
}


export const replaceUser = async (account_uuid: string, user: User): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  const SQL: string = `UPDATE account SET first_name = $1, last_name = $2, accepted = $3, rank_uuid = $4, pilot_status = $5,
                        role = $6, user_status = $7 WHERE account_uuid = $8`;
  let values = [user.first_name, user.last_name, user.accepted, user.rank_uuid, user.pilot_status, user.role, user.user_status, account_uuid];
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Replace User Error from SQL Query error :"+error);
  }
  console.log("SQLResult for replace:", sqlResult);

  if (sqlResult.rowCount <= 0) {
    return {error: "No row updated"};
  }

  return {error: false};
}


export const approveUsers = async (account_uuids: Array<string>): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  let sql: string = "UPDATE account SET accepted = true WHERE account_uuid IN (";
  let valuePos: number = 1;
  let valuesArray: Array<string> = [];

  for (let i: number = 0; i < account_uuids.length; i++) {
    if (validator.isUUID(account_uuids[i], 4)) {
      sql += `$${valuePos++}, `;
      valuesArray.push(account_uuids[i]);
    }
  }

  if (valuesArray.length === 0) {
    return {error: "No valid acount uuid's were given to approveUsers function"};
  }

  sql = sql.slice(0, -2);
  sql += ")";

  try {
    client = await pool.conenct();
    sqlResult = await client.query(sql, valuesArray);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("approve Users Error from SQL Query error :"+error);
  }

  return {error: false};
}