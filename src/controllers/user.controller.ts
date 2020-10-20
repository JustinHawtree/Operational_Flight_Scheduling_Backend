import express, { Request, Response } from "express";
import validator from 'validator';
import * as UserService from "../services/user.service";
import { User } from "../models/user.interface";


export const UserRouter = express.Router();


UserRouter.post("/login", async(req: Request, res: Response) => {
  try {
    // Make sure body has email
    if (!validator.isEmail(req.body.email)) {
      return res.sendStatus(400);
    }
    // Make sure body has password
    if (!req.body.password) {
      return res.sendStatus(400);
    }
    let loginObj = await UserService.loginUser(req.body.email, req.body.password);
    return res.status(200).send(loginObj);
  } catch (error) {
    console.error("Login Error: User", req.body.email, "tried to log in, with Error:", error);
    return res.sendStatus(400);
  }
});


UserRouter.post("/signup", async(req: Request, res: Response) => {
  try {
    if (!validator.isEmail(req.body.email)) {
      return res.sendStatus(400);
    }
    if (!req.body.password) {
      return res.sendStatus(400);
    }
    if (!req.body.first_name) {
      return res.sendStatus(400);
    }
    if (!req.body.last_name) {
      return res.sendStatus(400);
    }
    let signupObject: any = UserService.signupUser(req.body.email, req.body.password, req.body.first_name, req.body.last_name);
    if (signupObject.error) {
      return res.status(400).send({error: signupObject.error});
    }
    return res.sendStatus(201);
  } catch (error){
    console.error("Signup Error: User", req.body.email, "tried to sign up, with Error:", error);
    return res.sendStatus(400);
  }
});


UserRouter.get("/users", async(req: Request, res: Response) => {
  try {
    const users: Array<User> = await UserService.getAllUsers();
    return res.status(200).send({ users });
  } catch (error) {
    console.error(error.message);
    return res.sendStatus(500);
  }
})


UserRouter.get("/approval", async(req: Request, res: Response) => {
  try {
    const users: Array<User> = await UserService.getNonApprovedUsers();
    return res.status(200).send({ users });
  } catch (error) {
    console.error(error.message);
    return res.sendStatus(500);
  }
})


UserRouter.get("/pilots", async(req: Request, res: Response) => {
  try {
    const users: Array<User> = await UserService.getPilots();
    return res.status(200).send({ users });
  } catch (error) {
    console.error(error.message);
    return res.sendStatus(500);
  }
})