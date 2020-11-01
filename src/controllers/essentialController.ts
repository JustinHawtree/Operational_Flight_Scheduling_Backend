import { Request, Response } from "express";
import * as EssentialService from "../services/essentialService";
import Essential from "../models/essentialInterface"
import validator from "validator";


export default class EssentialController {

  static getEssential = async(req: Request, res: Response): Promise<Response> => {
    if (!req.query.start || !req.query.end) {
      console.log("Get Essential Error: did not have all required query paramters");
      return res.sendStatus(400);
    }
    let start_date: string = String(req.query.start);
    let end_date: string = String(req.query.end);

    if (isNaN(Date.parse(start_date)) || isNaN(Date.parse(end_date))) {
      console.log("Get Essential Error: Query Parameters are not valid dates");
      return res.sendStatus(400);
    }

    try {
      const essential: Essential = await EssentialService.getEssential(start_date, end_date);
      return res.status(200).send(essential);
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }
}
