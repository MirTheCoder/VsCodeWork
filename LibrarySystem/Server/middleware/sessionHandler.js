import fs from 'fs';
import path from 'path';
import session from 'express-session'; //Used to generate and manage sessions

export async function sessionLogin(req, res,  username, password, next) {
    req.session.regenerate((err) => {
            if(err){
                console.error('Error regenerating session:', err);
                return false;
            } else {
                return true;
            }
    });
        req.session.user = username;
        req.session.password = password;
    next();
}

//We will use this to check if a user is logged in before allowing them to access certain routes
export async function checkIfLoggedIn(req, res, next) {
    if(req.session.user){
        res.status(200).json({loggedIn: true, user: req.session.user});
    } else {
        res.status(200).json({loggedIn: false});
    }
    next();
}

