import path from 'path';
import fs from 'fs';
import os from 'os';
import {validateUserRegistration, validateUserLogin, getUserDetails, getUsersBooks, collectUsers} from './validate.js';
import {checkIfLoggedIn, sessionLogout} from './sessionHandler.js';
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

route.get('/logout', async (req, res, next) => {
    await sessionLogout(req, res, next);
}); 

route.get('/details', async (req, res, next) => {
    await getUserDetails(req, res, next);
});

route.get('/currentBooks', async (req,res,next) => {
    getUsersBooks(req,res);
})

route.get('/allUsers', async (req, res) => {
   try{
        collectUsers(req, res);
   } catch(err){
        res.status(500).json({message: 'Error fetching users', error: err.message});
   } 
});

//Exporting the route to be used in server.js, make sure that it is the default export in order to use the routing system properly
export default route;