/* test flightService */

import * as  flightController from "../controllers/flightController";
import * as flightService from "../services/flightService";
import Flight, { validFlightUpdateProps, baseFlightData, flightGroupBy } from "../models/flightInterface";

import { expect } from 'chai';

var testFlight : Flight;

describe('#createCrewPosition()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

})  