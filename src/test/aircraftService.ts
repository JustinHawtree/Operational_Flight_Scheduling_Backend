/* test aircraftService */

import * as AircraftController from "../controllers/aircraftController";
import * as AircraftService from "../services/aircraftService";
import Aircraft, { validAircraftUpdateProps, baseAircraftData } from "../models/aircraftInterface";

import * as AircraftModelController from "../controllers/aircraftModelController";
import * as AircraftModelService from "../services/aircraftModelService";
import AircraftModel, { validAircraftModelUpdateProps, baseAircraftModelData, aircraftModelGroupBy } from "../models/aircraftModelInterface";

import { expect } from 'chai';

var testAircraft : Aircraft;
var testModel : AircraftModel;

describe('#createAircraft()', async function() {
    //Create new aircraft and check to see if it is in the database
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    it('should insert Test Aircraft into the aircraft table', async function() {
        //Create a model to use for creating a test aircraft
        let newModelName: string = "Testing Aircraft";

        //Create a new model, store the object returned by createAircraftModel in resModel
        testModel = {model_uuid: '', model_name: newModelName};
        let resModel : any = await AircraftModelService.createAircraftModel(testModel); 
        testModel.model_uuid = resModel.newAircraftModelUUID;

        //Create new aircraft, store the ojbect returned by createAircraft in resAircraft
        testAircraft = {aircraft_uuid: '', model_uuid: testModel.model_uuid, tail_code: 'MY89112', status: 'Available'};
        let resAircraft : any = await AircraftService.createAircraft(testAircraft);
        testAircraft.aircraft_uuid = resAircraft.newAircraftUUID;

        expect(await AircraftService.getAircraft(testAircraft.aircraft_uuid)).to.be.an('Object').with.property('model_uuid').that.equals(testModel.model_uuid);
    })
})

describe('#removeAircraft()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should remove Testing Aircraft from the aircraft table', async function() {
        //Check if model was deleted
        expect(await AircraftService.removeAircraft(testAircraft.aircraft_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    it('should return \'No row deleted\' because Testing Aircraft has already been deleted', async function() {
        //Check if model was deleted
        expect(await AircraftModelService.removeAircraftModel(testAircraft.aircraft_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })
    
    it('should remove Test Model from the aircraft_model table', async function() {
        //Check if model was deleted
        expect(await AircraftModelService.removeAircraftModel(testModel.model_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

})
