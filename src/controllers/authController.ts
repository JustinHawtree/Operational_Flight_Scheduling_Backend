import { Request, Response } from "express";
import validator from 'validator';
import * as AuthService from "../services/authService";


export default class AuthController {

  // Post
  static login = async(req: Request, res: Response): Promise<Response> => {
    try {
      // Make sure body has email
      if (!validator.isEmail(req.body.email)) {
        return res.sendStatus(400);
      }
      // Make sure body has password
      if (!req.body.password) {
        return res.sendStatus(400);
      }
      let loginObj = await AuthService.loginUser(req.body.email, req.body.password);
      return res.status(200).send(loginObj);
    } catch (error) {
      console.error("Login Error: User", req.body.email, "tried to log in, with Error:", error.message);
      return res.sendStatus(400);
    }
  };

  // Post
  // Signup Route is going to take around ~500ms (0.5 sec) Since the bcyrpt rounds is 12
  static signup =  async(req: Request, res: Response): Promise<Response> => {
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

      let signupObject: any = await AuthService.signUpUser(req.body.email, req.body.password, req.body.first_name, req.body.last_name);
      
      if (signupObject.error) {
        return res.status(400).send({error: signupObject.error});
      }
      
      return res.sendStatus(201);
    
    } catch (error){
      console.error("Signup Error: User", req.body.email, "tried to sign up, with Error:", error.message);
      return res.sendStatus(400);
    }
  };
}