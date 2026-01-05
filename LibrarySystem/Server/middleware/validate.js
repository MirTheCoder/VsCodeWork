import path from 'path';
import fs from 'fs';
import os from 'os';
import {getCollection} from './db.js';
import {sessionLogin} from './sessionHandler.js';
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
            phone: phone
        };
        await usersList.insertOne(newUser);
        res.status(200).json({message: 'Registration successful!'});
    }
    next();
}    

export async function validateUserLogin(req, res, next) {
    //Here we will get the login inputs and see if they already exist in the database
    const {username, password} = req.body;
    let person = await usersList.findOne({username: username, password: password});
    if(person){
        let response = sessionLogin(req, res, username, password, next); //This will generate a brand new session for the user when they login
        if(response){
            res.status(200).json({message: 'Login successful!', success: true});
        } else {
            res.status(200).json({error: 'Error creating session during login.', success: false});
        }
    } 
    next();
}  
