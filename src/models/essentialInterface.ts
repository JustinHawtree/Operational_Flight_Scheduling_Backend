import AircraftModel from "../models/aircraftModelInterface";
import Aircraft from "../models/aircraftInterface";
import CrewPosition from "../models/crewPositionInterface";
import Location from '../models/locationInterface';
import User from "../models/userInterface";
import Flight from "../models/flightInterface";
import MetaPosition from "../models/metaPositionInterface";

export default interface Essential {
  aircrafts: Array<Aircraft>;
  locations: Array<Location>;
  crew_positions: Array<CrewPosition>;
  airmen: Array<User>;
  aircraft_models: Array<AircraftModel>;
  flights: Array<Flight>;
  meta_positions: Array<MetaPosition>;
}
