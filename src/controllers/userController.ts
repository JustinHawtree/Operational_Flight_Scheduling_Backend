import { Request, Response } from "express";
import * as UserService from "../services/userService";
import { User } from "../models/userInterface";

export default class UserController {


  static getOneById = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.id) {
        return res.sendStatus(400);
      }

      const user: User = await UserService.getUser(req.params.id);
      return res.status(200).send({ user });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getAllUsers =  async(req: Request, res: Response): Promise<Response> => {
    try {
      const users: Array<User> = await UserService.getAllUsers();
      return res.status(200).send({ users });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }


  static getNonApprovedUsers =  async(req: Request, res: Response): Promise<Response> => {
    try {
      const users: Array<User> = await UserService.getNonApprovedUsers();
      return res.status(200).send({ users });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getPilots = async(req: Request, res: Response): Promise<Response> => {
    try {
      const users: Array<User> = await UserService.getPilots();
      return res.status(200).send({ users });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }


  static replaceUser = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.id) {
        return res.sendStatus(400);
      }

      const user: User = req.body;
      let result = await UserService.replaceUser(req.params.id, user);

      if (result.error) {
        console.error("Path Update Put User Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);
    
    } catch (error) {
      console.error("Put Update User Error:", error.message);
      return res.sendStatus(400);
    }
  };


  static editUser = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.id) {
        return res.sendStatus(400);
      }

      let result = await UserService.updateUser(req.params.id, req.body);
      if (result.error) {
        console.error("Path Update Patch User Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);

    } catch (error) {
      console.error("Patch Update User Error:", error.message);
      return res.sendStatus(500);
    }
  };
}