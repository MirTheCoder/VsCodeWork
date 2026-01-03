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
import userRoutes from './middleware/userRoutes.js';
//Let db start of as null
let db = null;

// Serve static files from the 'public' directory
app.use(express.static(path.join(clientRoot, 'public')));
// Used to allow us to parse and read json data and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //to parse URL-encoded bodies  

//Here are the routes that we are listening for and the responses we will give
app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'indexPage.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
})

app.get('/indexPage', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'indexPage.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});  

app.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'Login.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

app.get('/register', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'register.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
}); 

app.get('/about', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'public', 'aboutUs.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});

//Any routes that start with /users will be handled in userRoutes.js (handles user related tasks)
app.use('/users', userRoutes)

//This will help us start our server along with connecting to the database
app.listen(3000, async () => {
    console.log('Server is running on http://localhost:3000');
    try{
        db = await getDB();
        console.log('Connected to database successfully');
    } catch(err){
        console.error('Error connecting to database:', err);
    }
});
