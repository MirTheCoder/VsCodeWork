import mongoose from "mongoose"
import fs from 'fs'
import { getCollection } from './db.js';
import multer from 'multer'; //This is needed in order to handle multipart/form-data, which is used for file uploads (hence we decode images properly to store into mongodb)
import FileType from 'file-type';

//Gets the Collection, list of books
const booksList = await getCollection('books')
const bookImages = await getCollection('bookImages');


//This is the schema for our image uploads, structuring how we will be uploading images to our database
//const imageSchema = new mongoose.Schema({
    //name: String,        // A simple name for the image
    //data: Buffer,        // Stores the actual binary image data
    //contentType: String  // Stores the MIME type (e.g., 'image/jpeg' or 'image/png')
//});

//const Image = mongoose.model('BookImages', imageSchema); // Creates a model called 'Image' using this schema


//This will be used to check and see if there are books within the library
export async function getBooks(req, res){
    try{
        const books = await booksList.find({ }).toArray() //Gets a list of all the books in the library
        if(books.length > 0){ //Only return if there is at least one book that is found
            res.status(200).json({success: true, books: books})
        } else {
            res.status(200).json({success: false})
        }
    } catch(err){
        console.error(err)
        res.status(500).json({success: false, error: 'Server error occurred'})
    }    
}


//We will be using this function to upload images to the mongo database
export async function saveImageData(image, title) {
    try{
        const imgData = image.buffer; // Reads the image file as binary data/ turns image into binary data
        const type = await FileType.fromBuffer(imgData); // Detects the file type (MIME type) from the binary data

        const img = ({
            name: title,  // Give your image a name
            data: imgData,        // Store the binary data
            contentType: type.mime // Set the MIME type to whatever image has been uploaded
        });

        await bookImages.insertOne(img); //Saves the image to the database
        
    } catch(error){
        console.log(error)
    }
};

export function getImage(req, res, name){
    let image = bookImages.findOne({ name: name }) //This will get the image from the database that matches the provided name
    res.contentType(image.contentType) //This is how we will let the browser know what type of image we are sending it
    res.set('Content-Type', image.contentType); //Sets the content type of the response
    res.send(image.data) //This sends the actaul binary data of the image
}

//This function will be used to allow users to add books to the library
export async function addBook(req, res){
    const image = req.file //This gets the image that was uploaded and then stored in RAM temporarily by multer
    try{
        const newBook = {
            title: req.body.title,
            author: req.body.author,
        }
        await booksList.insertOne(newBook) //Inserts the new book into the collection
        saveImageData(image, req.body.title) //Saves image to the database
        res.status(200).json({success: true, message: 'Book added successfully'})
    } catch(err){
        console.error(err)
        res.status(200).json({success: false, error: 'Server error occurred'})
    }

}


