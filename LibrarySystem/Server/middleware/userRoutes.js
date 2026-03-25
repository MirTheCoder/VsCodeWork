import path from 'path';
import fs from 'fs';
import os from 'os';
import {validateUserRegistration, validateUserLogin, getUserDetails, collectUsers} from './validate.js';
import {checkIfLoggedIn, sessionLogout} from './sessionHandler.js';
import { checkOutBook, getUsersBooks, getSpecificUsersBooks } from './booksApi.js';
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

//Used to handle user logout and to destroy their session as well
route.get('/logout', async (req, res, next) => {
    await sessionLogout(req, res, next);
}); 

//This will be used to get the details of the user that is currently logged in
route.get('/details', async (req, res, next) => {
    await getUserDetails(req, res, next);
});

//This is used to get the books under the user that is currently logged in
route.get('/currentBooks', async (req,res,next) => {
    await getUsersBooks(req,res,next);
});

//This will be used to get a specific user's log of books
route.post('/currentBooks', async (req,res,next) => {
    await getSpecificUsersBooks(req,res,next);
});

//Used to get all the users within the database (for admin use only)
route.get('/allUsers', async (req, res) => {
   try{
        collectUsers(req, res);
   } catch(err){
        res.status(500).json({message: 'Error fetching users', error: err.message});
   } 
});

//Used to handle book checkouts by users
route.post('/checkout', async (req, res) => {
    await checkOutBook(req, res);
});

//Exporting the route to be used in server.js, make sure that it is the default export in order to use the routing system properly
export default route;