/* test locationService */

import * as locationController from "../controllers/locationController";
import * as locationService from "../services/locationService";
import Location, { baseLocationData, validLocationUpdateProps } from "../models/locationInterface";
import { expect } from "chai";

var testLocation : Location;

describe('#createLocation()', async function() {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    it('should insert Test Location into the location table', async function(){
        let newLocationName : string = "Test Location";

        testLocation = {location_uuid: '', location_name: newLocationName, track_num: 122}
        let res : any = await locationService.createLocation(testLocation);
        testLocation.location_uuid = res.newLocationUUID;

        expect(res).to.be.an('Object').that.has.property('newLocationUUID').that.is.a('string');
        expect(await locationService.getLocation(res.newLocationUUID)).to.be.an('Object').that.has.property('location_name').that.equals(newLocationName);
    })
})

describe('#getLocation()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

    it('should return an Object with location_name Test Location', async function() {     
        expect(await locationService.getLocation(testLocation.location_uuid)).to.be.an('Object').that.has.property('location_name').that.equals(testLocation.location_name);
    })
})

describe('#removelocation()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should remove Test Location from the location table', async function() {
        //Check if Location was deleted
        expect(await locationService.removeLocation(testLocation.location_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })  

    it('should return \'No row deleted\' because Test Location has already been deleted', async function() {
        //Attempt to remove Test Location again, should return error: No row deleted because it has already been removed
        expect(await locationService.removeLocation(testLocation.location_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })    
})
