/* test aircraftModelService */

import * as AircraftModelController from "../controllers/aircraftModelController";
import * as AircraftModelService from "../services/aircraftModelService";
import AircraftModel, { validAircraftModelUpdateProps, baseAircraftModelData, aircraftModelGroupBy } from "../models/aircraftModelInterface";

import { expect } from 'chai';

var testModel : AircraftModel;

describe('#createAircraftModel()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

    //Create new AircraftModel and test to see if it is in the database
    it('should insert Test Model into the aircraft_model table', async function() {     
        let newModelName: string = "Test Model";

        //Create a new model, store the Object returned by createAircraftModel in res
        testModel = {model_uuid: '', model_name: newModelName};
        let res: any = await AircraftModelService.createAircraftModel(testModel); 
        testModel.model_uuid = res.newAircraftModelUUID;

        //We expect res to be an Object that has a property 'newAircraftModelUUID', 
        //Use the UUID to see if the new model was inserted into the database
        expect(res).to.be.an('Object').that.has.property('newAircraftModelUUID').that.is.a('string');
        expect(await AircraftModelService.getAircraftModel(res.newAircraftModelUUID)).to.be.an('Object').that.has.property('model_name').that.equals(newModelName);
    })
})

describe('#getAircraftModel()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should return an Object with model_name Test Model', async function() {
        expect(await AircraftModelService.getAircraftModel(testModel.model_uuid)).to.be.an('Object').that.has.property('model_name').that.equals(testModel.model_name);
    })

    /* Moody Air Force Base specific aircraft models */
    it('should return an Object with model_name A-10C Thunderbolt Ⅱ', async function() {
        expect(await AircraftModelService.getAircraftModel('b0f4cd21-9e4c-4b4d-b4ae-88668b492a7b')).to.be.an('Object').that.has.property('model_name').that.equals('A-10C Thunderbolt Ⅱ');
    })

    it('should return an Object with model_name HC-130J Combat King Ⅱ', async function() {
        expect(await AircraftModelService.getAircraftModel('2c04be67-fc24-4eba-b6ca-57c81daab9c4')).to.be.an('Object').that.has.property('model_name').that.equals('HC-130J Combat King Ⅱ');
    })

    it('should return an Object with model_name HH-60 Pave Hawk', async function() {
        expect(await AircraftModelService.getAircraftModel('db2863ea-369e-4262-ad17-bda986ae9632')).to.be.an('Object').that.has.property('model_name').that.equals('HH-60 Pave Hawk');
    })

    //SQL Error
    it('should return an Error when attempting to get a model that is not in the database', async function(){
        try {
            await AircraftModelService.getAircraftModel('7a46e66f-b560-47b3-a5cb-e3c2fe00abfc');
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get AircraftModel Error: ');
        }
    })    
})


describe('#updateAircraftModel()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms
    let updatedModelName = 'Updated Name';

    //Test to see if model_name is updated
    it('should return an Object with property error that equals false (no errors were encountered when updating the \'model_name\' property', async function(){
        expect(await AircraftModelService.updateAircraftModel(testModel.model_uuid, {model_name: updatedModelName})).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variable
        testModel.model_name = updatedModelName;
    })
    
    it('should get the AircraftModel and test that the name has been updated', async function(){
        expect(await AircraftModelService.getAircraftModel(testModel.model_uuid)).to.be.an('Object').with.property('model_name').that.equals(updatedModelName);
    })

    it('should return \'Body didnt have any valid column...\' because we are passing in an invalid property for AircraftModel', async function() {
        expect(await AircraftModelService.updateAircraftModel(testModel.model_uuid, {invalid_prop: 'prop'})).to.be.an('Object').with.property('error').that.equals('Body didnt have any valid column names for Aircraft Model');
    })

    it('should return \'No row updated\' when attempting to update a model that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        expect(await AircraftModelService.updateAircraftModel(testingUUID, {model_name: 'Name'})).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
 
})


describe('#replaceAircraftModel()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

    it('should return an Object with property \'error\' that equals false (no errors were encountered when replacing Test Model with Replacement Model', async function() {
        let replacementModelName: string = "Replacement Model";
        let replacementModel : AircraftModel = {model_uuid: testModel.model_uuid, model_name: replacementModelName};
    
        expect(await AircraftModelService.replaceAircraftModel(testModel.model_uuid, replacementModel)).to.be.an('Object').with.property('error').that.equals(false);
        
        //Updated global variable
        testModel = replacementModel;
    })
    

    it('should return an Object with property \'error\' that equals \'No row updated\' (attempting to replace an AircraftModel that is not in the database)', async function(){
        let testingUUID = '55798476-721c-4aa0-9c4e-72225848d9f2';
        expect(await AircraftModelService.replaceAircraftModel(testingUUID, testModel)).to.be.an('Object').with.property('error').that.equals('No row updated');
    })

})


describe('#removeAircraftModel()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    //Test if model is removed without error
    it('should remove Replacement Model from the aircraft_model table', async function() {
        expect(await AircraftModelService.removeAircraftModel(testModel.model_uuid)).to.be.an('Object').that.has.property('error').that.equals(false);
    })  

    //Attempt to get the removed model
    it('should return an error when attempting to get a model that is not in the aircraft_model table', async function(){
        try {
            await AircraftModelService.getAircraftModel(testModel.model_uuid);
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get Aircraft Model Error : ');
        }
    })

    //Attempt to removed the Test Model again, this should return the error: No row deleted because it has already been deleted
    it('should return \'No row deleted\' because Test Model has already been deleted', async function() {
        expect(await AircraftModelService.removeAircraftModel(testModel.model_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })   
})
