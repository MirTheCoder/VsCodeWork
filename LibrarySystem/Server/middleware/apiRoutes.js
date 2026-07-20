import express from 'express';
const route = express.Router();
import multer from 'multer'; //This is needed in order to handle multipart/form-data, which is used for file uploads (hence we decode images properly to store into mongodb)
import {getBooks, saveImageData, getImage, addBook, deleteBook, editBook, getABook, addReview, getReviews} from './booksApi.js'



//This creates a storage for which we store the uploaded images temporarily in memory before processing
const upload = multer({
    storage: multer.memoryStorage(), //Keeps the file or image in RAM temporarily before usage
    limits: {
        fileSize: 14 * 1024 * 1024 // 5MB becaue 1MB = 1024 * 1024 bytes
    }
});

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

route.post('/addBook', upload.single('image'), addBook);

route.post('/editBook', upload.single('image'), editBook); //Route used to edit the details of a specified book

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