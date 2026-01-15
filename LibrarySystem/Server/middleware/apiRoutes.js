import express from 'express';
const route = express.Router();
import {getBooks, saveImageData, getImage, } from './booksApi.js'

//This route will direct us to the booksApi file to get the requested image
route.get('imageName/:name', async (req, res, next) => {
    let name = req.params.name //This will get the name that is passed within the request 
    await getImage(req, res, name);
});


//We will use this to save images to the database
route.post('imageSave/:name', async (req, res, next) => {
    let name = req.params.name //This will get the name that is passed within the request 
    await getImage(req, res, name);
});

//We will use this to save images to the database
route.get('/getBooks', async (req, res, next) => {
    getBooks(req, res);
});

route.get('/getImage/:name', async (req, res, next) => {    
    await getImage(req, res, req.params.name); //We are going to pass the name put into the url to get the correct image
});

route.post('/addBook', async (req, res, next) => {
    await addBook(req, res);
});







export default route