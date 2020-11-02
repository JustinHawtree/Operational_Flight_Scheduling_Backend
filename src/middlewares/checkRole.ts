import { Request, Response, NextFunction } from "express"

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.jwtPayload) {
      console.error("There is no jwtPayload, please put checkJWt function first to fix", req.method, req.url);
      return res.sendStatus(401);
    }

    const role = res.locals.jwtPayload.role;

    // Check to make sure user is authorized for route
    if (roles.indexOf(role) < 0) {
      return res.sendStatus(401);
    }

    next();
  }
}