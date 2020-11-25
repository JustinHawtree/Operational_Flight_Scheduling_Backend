/* test authService */

import * as authController from "../controllers/authController";
import * as authService from "../services/authService";

import { expect } from 'chai';

var testUserEmail = 'test@home.com';
var testUserPassword = 'test';
var testUserFirstName = 'Test';
var testUserLastName = 'User';

describe('#signUpUser()', async function() {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Should return no error when adding a new user
    it('should return an Object with property \'error\' that has the value false', async function(){
        expect(await authService.signUpUser(testUserEmail, testUserPassword, testUserFirstName, testUserLastName)).to.be.an('Object').that.has.property('error').that.equals(false);   
    })

    //Should return 'Email already in use' message when attempting to add the same user again
    it('should return \'Email already in use\' message when attempting to add the same user again', async function(){
        expect(await authService.signUpUser(testUserEmail, testUserPassword, testUserFirstName, testUserLastName)).to.be.an('Object').that.has.property('error').that.equals('Email is already in use.');
    })
    
})

describe('#loginUser()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

    //Should return an Object that contains the user's information (appproved account)
    it('should return an Object that contains the user\'s information (approved account)', async function() {     
        expect(await authService.loginUser('admin@home.com', 'root')).to.be.an('Object').that.has.property('account_uuid');
    })

    //Should return 'Bad password attempt' error message, this tests and account that has already been approved
    it('should return \'Bad password attempt\' error message (approved account)', async function() {
        let email = 'admin@home.com';

        try {
            expect(await authService.loginUser(email, 'password')).to.be.an('Error');
        } catch (error) {
            expect(error.message).to.equal('Login User Error: Bad Password attempt for: '+email);
        }
    })

    //Should return 'No User Found...' error message, this tests and account that has not yet been added to the database
    it('should return \'No User Found...\' error message when attempting to login with invalid credentials', async function() {
        let email = 'nouser@home.com'

        try {
            expect(await authService.loginUser(email, 'root')).to.be.an('Error');  
        } catch (error) {           
            expect(error.message).to.equal('No User Found with email: '+email);
        } 
    })

    //Test for added but unapproved user, should return 'Login User Error: ...'
    it('should return \'User not approved...\' when attempting to login to the newly created account (unapproved account)', async function(){
        try {
            expect(await authService.loginUser(testUserEmail, testUserPassword)).to.be.an('Error');  
        } catch (error) {           
            expect(error.message).to.equal('Login User Error: User not approved: '+testUserEmail);
        }
    })

})
