import { Request, Response } from "express";
import * as LocationService from "../services/locationService";
import Location from "../models/locationInterface";
import validator from "validator";


export default class LocationController {
  static getOneByUUID = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      } 

      const location: Location = await LocationService.getLocation(req.params.uuid);
      return res.status(200).send({ location });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getAllLocations = async(req: Request, res: Response): Promise<Response> => {
    try {
      const locations: Array<Location> = await LocationService.getAllLocations();
      return res.status(200).send({ locations });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }


  static createLocation = async(req: Request, res: Response): Promise<Response> => {
    try {
      const location: Location = req.body;
      let result = await LocationService.createLocation(location);

      if (result.error) {
        console.error("Create Location Error:", result.error);
        return res.sendStatus(400);
      }

      return res.status(200).send({location_uuid: result.newLocationUUID});

    } catch (error) {
      console.error("Create Location Error:", error.message);
      return res.sendStatus(400);
    }
  }


  static replaceLocation = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      const location: Location = req.body;
      let result = await LocationService.replaceLocation(req.params.uuid, location);

      if (result.error) {
        console.error("Replace Location Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);
    
    } catch (error) {
      console.error("Replace Location Error:", error.message);
      return res.sendStatus(400);
    }
  };


  static editLocation = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await LocationService.updateLocation(req.params.uuid, req.body);
      if (result.error) {
        console.error("Edit Location Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);

    } catch (error) {
      console.error("Edit Location Error:", error.message);
      return res.sendStatus(500);
    }
  };


  static removeLocation = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await LocationService.removeLocation(req.params.uuid);
      if (result.error) {
        console.error("Delete Location Error:", result.error);
      }

      return res.sendStatus(200);

    } catch(error) {
      console.error("Delete Location Error:", error.message);
      return res.sendStatus(500);
    }
  }
}