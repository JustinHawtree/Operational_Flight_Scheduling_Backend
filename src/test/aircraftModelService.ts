/* test aircraftModelService */

import * as AircraftModelController from "../controllers/aircraftModelController"
import * as AircraftModelService from "../services/aircraftModelService";

import { expect } from 'chai';

describe('#getAircraftModel()', async function() {

    it('should return A-10C Thunderbolt Ⅱ', async function() {
        expect(await AircraftModelService.getAircraftModel('b0f4cd21-9e4c-4b4d-b4ae-88668b492a7b')).to.equal('A-10C Thunderbolt Ⅱ')
    })

    it('should return HC-130J Combat King Ⅱ', async function() {
        expect(await AircraftModelService.getAircraftModel('2c04be67-fc24-4eba-b6ca-57c81daab9c4')).to.equal('HC-130J Combat King Ⅱ')
    })

    it('should return HH-60 Pave Hawk', async function() {
        expect(await AircraftModelService.getAircraftModel('db2863ea-369e-4262-ad17-bda986ae9632')).to.equal('HH-60 Pave Hawk')
    })

    it('should return true if the response is a string', async function() {
        let res = await AircraftModelService.getAircraftModel('db2863ea-369e-4262-ad17-bda986ae9632')
        expect(res).to.be.a('string')
    })
  
})

/*
describe('#createAircraftModel()', function() {


})

describe('#updateAircraftModel()', function() {

 
})

describe('#replaceAircraftModel()', function() {

 
})

describe('#removeAircraftModel()', function() {

 
})
*/