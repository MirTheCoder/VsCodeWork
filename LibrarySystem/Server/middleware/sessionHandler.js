import fs from 'fs';
import path from 'path';
import session from 'express-session'; //Used to generate and manage sessions

export function sessionLogin(req, username) {
    //We are storing our code in a promise so that the whole process finishes before we send back a response
    return new Promise((resolve, reject) => {
        req.session.regenerate(err => {
            if (err) {
                console.error('Error regenerating session:', err);
                return reject(err);
            }

            req.session.user = username;
            req.session.role = 'user';

            resolve(true);
        });
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

export function sessionLogout(req, res) {
    if (!req.session) {
        return res.status(400).json({ success: false, message: 'No active session found' });
    }

    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ success: false, message: 'Error logging out' });
        }

        res.clearCookie('connect.sid');
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
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
        return {loggedIn: true, username: req.session.user, role: req.session.role};
    } else {
        return {loggedIn: false, message: 'User not logged in'};
    }

}