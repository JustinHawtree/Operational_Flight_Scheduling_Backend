import { Request, Response } from "express";
import * as UserService from "../services/userService";
import User from "../models/userInterface";
import validator from "validator";


export default class UserController {
  static getOneByUUID = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      } 

      const user: User = await UserService.getUser(req.params.uuid);
      return res.status(200).send({ user });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getAllUsers =  async(_: any, res: Response): Promise<Response> => {
    try {
      const users: Array<User> = await UserService.getAllUsers();
      return res.status(200).send({ users });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }


  static getNonApprovedUsers =  async(_: any, res: Response): Promise<Response> => {
    try {
      const users: Array<User> = await UserService.getNonApprovedUsers();
      return res.status(200).send({ users });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getPilots = async(_: any, res: Response): Promise<Response> => {
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
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      const user: User = req.body;
      let result = await UserService.replaceUser(req.params.uuid, user);

      if (result.error) {
        console.error("Replace User Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);
    
    } catch (error) {
      console.error("Repalce User Error:", error.message);
      return res.sendStatus(400);
    }
  };


  static editUser = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await UserService.updateUser(req.params.uuid, req.body);
      if (result.error) {
        console.error("Edit User Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);

    } catch (error) {
      console.error("Edit User Error:", error.message);
      return res.sendStatus(500);
    }
  };


  static approveUser = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.body.approve) {
        return res.sendStatus(400);
      }

      let result = await UserService.approveUsers(req.body.approve);
      if (result.error) {
        console.error("Approve Users Service Error", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);
    
    } catch (error) {
      console.error("Approve Users Service Error", error.message);
      return res.sendStatus(500);
    }
  }
}