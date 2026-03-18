//We will do our best to use this file for api calls for books and images. Anything
//that requires info on books or book related attributes will be handled in here

import mongoose from "mongoose"
import fs from 'fs'
import { getCollection } from './db.js';
import multer from 'multer'; //This is needed in order to handle multipart/form-data, which is used for file uploads (hence we decode images properly to store into mongodb)
import { fileTypeFromBuffer, fileTypeFromFile, fileTypeFromStream } from 'file-type';
import path from 'path';
import random from 'random';

//Gets the Collection, list of books
const booksList = await getCollection('books')
const bookImages = await getCollection('bookImages');
const overdueBooksList = await getCollection('overdueBooks')
const booksCheckedOutList = await getCollection('booksCheckedOut')
const finesList = await getCollection('fines')
const usersList = await getCollection('users')


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
        const type = await fileTypeFromBuffer(imgData); // Detects the file type (MIME type) from the binary data

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

export async function getImage(req, res){
    let name = decodeURIComponent(req.params.name); //This will get the name that is passed within the request, we dencode it for the mongodb to query it properly
    let image = await bookImages.findOne({ name: name }) //This will get the image from the database that matches the provided name
    if(image){
        const buffer = Buffer.from(image.data.buffer); // Since mongo returns our image as a binary object, we need to convert it into a buffer in order to use it properly
        res.contentType(image.contentType) //This is how we will let the browser know what type of image we are sending it
        res.set('Content-Type', image.contentType); //Sets the content type of the response
        res.send(buffer) //This sends the actaul binary data of the image
    } else {
        res.sendFile(path.join('C:/Users/ABC/Downloads/VsCodeWork/LibrarySystem/Client/public', 'static', 'default.png')); //If there is no image found, we will send a default image back
    }    
}

//This function will be used to allow users to add books to the library
export async function addBook(req, res){
    let isValid = false; //We will have it initially false until the isbn num we generated is proven to be unique
    const image = req.file //This gets the image that was uploaded and then stored in RAM temporarily by multer
    try{
        let isbn = generateISBN()
        //Ensures that we keep generting isbn numbers until we get a unique one that isn't found within the database
        while (!isValid){
            let isbnFound = await booksList.foundOne({isbn: isbn})
            if(isbnFound){
                isbn = generateISBN() //If we found a book with the same isbn, then we will generate a new one and check again until we find a unique one
            } else {
                isValid = true; //We have found a unique isbn, so we can exit the loop
            }
        }
        const newBook = {
            isbn: isbn,
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            year: req.body.year
        }
        await booksList.insertOne(newBook) //Inserts the new book into the collection
        saveImageData(image, req.body.title) //Saves image to the database
        res.status(200).json({success: true, message: 'Book added successfully'})
    } catch(err){
        console.error(err)
        res.status(200).json({success: false, error: 'Server error occurred'})
    }

}

export async function getOverdueBooks(req, res){
    let overdueBooks = await booksCheckedOutList.aggregate([ //We are going to cypher through the books checked to see which books are past the Date
            {$match: {dueDate: {$gt: new Date()}}} //This compares each due date of each book checked out with the current date
        ]).toArray()
    res.status(200).json({success: true, books: overdueBooks})
}

//This will get us all the fines that the user has currently accumulated
export async function getFines(req, res){
    let name = req.session.user;
    let fines = await finesList.find({user: name}).toArray()
    res.status(200).json({success: true, fines: fines})
}

//This function handles out checkout logic for when users checkout a book
export async function checkOutBook(req, res){
    try{
        let name = req.session.user;
        let person = await usersList.findOne({username: name})
        let personId = person.userId
        let personName = person.username
        let bookTitle = req.body.title
        let dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); //Every User gets a 30 day time limit for every book they check out that starts from the moment they check out the book

        let checkoutInfo = {
            userId: personId,
            username: personName,
            title: bookTitle,
            dueDate: dueDate
        }

        await booksCheckedOutList.insertOne(checkoutInfo)
        res.status(200).json({success: true, message: `${bookTitle} has been checked out successfully!`})
    } catch(err){
        res.status(200).json({success: false, error: 'Error occurred while trying to checkout book, please try again later'})
    }


}

export async function deleteBook(req, res){
    let title = req.body.title
    //We wanna first see if the book exists before trying to delete it
    let found = await booksList.findOne({title: title})
    if(found){
        try{
            //We are deleting both the book and its corresponding image as well
            await booksList.deleteOne({title: req.body.title})
            await bookImages.deleteOne({name: req.body.title})
            res.status(200).json({success: true, message: 'Book deleted successfully'})
        } catch(err){
            console.error(err)
            res.status(200).json({success: false, error: 'Error occured while trying to delete book'})
        }
    } else {
        res.status(200).json({success: false, error: 'Book not found in the database'})
    }
}

export async function getSpecificUsersBooks(req, res){
    let name = req.body.username
    let books = await booksCheckedOutList.find({username: name}).toArray()
    res.status(200).json({success: true, books: books})
}

//Every book will be assigned a unique ISBN number when it is added to the library
function generateISBN(){
    let isbn = '';
    for(let i = 0; i < 13; i++){
        let randomNum = Math.floor(Math.random() * 10);
        isbn += randomNum.toString();
    }
    return parseInt(isbn);
}


