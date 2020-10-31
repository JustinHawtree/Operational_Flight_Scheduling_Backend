import { Request, Response } from "express";
import * as CrewPositionService from "../services/crewPositionService";
import CrewPosition from "../models/crewPositionInterface";
import validator from "validator";


export default class CrewPositionController {
  static getOneByUUID = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      } 

      const crew_position: CrewPosition = await CrewPositionService.getCrewPosition(req.params.uuid);
      return res.status(200).send({ crew_position: crew_position });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getAllCrewPositions = async(req: Request, res: Response): Promise<Response> => {
    try {
      const crew_positions: Array<CrewPosition> = await CrewPositionService.getAllCrewPositions();
      return res.status(200).send({ crew_positions });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }


  static createCrewPosition = async(req: Request, res: Response): Promise<Response> => {
    try {
      const crew_position: CrewPosition = req.body;
      let result = await CrewPositionService.createCrewPosition(crew_position);

      if (result.error) {
        console.error("Create Crew Position Error:", result.error);
        return res.sendStatus(400);
      }

      return res.status(200).send({crew_position_uuid: result.newCrewPositionUUID});

    } catch (error) {
      console.error("Create Crew Position Error:", error.message);
      return res.sendStatus(400);
    }
  }


  static replaceCrewPosition = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      const crew_position: CrewPosition = req.body;
      let result = await CrewPositionService.replaceCrewPosition(req.params.uuid, crew_position);

      if (result.error) {
        console.error("Replace Crew Position Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);
    
    } catch (error) {
      console.error("Replace Crew Position Error:", error.message);
      return res.sendStatus(400);
    }
  };


  static editCrewPosition = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await CrewPositionService.updateCrewPosition(req.params.uuid, req.body);
      if (result.error) {
        console.error("Edit Crew Position Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);

    } catch (error) {
      console.error("Edit Crew Position Error:", error.message);
      return res.sendStatus(500);
    }
  };


  static removeCrewPosition = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await CrewPositionService.removeCrewPosition(req.params.uuid);
      if (result.error) {
        console.error("Delete Crew Position Error:", result.error);
      }

      return res.sendStatus(200);

    } catch(error) {
      console.error("Delete Crew Position Error:", error.message);
      return res.sendStatus(500);
    }
  }
}