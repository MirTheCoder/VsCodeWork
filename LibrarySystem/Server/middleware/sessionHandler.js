import fs from 'fs';
import path from 'path';
import session from 'express-session'; //Used to generate and manage sessions
import { getCollection } from './db.js';
const usersList = await getCollection('Users')

export async function sessionLogin(req, username, password) {
    //We are storing our code in a promise so that the whole process finishes before we send back a response
    await req.session.regenerate(err => {
          if (err) {
            console.error("Session regeneration error:", err);
            return {
              success: "false",
              error: "Login unsuccessful, please try again",
            };
          };
        })
    req.session.user = username;
    req.session.role = 'user'; // Set user role to user by default    
    let user = await usersList.findOne({"username": username, "password": password})
    req.session.userId = user.userId //Gonna store the userId in the req.session so that we can get the userId more easily for the actvie user across other functions
    return {success: true, message: "Successfully Logged in"}                
}


//We will use this to check if a user is logged in before allowing them to access certain routes
export async function checkIfLoggedIn(req, res, next) {
    if(req.session.user){
        res.status(200).json({loggedIn: true, user: req.session.user, userId: req.session.userId});
    } else {
        res.status(200).json({loggedIn: false, message: 'User not logged in'});
    }
}

export function sessionLogout(req, res) {
    if (!req.session) {
        return { success: false, message: 'No active session found' };
    }

    req.session.destroy((err) => {
        if(err){
            return res.status(200).json({success: false, error: "Failed to logout"})
        }

        res.clearCookie('connect.sid');
        return res.status(200).json({ 
        success: "true",
        message: "Logout successful"
      });  
      });
}


export async function checkRole(req, res, next) {
    if(req.session.role === 'admin'){
        res.status(200).json({success: true, message: 'Access granted. Admin user.'});
    } else {
        res.status(403).json({success: false, message: 'Access denied. Admins only.'});
    }   
}

export async function getSessionInfo(req, res, next) {
    if(req.session.user){
        return {loggedIn: true, username: req.session.user, role: req.session.role, userId: req.session.userId};
    } else {
        return {loggedIn: false, message: 'User not logged in'};
    }

}

//We wll use this to get the username of the current user in session 
export async function getUsersName(req, res) {
    if(req.session.user){
        return req.session.user;
    } else {
        return null;
    }
}