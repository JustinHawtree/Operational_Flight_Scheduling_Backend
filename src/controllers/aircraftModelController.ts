import { Request, Response } from "express";
import * as AircraftModelService from "../services/aircraftModelService";
import AircraftModel from "../models/aircraftModelInterface";
import validator from "validator";


export default class AircraftModelController {
  static getOneByUUID = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      } 

      const aircraft_model: AircraftModel = await AircraftModelService.getAircraftModel(req.params.uuid);
      return res.status(200).send({ aircraft_model });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getAllAircraftModels = async(req: Request, res: Response): Promise<Response> => {
    try {
      const aircraft_models: Array<AircraftModel> = await AircraftModelService.getAllAircraftModels();
      return res.status(200).send({ aircraft_models });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }


  static createAircraftModel = async(req: Request, res: Response): Promise<Response> => {
    try {
      const aircraft_model: AircraftModel = req.body;
      let result = await AircraftModelService.createAircraftModel(aircraft_model);

      if (result.error) {
        console.error("Create Aicraft Model Error:", result.error);
        return res.sendStatus(400);
      }

      return res.status(200).send({aircraft_uuid: result.newAircraftModelUUID});

    } catch (error) {
      console.error("Create Aircraft Model Error:", error.message);
      return res.sendStatus(400);
    }
  }


  static replaceAircraftModel = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      const aircraft_model: AircraftModel = req.body;
      let result = await AircraftModelService.replaceAircraftModel(req.params.uuid, aircraft_model);

      if (result.error) {
        console.error("Replace Aircraft Model Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);
    
    } catch (error) {
      console.error("Repalce Aircraft Error:", error.message);
      return res.sendStatus(400);
    }
  };


  static editAircraftModel = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await AircraftModelService.updateAircraftModel(req.params.uuid, req.body);
      if (result.error) {
        console.error("Edit Aircraft Model Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);

    } catch (error) {
      console.error("Edit Aircraft Model Error:", error.message);
      return res.sendStatus(500);
    }
  };


  static removeAircraftModel = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await AircraftModelService.removeAircraftModel(req.params.uuid);
      if (result.error) {
        console.error("Delete Aircraft Model Error:", result.error);
      }

      return res.sendStatus(200);

    } catch(error) {
      console.error("Delete Update Aircraft Model Error:", error.message);
      return res.sendStatus(500);
    }
  }
}