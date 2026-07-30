import express from 'express';
const route = express.Router();
import multer from 'multer'; //This is needed in order to handle multipart/form-data, which is used for file uploads (hence we decode images properly to store into mongodb)
import { Readable } from 'stream'
import {getBooks, saveImageData, getImage, addBook, deleteBook, editBook, getABook, addReview, getReviews, addBookDonation} from './booksApi.js'



//This creates a storage for which we store the uploaded images temporarily in memory before processing
const upload = multer({
    storage: multer.memoryStorage(), //Keeps the file or image in RAM temporarily before usage
    //limits: {
        //fileSize: 14 * 1024 * 1024 // 5MB becaue 1MB = 1024 * 1024 bytes
    //}
});

//We are telling multer to create to fields within our ram to store our uploads from the user side, parsing the request and assigning based off of what the name
//of the upload is labeled as
const bookUploads = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);


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
    await getBooks(req, res);
});

route.get('/getImage/:name', async (req, res, next) => {    
    await getImage(req, res); //We are going to pass the name put into the url to get the correct image
});


//We are adding bookUploads to thee three routes to save images to ram if they are present and to save pdfs if they are present as well, optional fields indeed
route.post('/addBook', bookUploads, addBook);

route.post('/editBook', bookUploads, editBook); //Route used to edit the details of a specified book

//This route will handle adding a book donation from the user to our book collection
route.post('/addBookDonation', bookUploads, addBookDonation)

route.post('/deleteBook', deleteBook); //Route used to delete books from our database

route.post('/getABook', async(req,res,next) => {
    await getABook(req,res,next)
})

route.post('/saveReview', async(req, res, next) => {
    await addReview(req,res,next)
})

route.post('/getReviews', async(req,res,next) => {
    await getReviews(req,res,next)
})



export default route