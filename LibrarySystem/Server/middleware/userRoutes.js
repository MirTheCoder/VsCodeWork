import path from 'path';
import fs from 'fs';
import os from 'os';
import {validateUserRegistration, validateUserLogin} from './validate.js';
import {checkIfLoggedIn} from './sessionHandler.js';
import express from 'express';
const route = express.Router();

// Route to handle user registration that will handle user registration validation and user creation if validated 
route.post('/register', async (req, res, next) => {
    await validateUserRegistration(req, res, next);
});

//This will hanle the user login, outing it to the respective function that will handle login validation
route.post('/login', async (req, res, next) => {
    await validateUserLogin(req, res, next);
});

// All browser side js files will call this route to check if a user is logged in or not
route.get('/checkLogin', async (req, res, next) => {
    // Check if user is logged in
    await checkIfLoggedIn(req, res, next);
});

//Exporting the route to be used in server.js, make sure that it is the default export in order to use the routing system properly
export default route;