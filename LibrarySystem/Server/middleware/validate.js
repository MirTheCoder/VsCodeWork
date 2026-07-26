import path from 'path';
import fs from 'fs';
import os from 'os';
import {getCollection} from './db.js';
import {sessionLogin, getSessionInfo, getUsersName} from './sessionHandler.js';
import {getSpecificUsersBooks, getOverdueBooks, getBooks, getFines, dueSoon, deleteBooksCheckedOut, deleteFines, updateUserBooksAndFines} from './booksApi.js';
import bcrypt from 'bcryptjs';
import { get } from 'http';
import random from 'random';
import { Int32 } from 'mongodb';

const usersList = await getCollection('Users');
const userCollection = await getCollection('Users');
const booksCheckedOutList = await getCollection('booksCheckedOut')

// This will be used to validate user login and registration data
export async function validateUserRegistration(req, res, next) {
    var newId = '';
    let idUnique = false;
    //Here we will get the registration inputs and see if they already exist in the database, if not then we will add the new user to the database 
    const {username, email, phone, password} = req.body;
    let person = await usersList.findOne({username: username, password: password});
    if(person){
        res.status(200).json({error: 'User already exists with the provided username and password.', success: false});
    } else {
        //This will make sure that we do not have any user ID duplicates within the database
        while(!idUnique){
            newId = await generateUserId();
            let idCheck = await usersList.findOne({userId: newId});
            if(!idCheck){
                idUnique = true;
            }
        }

        let newUser = {
            userId: newId, //This will ensure that our newId is in double type format which makes it easier for java to parse
            username: username,
            password: password,
            email: email,
            phone: phone,
            role: 'user', // Every User will automatically be assigned the role of 'user'
            accountStatus: 'active', // We are including this field in order to give admins the ability to suspend an account if need be
            DateCreated: new Date() // Store the date when the user was created
        };
        //If the username and password submitted are not already in use, then we will create a new user with those credentials
        //and alert the user of a successful user creation
        await usersList.insertOne(newUser);
        res.status(200).json({message: 'Registration successful!', success: true});
    }
}    

export async function validateUserLogin(req, res, next) {
    //Here we will get the login inputs and see if they already exist in the database
    const {username, password} = req.body;
    let person = await usersList.findOne({username: username});
    if(person){
        let response = await sessionLogin(req, username, password); //This will generate a brand new session for the user when they login
        if(response){
            res.status(200).json({message: 'Login successful!', success: true});
        } else {
            res.status(200).json({error: 'Error creating session during login.', success: false});
        }
    } else {
        res.status(200).json({error: 'Invalid Login credentials, please try again', success: false});
    }
}  

//This is like the validate registration but from the admin side of things
export async function AdminAddUser(req,res){
    var newId = '';
    let idUnique = false;
    const {username, email, phone, password, role, accountStatus} = req.body;
    //We want to first make sure that there isn't already a user with teh same password and username combonation
    let person = await usersList.findOne({username: username, password: password});
    if(!person){
        try{
            //Generates a unique ID for the user
            while(!idUnique){
                newId = await generateUserId();
                let idCheck = await usersList.findOne({userId: newId});
                if(!idCheck){
                    idUnique = true;
                }
            }
            let newUser = {
                userId: newId,
                username: username,
                password: password,
                email: email,
                phone: phone,
                role: role,
                accountStatus: accountStatus
            }

            await usersList.insertOne(newUser);
            res.status(200).json({success: true, message: 'User added successfully!'});
        } catch(err){
            console.log("Error adding the user from admin side: ", err);
            res.status(500).json({success: false, message: 'An error occured while trying to add the user'});
        }    
    } else {
        res.status(200).json({success: false, message: 'User already exists with the provided username and password.'});
    }
}

