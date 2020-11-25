export default interface User {
  account_uuid: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  accepted: boolean;
  rank_uuid: string;
  pilot_status: string;
  role: string;
  user_status: string; 
  created_on?: string;
  last_login?: string;
}

export const validUserUpdateProps: Array<string> = ["first_name", "last_name", "accepted", "rank_uuid",
  "pilot_status", "role", "user_status", "created_on", "last_login"];

export const baseUserData: string = `SELECT account_uuid, first_name, last_name, rank_uuid, accepted, pilot_status,
 role, user_status FROM account `;
