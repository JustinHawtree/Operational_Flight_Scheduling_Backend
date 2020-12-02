import { Request, Response } from "express";
const { Parser } = require('json2csv');
import { getEssential } from "../services/essentialService";


export default class csvController {
  static getCSV = async (req: Request, res: Response): Promise<Response> => {
    if (!req.query.start || !req.query.end) {
      console.log("Get CSV Error: did not have all required query paramters");
      return res.sendStatus(400);
    }
    let start_date: string = String(req.query.start);
    let end_date: string = String(req.query.end);

    if (isNaN(Date.parse(start_date)) || isNaN(Date.parse(end_date))) {
      console.log("Get CSV Error: Query Parameters are not valid dates");
      return res.sendStatus(400);
    }

    try {
      let { airmen, crew_positions: crewPos, flights, aircrafts, aircraft_models, locations, ...other } = await getEssential(start_date, end_date);

      let roleMap = crewPos.reduce((acc: any, { crew_position_uuid, position }) => {
        acc[crew_position_uuid] = position;
        return acc;
      }, {})

      let modelMap = aircraft_models.reduce((acc: any, { model_name, model_uuid }) => {
        acc[model_uuid] = model_name;
        return acc;
      }, {})

      let aircraftMap = aircrafts.reduce((acc: any, { aircraft_uuid, model_uuid }) => {
        acc[aircraft_uuid] = modelMap[model_uuid];
        return acc;
      }, {})

      let locationMap = locations.reduce((acc: any, { location_uuid, location_name }) => {
        acc[location_uuid] = location_name;
        return acc;
      }, {})

      let crewMap = airmen.reduce((acc: any, { account_uuid, first_name, last_name }) => {
        acc[account_uuid] = `${first_name} ${last_name}`;
        return acc;
      }, {})

      let result = flights.reduce((acc: any, flight: any) => {
        if (!acc[flight.flight_uuid]) {
          acc[flight.flight_uuid] = {
            "Flight Name": flight.title,
            "Start Date": flight.start,
            "End Date": flight.end,
            "Aircraft": aircraftMap[flight.aircraft_uuid],
            "Location": locationMap[flight.location_uuid],
          }
        }
        flight["crew_members"].forEach((mem: any) => {
          acc[flight.flight_uuid][roleMap[mem.crew_position_uuid]] = crewMap[mem.airman_uuid];
        });

        return acc;
      }, {});

      const json2csvParser = new Parser({});
      const csv = json2csvParser.parse(Object.values(result));

      res.setHeader('Content-disposition', 'attachment; filename=data.csv');
      res.set('Content-Type', 'text/csv');
      return res.status(200).send(csv);

    } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
  };
}

