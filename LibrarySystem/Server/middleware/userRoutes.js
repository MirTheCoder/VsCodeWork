import path from 'path';
import fs from 'fs';
import os from 'os';
import {validateUserRegistration, validateUserLogin, getUserDetails, collectUsers, findAUser, getSpecifiedUserDetails, deleteUser, editUser, AdminAddUser} from './validate.js';
import {checkIfLoggedIn, sessionLogout} from './sessionHandler.js';
import { checkOutBook, getUsersBooks, getSpecificUsersBooks, returnBook, addFine, dueSoon, getOverdueBooks, addReview, addBookDonation, getPdf} from './booksApi.js';
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

//This will get the user and relevant details pertianing to the specific user in question
route.post('/details', async (req, res, next) => {
    await getSpecifiedUserDetails(req, res, next, req.body.userId);
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
        await collectUsers(req, res);
   } catch(err){
        res.status(500).json({message: 'Error fetching users', error: err.message});
   } 
});

//Used to handle book checkouts by users
route.post('/checkout', async (req, res, next) => {
    await checkOutBook(req, res, next);
});

//This will be the route that handles users book returns 
route.post('/returnBook', async (req,res, next) => {
    returnBook(req, res, next);
})

route.get('/addFine', async (req, res, next) => {
    await addFine(req, res, next);
});

route.get('/getOverdueBooks', async (req, res, next) => {
    await getOverdueBooks(req.session.user,req, res, next, true); //We make sure to pass the user name and to let the function know that we want to return a response back to the user/client
});

//This will call the function to get the books due soon for the requesting user
route.get('/dueSoon', async (req, res, next) => {
    await dueSoon(req.session.user,req, res, next, true); //We make sure to pass the user name and to let the function know that we want to return a response back to the user/client
});

route.post('/getUser', async (req, res, next) => {
    await findAUser(req, res, next, req.body.userId);
});

route.post('/editUser', async (req,res) => {
    await editUser(req,res);
})

route.post('/deleteUser', async (req,res) => {
    await deleteUser(req,res, req.body.userId);
})

route.post('/adminAddUser', async (req,res) => {
    await AdminAddUser(req, res);
})

route.post('/addReview', async(req,res, next) => {
    await addReview(req, res, next);
})

//This will be used to get the actual pdf file for the user to read
route.get('/pdf/:isbn', async(req,res,next) => {
    getPdf(req,res)
});


//Use this to get the role of a user before allowing them to access certain pages
route.get('/checkRole', async(req,res,next) => {
    if(req.session.role){
        res.status(200).json({'success': true, 'role': req.session.role});
    } else {
        res.status(200).json({success: false, role: 'user'});
    }
});    

//Exporting the route to be used in server.js, make sure that it is the default export in order to use the routing system properly
export default route;