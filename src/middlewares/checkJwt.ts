import { Request, Response, NextFunction } from "express";
import { decryptToken } from "../util/jwt";

export async function checkJwt(req: Request, res: Response, next: NextFunction) {
  try {
    let jwtPayload = await decryptToken(req.headers["authorization"]);
    res.locals.jwtPayload = jwtPayload;
    
  } catch (error) {
    let errorString = "Expected Token Error: ";
    if (error.name || error.message) {
      errorString += "Error Name:" + error.name+" ";
      errorString += "Error Message:" + error.message;
    } else {
      errorString += error;
    }
    console.log(errorString);
    return res.status(401).send({error: 'Authentication Failure: Token Denied'});
  }
  next();
}

export async function checkJwtWebsocket(token: string): Promise<{ error: any, jwtPayload: any }> {
  try {
    let jwtPayload = await decryptToken(token);
    return { error: false, jwtPayload };

  } catch (error) {
    let errorString = "Expected Token Error: ";
    if (error.name || error.message) {
      errorString += "Error Name:" + error.name+" ";
      errorString += "Error Message:" + error.message;
    } else {
      errorString += error;
    }
    console.error("Check Jwt Webscoket Error: ", errorString);
    return { error: error.message, jwtPayload: null };
  }
}