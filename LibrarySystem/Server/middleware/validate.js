import path from 'path';
import fs from 'fs';
import os from 'os';
import {getCollection} from './db.js';
import {sessionLogin, getSessionInfo} from './sessionHandler.js';
import bcrypt from 'bcryptjs';

const usersList = await getCollection('Users');
const booksCheckedOutList = await getCollection('booksCheckedOut')
const overdueBooksList = await getCollection('overdueBooks')
const finesList = await getCollection('fines')

// This will be used to validate user login and registration data
export async function validateUserRegistration(req, res, next) {
    //Here we will get the registration inputs and see if they already exist in the database, if not then we will add the new user to the database 
    const {username, email, phone, password} = req.body;
    let person = await usersList.findOne({username: username, password: password});
    if(person){
        res.status(200).json({error: 'User already exists with the provided username and password.', success: false});
    } else {
        let newUser = {
            username: username,
            password: password,
            email: email,
            phone: phone,
            DateCreated: new Date() // Store the date when the user was created
        };
        await usersList.insertOne(newUser);
        res.status(200).json({message: 'Registration successful!'});
    }
}    

export async function validateUserLogin(req, res, next) {
    //Here we will get the login inputs and see if they already exist in the database
    const {username, password} = req.body;
    let person = await usersList.findOne({username: username});
    if(person){
        let response = await sessionLogin(req, username); //This will generate a brand new session for the user when they login
        if(response){
            res.status(200).json({message: 'Login successful!', success: true});
        } else {
            res.status(200).json({error: 'Error creating session during login.', success: false});
        }
    } else {
        res.status(200).json({error: 'Username has already been taken', success: false});
    }
}  

export async function getUserDetails(req, res, next) {
    //Here we are going to try and get the info of the current user in session
    let response = await getSessionInfo(req, res, next);

    if(response.loggedIn){
        let user = await usersList.findOne({username: response.username});
        //Here we are going to use this to get the books, overdue warnings, and fines pertaining to the user in question
        let booksCheckedOut = await booksCheckedOutList.find({user: response.username}).toArray()
        //let overdueBooks = await overdueBooksList.find({user: response.username})
        let overdueBooks = await booksCheckedOutList.aggregate([ //We are going to cypher through the books checked to see which books are past the Date
            {$match: {dueDate: {$lt: new Date()}}} //This compares each due date of each book checked out with the current date
        ]).toArray()
        let fines = await finesList.find({user: response.username}).toArray()
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
                            memberSince: user.memberSince ? user.memberSince : null,
                            yourBooks: booksCheckedOut,
                            yourFines : fines });
                            
                        } else {
                            //We will send this if no fines are found
                        res.status(200).json({success: 3, user: user.username ? user.username : null, 
                            role: user.role ? user.role : null, email:user.email ? user.email : null, 
                            phone:user.phone ? user.phone : null, 
                            memberSince: user.memberSince ? user.memberSince : null,
                            yourBooks: booksCheckedOut}); 
                        }   
                } else { 
                        
                    //This will send only the user info and books checked out if that is all that we find
                    res.status(200).json({success: 2, user: user.username ? user.username : null, 
                        role: user.role ? user.role : null, email:user.email ? user.email : null, 
                        phone:user.phone ? user.phone : null, 
                        memberSince: user.memberSince ? user.memberSince : null,
                        yourBooks: booksCheckedOut});
                    }    
            } else {
                    res.status(200).json({success: 1, user: user.username ? user.username : null, role: user.role ? user.role : null, email:user.email ? user.email : null, phone:user.phone ? user.phone : null, memberSince: user.memberSince ? user.memberSince : null});    
            }    
        } else {
                //If Just the users info is found, then that is what we will only send back to the user
            res.status(200).json({success: 0, message: "User Not Found"});
        }
    }  else {
        res.status(200).json({success: false, message: 'User not logged in'});
    }
}    