export async function getUserDetails(req, res, next) {
    //Here we are going to try and get the info of the current user in session
    let response = await getSessionInfo(req, res, next);

    if(response.loggedIn){
        let user = await usersList.findOne({username: response.username});
        //Here we are going to use this to get the books, overdue warnings, and fines pertaining to the user in question
        console.log("userId: " + user.userId);
        let booksCheckedOut = await booksCheckedOutList.find({userId: new Int32(user.userId)}).toArray(); //Changing value to int32 based in order to match the numerical type within our database
        //let overdueBooks = await overdueBooksList.find({user: response.username})
        let overdueBooks = await getOverdueBooks(user.username, req, res, next);
        //Safety measure put in place in case we don't get overdue books back as an array
        if(!Array.isArray(overdueBooks)){
            overdueBooks = await overdueBooks.toArray();
        }
        let fines = await getFines(user.username, req, res, next);
        let dueSoonBooks = await dueSoon(user.username, req, res, next); //Gets us all the books the user has checked out that are due in five days or less
        //We will return the user details if the user has been successfully found
        //Setting success levels to numerical values to show how many categories are pertaining to the user in question
        if(user){
            if(booksCheckedOut.length > 0){
                //Overdue books is just an aggregation of booksCheckedOut to see if any of them have a due date that is less than the 
                //current date
                if(overdueBooks.length > 0){
                        if(fines.length > 0){
                            res.status(200).json({success: 4, user: user.username ? user.username : null, 
                            role: user.role ? user.role : null, email:user.email ? user.email : null, 
                            phone:user.phone ? user.phone : null, 
                            memberSince: user.DateCreated ? user.DateCreated : null,
                            dueSoonBooks: dueSoonBooks,
                            yourBooks: booksCheckedOut,
                            yourOverdueBooks: overdueBooks,
                            yourFines : fines });
                            
                        } else {
                            //We will send this if no fines are found
                        res.status(200).json({success: 3, user: user.username ? user.username : null, 
                            role: user.role ? user.role : null, email:user.email ? user.email : null, 
                            phone:user.phone ? user.phone : null, 
                            memberSince: user.DateCreated ? user.DateCreated : null,
                            dueSoonBooks: dueSoonBooks,
                            yourOverdueBooks: overdueBooks,
                            yourBooks: booksCheckedOut}); 
                        }   
                } else { 
                        
                    //This will send only the user info and books checked out if that is all that we find
                    res.status(200).json({success: 2, user: user.username ? user.username : null, 
                        role: user.role ? user.role : null, email:user.email ? user.email : null, 
                        phone:user.phone ? user.phone : null, 
                        memberSince: user.DateCreated ? user.DateCreated : null,
                        dueSoonBooks: dueSoonBooks,
                        yourBooks: booksCheckedOut});
                    }    
            } else {
                    res.status(200).json({success: 1, user: user.username ? user.username : null, role: user.role ? user.role : null, email:user.email ? user.email : null, phone:user.phone ? user.phone : null, memberSince: user.DateCreated ? user.DateCreated : null});    
            }    
        } else {
                //If Just the users info is found, then that is what we will only send back to the user
            res.status(200).json({success: 0, message: "User Not Found"});
        }
    }  else {
        res.status(200).json({success: false, message: 'User not logged in'});
    }
} 


// This function will provide us with all the users within the database
export async function collectUsers(req, res){
    let users = await userCollection.find({}).toArray();
    res.status(200).json({success: true, users: users});
}

export async function findAUser(req,res,next,userId){
    let response = await getSessionInfo(req, res, next); //We use this to check and see if the user is logged in or not
    if(response.loggedIn){
        try{
            res.status(200).json({success: true, user: await userCollection.findOne({userId: new Int32(userId)})}); //We will return the user that matches the userId provided in the request parameters
        } catch(error){
            res.status(500).json({success: false, message: 'Error fetching user'});
        }
    } else {
        res.status(200).json({success: false, message: 'User not logged in'});
    }
}

//This will be used to create a unique user ID for each user that registers
async function generateUserId(){
    let num = '';
    for (let i=0; i < 8; i++){
        let randomId = Math.floor(Math.random() * 10); // Generate a random number between 0 and 99,999,999
        num += randomId.toString();
    }
    return Number(num); //Makes sure that we are passing or returning a number and not a string
}

