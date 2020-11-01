import { Request, Response } from "express";
import * as FlightService from "../services/flightService";
import Flight from "../models/flightInterface";
import validator from "validator";


export default class FlightController {
  static getOneByUUID = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      } 

      const flight: Flight = await FlightService.getFlight(req.params.uuid);
      return res.status(200).send({ flight });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };


  static getAllFlights = async(req: Request, res: Response): Promise<Response> => {
    try {
      const flights: Array<Flight> = await FlightService.getAllFlights();
      return res.status(200).send({ flights });
    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  }


  static createFlight = async(req: Request, res: Response): Promise<Response> => {
    try {
      const flight: Flight = req.body;
      let result = await FlightService.createFlight(flight);

      if (result.error) {
        console.error("Create Flight Error:", result.error);
        return res.sendStatus(400);
      }

      return res.status(200).send({flight_uuid: result.newFlightUUID});

    } catch (error) {
      console.error("Create Flight Error:", error.message);
      return res.sendStatus(400);
    }
  }


  static replaceFlight = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      const flight: Flight = req.body;
      let result = await FlightService.replaceFlight(req.params.uuid, flight);

      if (result.error) {
        console.error("Replace Flight Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);
    
    } catch (error) {
      console.error("Replace Flight Error:", error.message);
      return res.sendStatus(400);
    }
  };


  static editFlight = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await FlightService.updateFlight(req.params.uuid, req.body);
      if (result.error) {
        console.error("Edit Flight Error:", result.error);
        return res.sendStatus(400);
      }

      return res.sendStatus(200);

    } catch (error) {
      console.error("Edit Flight Error:", error.message);
      return res.sendStatus(500);
    }
  };


  static removeFlight = async(req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.uuid || !validator.isUUID(req.params.uuid, 4)) {
        return res.sendStatus(400);
      }

      let result = await FlightService.removeFlight(req.params.uuid);
      if (result.error) {
        console.error("Delete Flight Error:", result.error);
      }

      return res.sendStatus(200);

    } catch(error) {
      console.error("Delete Flight Error:", error.message);
      return res.sendStatus(500);
    }
  }
}