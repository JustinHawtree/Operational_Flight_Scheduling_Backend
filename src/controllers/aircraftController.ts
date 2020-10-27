import { Request, Response } from "express";
import * as AircraftService from "../services/aircraftService";
import { Aircraft } from "../models/aircraftInterface";

export default class UserController {


  static getOneById = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.id) {
        return res.sendStatus(400);
      }

      const aircraft: Aircraft = await AircraftService.getAircraft(req.params.id);
      return res.status(200).send({ aircraft });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getAllAircrafts = async(req: Request, res: Response): Promise<Response> => {
    try {
      const aircrafts: Array<Aircraft> = await AircraftService.getAllAircrafts();
      return res.status(200).send({ aircrafts });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }


  static createAircraft = async(req: Request, res: Response): Promise<Response> => {
    try {
      const aircraft: Aircraft = req.body;
      let result = await AircraftService.createAircraft(aircraft);

      if (result.error) {
        console.error("Create Aicraft Error:", result.error);
        return res.sendStatus(400);
      }

      return res.status(200).send({aircraft_uuid: result.newAircraftUUID});

    } catch (error) {
      console.error("Delete Aircraft Error:", error.message);
      return res.sendStatus(400);
    }
  }


  static replaceAircraft = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.id) {
        return res.sendStatus(400);
      }

      const aircraft: Aircraft = req.body;
      let result = await AircraftService.replaceAircraft(req.params.id, aircraft);

      if (result.error) {
        console.error("Update Put Aircraft Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);
    
    } catch (error) {
      console.error("Put Update Aircraft Error:", error.message);
      return res.sendStatus(400);
    }
  };


  static editAircraft = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.id) {
        return res.sendStatus(400);
      }

      let result = await AircraftService.updateAircraft(req.params.id, req.body);
      if (result.error) {
        console.error("Patch Update Aircraft Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);

    } catch (error) {
      console.error("Patch Update Aircraft Error:", error.message);
      return res.sendStatus(500);
    }
  };


  static removeAircraft = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.id) {
        return res.sendStatus(400);
      }

      let result = await AircraftService.removeAircraft(req.params.id);
      if (result.error) {
        console.error("Delete Aircraft Error:", result.error);
      }

      return res.sendStatus(200);

    } catch(error) {
      console.error("Delete Update Aircraft Error:", error.message);
      return res.sendStatus(500);
    }
  }
}