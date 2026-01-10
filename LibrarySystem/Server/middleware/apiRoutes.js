import express from 'express';
const route = express.Router();
import {getBooks, saveBookImage, getImage} from './booksApi.js'

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
    getBooks();
});









export default route