//This will allow us to get all relevant details pertaining to a specific user
export async function getSpecifiedUserDetails(req, res, next, userId) {
    //Here we are going to try and get the info of the current user in session
    let response = await getSessionInfo(req, res, next);
    if(response.loggedIn){
        let user = await usersList.findOne({userId: new Int32(userId)}); //Getting the user via userId
        //Here we are going to use this to get the books, overdue warnings, and fines pertaining to the user in question
        let booksCheckedOut = await booksCheckedOutList.find({userId: new Int32(user.userId)}).toArray(); //Changing value to int32 based in order to match the numerical type within our database
        //let overdueBooks = await overdueBooksList.find({user: response.username})
        let overdueBooks = await getOverdueBooks(user.username, req, res, next);
        //Safety measure put in place in case we don't get overdue books back as an array
        if(!Array.isArray(overdueBooks)){
            overdueBooks = await overdueBooks.toArray();
        }
        let fines = await getFines(user.username, req, res, next);
        let dueSoonBooks = await dueSoon(user.username, req, res, next); //Gets us all the books the user has checked out that are due in five days or less
        //We will return the user details if the user has been successfully found
        //Setting success levels to numerical values to show how many categories are pertaining to the user in question
        if(user){
            if(booksCheckedOut.length > 0){
                //Overdue books is just an aggregation of booksCheckedOut to see if any of them have a due date that is less than the 
                //current date
                if(overdueBooks.length > 0){
                        if(fines.length > 0){
                            res.status(200).json({success: 4, user: user.username ? user.username : null, 
                            role: user.role ? user.role : null, email:user.email ? user.email : null, 
                            phone:user.phone ? user.phone : null, 
                            memberSince: user.DateCreated ? user.DateCreated : null,
                            dueSoonBooks: dueSoonBooks,
                            yourBooks: booksCheckedOut,
                            yourOverdueBooks: overdueBooks,
                            yourFines : fines });
                            
                        } else {
                            //We will send this if no fines are found
                        res.status(200).json({success: 3, user: user.username ? user.username : null, 
                            role: user.role ? user.role : null, email:user.email ? user.email : null, 
                            phone:user.phone ? user.phone : null, 
                            memberSince: user.DateCreated ? user.DateCreated : null,
                            dueSoonBooks: dueSoonBooks,
                            yourOverdueBooks: overdueBooks,
                            yourBooks: booksCheckedOut}); 
                        }   
                } else { 
                        
                    //This will send only the user info and books checked out if that is all that we find
                    res.status(200).json({success: 2, user: user.username ? user.username : null, 
                        role: user.role ? user.role : null, email:user.email ? user.email : null, 
                        phone:user.phone ? user.phone : null, 
                        memberSince: user.DateCreated ? user.DateCreated : null,
                        dueSoonBooks: dueSoonBooks,
                        yourBooks: booksCheckedOut});
                    }    
            } else {
                    res.status(200).json({success: 1, user: user.username ? user.username : null, role: user.role ? user.role : null, email:user.email ? user.email : null, phone:user.phone ? user.phone : null, memberSince: user.DateCreated ? user.DateCreated : null});    
            }    
        } else {
                //If Just the users info is found, then that is what we will only send back to the user
            res.status(200).json({success: 0, message: "User Not Found"});
        }
    }  else {
        res.status(200).json({success: false, message: 'User not logged in'});
    }
} 

//This will delete the data pertaining to this user
export async function deleteUser(req, res, userId){
    console.log(userId)
    try{
        let user = await usersList.findOne({userId: new Int32(userId)});
        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        } else {
        let username = user.username;
        if(await deleteBooksCheckedOut(userId)){
            if(await deleteFines(userId)){
                await usersList.deleteOne({userId: new Int32(userId)});
            }
        }
        res.status(200).json({success: true, message: 'Account successfully deleted', username});
        }
    } catch(err) {
        console.log("Error deleting user: ", err)
        res.status(500).json({success: false, message: 'An error occured while trying to delete the account'});
    }
} 

//This will edit the data pertaining to this user
export async function editUser(req, res){
    try{
        //First we want to verify that the users account exists before updating anything
        let user = await usersList.findOne({"userId": new Int32(req.body.userId)});
        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        } else {
       let updatedData = req.body; //This will get us all the fields that the admin updated on behalf of the user
       let isUpdated = await updateUserBooksAndFines(req.body.userId, updatedData.username); //This will update the username across other fields as well that may contain the username of the user whos info was updated
       if(isUpdated){
            await usersList.updateOne({userId: new Int32(req.body.userId)}, {$set: {"username": updatedData.username, "email": updatedData.email, "phone": updatedData.phone, "role": updatedData.role, "accountStatus": updatedData.accountStatus}});
            res.status(200).json({success: true, message: 'Account successfully updated'});
       } else {
            res.status(200).json({success: false, message: 'An error occured while trying to update details connected to the account'});
       }
    } 
    } catch(err) {
        console.log("Error editing user: ", err)
        res.status(500).json({success: false, message: 'An error occured while trying to edit the account'});
    }
} 