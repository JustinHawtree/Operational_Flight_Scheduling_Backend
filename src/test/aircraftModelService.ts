/* test aircraftModelService */

import * as AircraftModelController from "../controllers/aircraftModelController";
import * as AircraftModelService from "../services/aircraftModelService";
import AircraftModel, { validAircraftModelUpdateProps, baseAircraftModelData, aircraftModelGroupBy } from "../models/aircraftModelInterface";

import { expect } from 'chai';

var testModel : AircraftModel;

describe('#createAircraftModel()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

    it('should insert Test Model into the aircraft_model table', async function() {     
        let newModelName: string = "Test Model";
        //let aircraft_model: AircraftModel = {model_uuid: "", model_name: newModel};
        //Create a new model, store the object returned by createAircraftModel in res
        testModel = {model_uuid: '', model_name: newModelName};
        let res: any = await AircraftModelService.createAircraftModel(testModel); 
        testModel.model_uuid = res.newAircraftModelUUID;

        //We expect res to be an Object that has a property 'newAircraftModelUUID', 
        //use this UUID to see if the new model was inserted into the database
        expect(res).to.be.an('Object').that.has.property('newAircraftModelUUID').that.is.a('string');
        expect(await AircraftModelService.getAircraftModel(res.newAircraftModelUUID)).to.be.an('Object').that.has.property('model_name').that.equals(newModelName);
    })
})

describe('#getAircraftModel()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should return an Object with model_name Test Model', async function() {
        expect(await AircraftModelService.getAircraftModel(testModel.model_uuid)).to.be.an('Object').that.has.property('model_name').that.equals(testModel.model_name);
    })

    /* //Moody Air Force Base specific aircraft models
    it('should return an Object with model_name A-10C Thunderbolt Ⅱ', async function() {
        expect(await AircraftModelService.getAircraftModel('b0f4cd21-9e4c-4b4d-b4ae-88668b492a7b')).to.be.an('Object').that.has.property('model_name').that.equals('A-10C Thunderbolt Ⅱ');
    })

    it('should return an Object with model_name HC-130J Combat King Ⅱ', async function() {
        expect(await AircraftModelService.getAircraftModel('2c04be67-fc24-4eba-b6ca-57c81daab9c4')).to.be.an('Object').that.has.property('model_name').that.equals('HC-130J Combat King Ⅱ');
    })

    it('should return an Object with model_name HH-60 Pave Hawk', async function() {
        expect(await AircraftModelService.getAircraftModel('db2863ea-369e-4262-ad17-bda986ae9632')).to.be.an('Object').that.has.property('model_name').that.equals('HH-60 Pave Hawk');
    })
    */
})



/*
describe('#updateAircraftModel()', async function() {
    //Check to see if model_name is updated   
 
})


describe('#replaceAircraftModel()', async function() {

})
*/

describe('#removeAircraftModel()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should remove Test Model from the aircraft_model table', async function() {
        //Check if model was deleted
        expect(await AircraftModelService.removeAircraftModel(testModel.model_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })  

    it('should return \'No row deleted\' because Test Model has already been deleted', async function() {
        //Check if model was deleted
        expect(await AircraftModelService.removeAircraftModel(testModel.model_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })    
})
