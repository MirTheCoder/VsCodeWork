// Required libraries and modules that we need to install in our server file
import express from 'express';
const app = express();
import path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import fs from 'fs';
import os from 'os';
import { getDB } from './middleware/db.js';
//In ES modules, __filename and __dirname are not defined, so we need to define them manually
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = __dirname + '/../Client';
import userRoutes from './middleware/userRoutes.js'; //Includes the routes regarding the user processes
import apiRoutes from './middleware/apiRoutes.js' //Includes the routes regarding the api processes
//Let db start of as null
let db = null;

// Serve static files from the 'public' directory
app.use(express.static(path.join(clientRoot, 'public')));
// Used to allow us to parse and read json data and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //to parse URL-encoded bodies 

//This is the format that will be used to generate each session 
app.use(session({
    secret: 'abc12345',
    resave: false, //Don't save session if unmodified
    saveUninitialized: true, //Save uninitialized session
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/Miracles_Library'  //Allows us to connect to our MongoDB database to store session data
    }),
    cookie: {
        maxAge: 1000 * 60 * 30, //This will keep the session alive for 30 minutes
        httpOnly: true, //Ensures that the cookie data can not be accessed via client-side scripts
        secure: false //Set to true if using HTTPS
    }
}));

//Here are the routes that we are listening for and the responses we will give
app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'indexPage.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
})

//This will help us serve the index page when requested
app.get('/indexPage', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'indexPage.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});  

//This will help us serve the login page when requested
app.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'Login.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

//This will help server the register page when requested
app.get('/register', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'register.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
}); 

//This will help us serve the about page to the user
app.get('/about', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'aboutUs.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

//This will help us serve the admin page to the admin users
app.get('/admin', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'admin.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

//This will help us serve the account page to the user
app.get('/account', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'account.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

//This will be used to render the page where users can checkout books
app.get('/bookCheckout', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'BookCheckout.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

//Any routes that start with /users will be handled in userRoutes.js (handles user related tasks)
app.use('/users', userRoutes)

app.use('/api', apiRoutes)

//This is the route to the manage books page for admins to access
app.get('/ManageBooks', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'ManageBooks.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(clientRoot, 'public', '404.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

//This will help us start our server along with connecting to the database
app.listen(3000, "0.0.0.0" ,async () => { //This will start the server on port 3000 and listen for incoming requests
    console.log('Server is running on http://localhost:3000');
    try{
        db = await getDB();
        console.log('Connected to database successfully');
    } catch(err){
        console.error('Error connecting to database:', err);
    }
});
