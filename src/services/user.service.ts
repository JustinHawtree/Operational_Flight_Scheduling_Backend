import { User, validUserUpdateProps } from "../models/user.interface";
import { pool } from "./database.pool";
import { compareHash, getHash } from "../util/bcrypt";
import { setToken } from "../util/jwt";
import { formatSetPatchSQL } from "../util/util";

const baseUserData: string = "SELECT account_uuid, first_name, last_name, rank_uuid, pilot_status, role, user_status FROM account";

const makeUserObject = (account_uuid: string, email: string, first_name: string, last_name: string, accepted: boolean,
  rank_uuid: string, pilot_status: string, role: string, user_status: string): User => {
    return {account_uuid, email, first_name, last_name, accepted, rank_uuid, pilot_status, role, user_status};
  }


export const getUser = async (account_uuid: string): Promise<User> => {
  let client: any = null;
  let user: User;
  const SQL: string = baseUserData + " WHERE account_uuid = $1";
  let sqlResult: any = null;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [account_uuid]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get User Error:"+error);
  }
  return sqlResult.rows[0];
}


export const getAllUsers = async (): Promise<Array<User>> => {
  let client: any = null;
  let userList: Array<User>;
  const SQL: string = baseUserData + " WHERE role != 'Admin'";
  let sqlResult: any = null;
  
  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Get All Users Error:"+error);
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
    throw new Error("Get Non Approved Users Error:"+error);
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
    throw new Error("Get Pilots Users Error:"+error);
  }

  userList = sqlResult.rows.map((user: any) => 
    makeUserObject(user.account_uuid, user.email, user.first_name, user.last_name, user.accepted, user.rank_uuid,
      user.pilot_status, user.role, user.user_status)
  )
  return userList;
}


export const loginUser = async (email: string, password: string): Promise<Object> => {
  let client: any = null;
  let user: User;
  const SQL: string = "SELECT password, accepted, role, account_uuid FROM account WHERE email = $1";
  let sqlResult: any;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [email]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Login Error from SQL Query error:"+error);
  }


  if (sqlResult.rows.length === 0) {
    throw new Error("No User Found with email: "+email);
  }

  let passwordCheck = await compareHash(password, sqlResult.rows[0].password);

  // Check to see if its the correct password for the desired account
  if (!passwordCheck) {
    throw new Error("Login User Error: Bad Password attempt for: "+email)
  }

  // Check to see if the user has been approved
  if (!sqlResult.rows[0].accepted) {
    throw new Error("Login User Error: User not approved: "+email)
  }

  let tokenResult: any = await setToken({ email, role: sqlResult.rows[0].role }).catch((error) =>{
    throw new Error("JWT ERROR: loginUser setToken() error"+error);
  });

  
  return {
    account_uuid: sqlResult.rows[0].account_uuid,
    access_token: tokenResult.token,
    access_token_created: tokenResult.tokenDate,
    access_token_expires_in: tokenResult.expires_in,
    role: sqlResult.rows[0].role,
    email: email
  } 
}


export const signUpUser = async (email: string, password: string, first_name: string,
  last_name: string): Promise<Object> => {
    let client: any = null;
    let sqlResult: any = null;
    let hashPassword: string = await getHash(password).catch((error) => {
      throw new Error("Bcrypt Error: signupUser bcrypt error:"+error); 
    })

    const SQL: string = "INSERT INTO account(email, password, first_name, last_name, accepted) VALUES($1, $2, $3, $4, $5)";
    const values: Array<any> = [email, hashPassword, first_name, last_name, false];
    
    try {
      client = await pool.connect();
      sqlResult = await client.query(SQL, values);
      client.release();
    } catch (error) {
      if (client) client.release();
      if (error.code === '23505') {
        if (error.constraint === 'account_email_key') {
          return {error: "Email is already in use."};
        }
      }
      throw new Error("Signup Error from SQL Query error:"+error);
    }
  return {};
}


export const updateUser = async (account_uuid: string, updateProps: any): Promise<Object> => {
  if (!updateProps) {
    return {error: "Update User was given a null or empty updateProps argument"};
  }
  let client: any = null;
  let sqlResult: any = null;
  let SQL: string = "UPDATE account ", sqlSubSet: string;
  let values: Array<any>;
  [sqlSubSet, values] = formatSetPatchSQL(validUserUpdateProps, updateProps);
  
  if (values.length <= 0) {
    return {error: "Body didnt have any valid column names for"};
  }

  SQL += (sqlSubSet + ` WHERE account_id = $${values.length+1}`);
  console.log("SQL:", SQL);
  values.push(account_uuid);

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, values);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Update User Error:"+error);
  }
  console.log("SQLResult for Update:", sqlResult);

  return {};
}


export const replaceUser = async (account_uuid: string, user: User): Promise<Object> => {
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
    throw new Error("Replace User Error from SQL Query error:"+error);
  }
  return {};
}