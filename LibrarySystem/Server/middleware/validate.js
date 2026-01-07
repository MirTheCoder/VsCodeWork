import path from 'path';
import fs from 'fs';
import os from 'os';
import {getCollection} from './db.js';
import {sessionLogin, getSessionInfo} from './sessionHandler.js';
import bcrypt from 'bcryptjs';

const usersList = await getCollection('Users');

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
    let person = await usersList.findOne({username: username, password: password});
    if(person){
        let response = await sessionLogin(req, res, username, password, next); //This will generate a brand new session for the user when they login
        if(response){
            res.status(200).json({message: 'Login successful!', success: true});
        } else {
            res.status(200).json({error: 'Error creating session during login.', success: false});
        }
    } else {
        res.status(200).json({error: 'Invalid username or password.', success: false});
    }
}  

export async function getUserDetails(req, res, next) {
    //Here we are going to try and get the info of the current user in session
    let response = await getSessionInfo(req, res, next);

    if(response.loggedIn){
        let user = await usersList.findOne({username: response.username});
        //We will return the user details if the user has been successfully found
        if(user){
            res.status(200).json({success: true, user: user.username ? user.username : null, role: user.role ? user.role : null, email:user.email ? user.email : null, phone:user.phone ? user.phone : null, memberSince: user.memberSince ? user.memberSince : null});
        }
    }   else {
        res.status(200).json({success: false, message: 'User not logged in'});
    }
}    
