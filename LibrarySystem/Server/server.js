// Required libraries and modules that we need to install in our server file
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
//const {connect, getCollection, disconnect, getDb } = require('./middleware/db');
const clientRoot = __dirname + '/../Client';
let db = null;

// Serve static files from the 'public' directory
app.use(express.static(path.join(clientRoot, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //to parse URL-encoded bodies  

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'indexPage.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
})

app.get('/indexPage.html', (req, res) => {
    res.status(200).sendFile(path.join(clientRoot, 'indexPage.html'));
    console.log(`Type: ${req.method} \n Url: ${req.url}`);
});  






//This will help us start our server along with connecting to the database
app.listen(3000, async () => {
    console.log('Server is running on http://localhost:3000');
    //db = await connect();
});
