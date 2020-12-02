import { compareHash, getHash } from "../util/bcrypt";
import { setToken } from "../util/jwt";
import { pool } from "./database.pool";


export const loginUser = async (email: string, password: string): Promise<Object> => {
  let client: any = null;
  const SQL: string = "SELECT password, accepted, role, account_uuid, first_name, last_name FROM account WHERE email = $1";
  let sqlResult: any;

  try {
    client = await pool.connect();
    sqlResult = await client.query(SQL, [email]);
    client.release();
  } catch (error) {
    if (client) client.release();
    throw new Error("Login Error from SQL Query error:" + error);
  }


  if (sqlResult.rows.length === 0) {
    throw new Error("No User Found with email: " + email);
  }

  let passwordCheck = await compareHash(password, sqlResult.rows[0].password);

  // Check to see if its the correct password for the desired account
  if (!passwordCheck) {
    throw new Error("Login User Error: Bad Password attempt for: " + email)
  }

  // Check to see if the user has been approved
  if (!sqlResult.rows[0].accepted) {
    throw new Error("Login User Error: User not approved: " + email)
  }

  let tokenResult: any = await setToken({ first_name: sqlResult.rows[0].first_name, last_name: sqlResult.rows[0].last_name, email, role: sqlResult.rows[0].role }).catch((error) => {
    throw new Error("JWT ERROR: loginUser setToken() error: " + error);
  });


  return {
    account_uuid: sqlResult.rows[0].account_uuid,
    access_token: tokenResult.token,
    access_token_created: tokenResult.tokenDate,
    access_token_expires_in: tokenResult.expires_in,
    role: sqlResult.rows[0].role,
    email: email,
    first_name: sqlResult.rows[0].first_name,
    last_name: sqlResult.rows[0].last_name,
  }
}


export const signUpUser = async (email: string, password: string, first_name: string,
  last_name: string): Promise<{ error: any }> => {
  let client: any = null;
  let sqlResult: any = null;
  let hashPassword: string = await getHash(password).catch((error) => {
    throw new Error("Bcrypt Error: signupUser bcrypt error:" + error);
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
        return { error: "Email is already in use." };
      }
    }
    throw new Error("Signup Error from SQL Query error :" + error);
  }
  return { error: false };
}