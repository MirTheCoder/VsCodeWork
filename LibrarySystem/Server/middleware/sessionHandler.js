import fs from 'fs';
import path from 'path';
import session from 'express-session'; //Used to generate and manage sessions

export async function sessionLogin(req, res,  username, password, next) {
    req.session.regenerate((err) => {
            if(err){
                console.error('Error regenerating session:', err);
                return false;
            } else {   
                req.session.user = username;
                req.session.password = password;
                req.session.role = 'user'; //Each user role will be default be user
                return true;
            }
    });

}

//We will use this to check if a user is logged in before allowing them to access certain routes
export async function checkIfLoggedIn(req, res, next) {
    if(req.session.user){
        res.status(200).json({loggedIn: true, user: req.session.user});
    } else {
        res.status(200).json({loggedIn: false, message: 'User not logged in'});
    }
}

//Used to logout a user by destroying their session
export async function sessionLogout(req, res, next) {
    //We only want to destroy the session if there is an active session
    if(req.session.user){
        //This will destroy the session and clear the cookie
        req.session.destroy((err) => {
            if(err){
                console.error('Error destroying session:', err);
                res.status(200).json({success: false, message: 'Error logging out'});
            } else {
                res.clearCookie('connect.sid'); //Clear the session cookie
                res.status(200).json({success: true, message: 'Logged out successfully'});
            }
        });
    } else {
        res.status(400).json({success: false, message: 'No active session found'});
    }     
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
        return {loggedIn: true, username: req.session.user, role: req.session.role};
    } else {
        return {loggedIn: false, message: 'User not logged in'};
    }

}