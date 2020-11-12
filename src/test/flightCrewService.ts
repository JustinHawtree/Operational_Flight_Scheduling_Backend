/* test flightCrewService */

import * as flightCrewService from "../services/flightCrewService";
import FlightCrew, { validFlightCrewUpdateProps, baseFlightCrewData } from "../models/flightCrewInterface";
import Flight, { validFlightUpdateProps, baseFlightData, flightGroupBy } from "../models/flightInterface";
import User, { validUserUpdateProps, baseUserData } from "../models/userInterface";

import { expect } from 'chai';

var testFlightCrew : FlightCrew;

describe('#createFlightCrew()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

})