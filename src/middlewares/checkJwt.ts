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