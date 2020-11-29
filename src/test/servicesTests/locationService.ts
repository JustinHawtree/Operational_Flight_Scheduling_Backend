/* test locationService */

import * as locationController from "../../controllers/locationController";
import * as locationService from "../../services/locationService";
import Location, { baseLocationData, validLocationUpdateProps } from "../../models/locationInterface";
import { expect } from "chai";

var testLocation : Location;
var testLocation2 : Location;

describe('#createLocation()', async function() {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Create new Location and test to see if it is in the database
    it('should insert Test Location into the location table', async function(){
        let newLocationName : string = "Test Location";

        //Create a new location, store the Object returned by createLocation in res
        testLocation = {location_uuid: '', location_name: newLocationName, track_num: 122}
        let res : any = await locationService.createLocation(testLocation);
        testLocation.location_uuid = res.newLocationUUID;

        //We expect res to be an Object that has a property 'newLocationUUID', 
        //Use the UUID to see if the new location was inserted into the database
        expect(res).to.be.an('Object').that.has.property('newLocationUUID').that.is.a('string');
        expect(await locationService.getLocation(res.newLocationUUID)).to.be.an('Object').that.has.property('location_name').that.equals(newLocationName);
    })
})

describe('#getLocation()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should return an Object with location_name Test Location', async function() {     
        expect(await locationService.getLocation(testLocation.location_uuid)).to.be.an('Object').that.has.property('location_name').that.equals(testLocation.location_name);
    })

    it('should return an Object that is a Location with location_name = \'Moody 1\'', async function(){
        expect(await locationService.getLocation('ea703189-31ea-4235-bdbb-b017731fb29c')).to.be.an('Object').that.has.property('location_name').that.equals('Moody 1');
    })

    //SQL Error
    it('should return an Error when attempting to get a location that is not in the database', async function(){
        try {
            await locationService.getLocation('7a46e66f-b560-47b3-a5cb-e3c2fe00abfc');
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get Locations Error: ');
        }
    })
})

describe('#updateLocation()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms
    let updatedLocationName : string = 'Updated Name';

    it('should return a Object with property error that is false (the Location property location_name was successfully updated', async function () {      
        expect(await locationService.updateLocation(testLocation.location_uuid, {location_name: updatedLocationName})).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variable
        testLocation.location_name = updatedLocationName;
    })

    it('should get the Location and test that the name has been updated', async function(){
        expect(await locationService.getLocation(testLocation.location_uuid)).to.be.an('Object').with.property('location_name').that.equals(updatedLocationName);
    })

    it('should return \'Body didnt have any valid column names for Location\' when attempting to update an invalid property', async function(){
        expect(await locationService.updateLocation(testLocation.location_uuid, {invalid_prop: 'prop'})).to.be.an('Object').with.property('error').that.equals('Body didnt have any valid column names for Location');
    })

    it('should return \'No row updated\' when attempting to update a location that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        expect(await locationService.updateLocation(testingUUID, {location_name: 'Name'})).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})

describe('#replaceLocation()', async function () {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms
    
    //Test to see if location_name is updated
    it('should return an Object with property error that has value false', async function () {
        let replacementLocationName = 'Replacement Location'
        let replacementLocation : Location = {location_uuid: testLocation.location_uuid, location_name: replacementLocationName, track_num: 122};
        expect(await locationService.replaceLocation(testLocation.location_uuid, replacementLocation)).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variable
        testLocation = replacementLocation;
    })

    it('should return \'No row updated\' when attempting to update a location that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        let replacementLocationName = 'Replacement Location'
        let replacementLocation : Location = {location_uuid: '', location_name: replacementLocationName, track_num: 122};
        expect(await locationService.replaceLocation(testingUUID, replacementLocation)).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})

describe('#getAllLocations()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Create another location
    it('should insert Test Location II into the location table', async function(){
        let newLocationName : string = "Test Location II";

        //Create a new location, store the Object returned by createLocation in res
        testLocation2 = {location_uuid: '', location_name: newLocationName, track_num: 122}
        let res : any = await locationService.createLocation(testLocation2);
        testLocation2.location_uuid = res.newLocationUUID;

        //We expect res to be an Object that has a property 'newLocationUUID', 
        //Use the UUID to see if the new location was inserted into the database
        expect(res).to.be.an('Object').that.has.property('newLocationUUID').that.is.a('string');
        expect(await locationService.getLocation(res.newLocationUUID)).to.be.an('Object').that.has.property('location_name').that.equals(newLocationName);
    })

    //Call getAllLocations to see if the function retrieves both locations created during testing
    it('should return an array of Location the includes both test locations', async function(){
        let res : any = await locationService.getAllLocations();
        let contains1 : boolean = false;
        let contains2 : boolean = false;
        let i : any = 0;

        while((contains1 == false || contains2 == false) && i < res.length)
        {
            if(res[i].location_uuid == testLocation.location_uuid)
                contains1 = true;
            else if(res[i].location_uuid == testLocation2.location_uuid)
                contains2 = true;

            i++;
        }

        expect((contains1 && contains2)).to.equal(true);
    })
})

describe('#removelocation()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    //Test if location is removed without error
    it('should remove Test Location from the location table', async function() {
        expect(await locationService.removeLocation(testLocation.location_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    it('should remove Test Location II from the location table', async function() {
        expect(await locationService.removeLocation(testLocation2.location_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    //Attempt to get the removed location
    it('should return an error when attempting to get a model that is not in the aircraft_model table', async function(){
        try {
            await locationService.getLocation(testLocation.location_uuid);
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get Location Error : ');
        }
    })

    //Attempt to remove Test Location again, should return error: No row deleted because it has already been removed
    it('should return \'No row deleted\' because Test Location has already been deleted', async function() {
        expect(await locationService.removeLocation(testLocation.location_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })    
})
