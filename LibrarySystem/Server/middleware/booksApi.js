//We will do our best to use this file for api calls for books and images. Anything
//that requires info on books or book related attributes will be handled in here

import mongoose from "mongoose"
import fs from 'fs'
import { getCollection } from './db.js';
import multer from 'multer'; //This is needed in order to handle multipart/form-data, which is used for file uploads (hence we decode images properly to store into mongodb)
import { fileTypeFromBuffer, fileTypeFromFile, fileTypeFromStream } from 'file-type';
import { getUsersName, getSessionInfo } from "./sessionHandler.js"; //This will allow us to get the name of the user in session
import path from 'path';
import random from 'random';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

//Gets the Collection, list of books
const booksList = await getCollection('books')
const bookImages = await getCollection('bookImages');
const overdueBooksList = await getCollection('overdueBooks')
const booksCheckedOutList = await getCollection('booksCheckedOut')
const finesList = await getCollection('fines')
const usersList = await getCollection('Users')


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
                res.status(200).json({success: true, books: books}); //This will return all the books within our library
        } else {
                res.status(200).json({success: false, books: []}); //This will notify the system that there are no books within our library
        }
    } catch(err){
        console.error(err)
            res.status(500).json({success: false, error: 'Server error occurred'})
        return false;
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
        res.sendFile(path.resolve(__dirname, '../../Client/public/static/default.png')); //If there is no image found, we will send a default image back
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
            let isbnFound = await booksList.findOne({isbn: isbn})
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
            year: req.body.year,
            available: true //Used to see whether or not the books is currently available
        }
        await booksList.insertOne(newBook) //Inserts the new book into the collection
        saveImageData(image, req.body.title) //Saves image to the database
        res.status(200).json({success: true, message: 'Book added successfully'})
    } catch(err){
        console.error(err)
        res.status(200).json({success: false, error: 'Server error occurred'})
    }

}

//This function will get us all the overdue books pertaining to the user that requested it
export async function getOverdueBooks(user, req, res, next, returnRes = false) {
    let overdueBooks = await booksCheckedOutList.aggregate([
        {
            $match: {
                username: user,
                dueDate: { $lt: new Date() }   // Finds dates in the past (overdue)
            }
        }
    ]).toArray();
    //Wed distinguish whether or not we want to return a response back to the client
    if(returnRes){
        res.status(200).json({success: true, books: overdueBooks})
    } else {
        return overdueBooks; //This returns a list of books that are overdue for the user in question
    }
}

//This will get us all the fines that the user has currently accumulated
export async function getFines(user, req, res, next, returnRes = false){
    let response = await getSessionInfo(req, res, next);
    //Insurance in case the user turns out to not be logged in for some reason
    if(!response.loggedIn){
        return res.status(200).json({success: false, message: 'User not logged in'});
    } else {
        let fines = await finesList.find({user: user}).toArray()
        if(returnRes){
            res.status(200).json({success: true, fines: fines})
        } else {
            return fines; //This returns a list of fines that the user has proccured 
        }
    }
}

export async function addFine(req, res, next){
    let response = await getSessionInfo(req, res, next);
    if(!response.loggedIn){
        return res.status(200).json({success: false, message: 'User not logged in'});
    } else {
    let overdueList = await getOverdueBooks(response.username, req, res); //Gets list of overdue books pertianing to the user in session
    let user = await usersList.findOne({username: response.username})
    let today = new Date();

    try{
    
    //We will repeat the process within this segement for each overduebook tha tthe user has checked out
    overdueList.forEach(async (book) => {
        let timeDiff = today.getTime() - book.dueDate.getTime();
        let daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24)); //Converts the time difference from milliseconds to days and rounds down to the nearest whole number
    if(daysOverdue > 5){    
        let findFine = await finesList.findOne({userId: user.userId, isbn: book.isbn}) //This is how we will check to see if there are any fines on the book already    
        //We will only add a fine if the book is overdue by more than 5 days, this is to give users a grace period in case they forget about a book or are unable to return it on time for some reason
        let fineAmount = 15 * (daysOverdue - 5); //Accounts for the 5 day grace period we give users
        //Only cretae a fine if one does not exist for the particular book that is overdue
        if(!findFine){
        let fineInfo = {
            userId: user.userId,
            user: user.username,
            bookTitle: book.title,
            isbn: book.isbn,
            bookAuthor: book.author,
            amount: fineAmount,
            fineDate: new Date() //Used to register when the fine was given
        }
        await finesList.insertOne(fineInfo) //This will add the fine to the fines collection for us to see and keep track of
        //If the book does have a fine attached, we will just update its content to refelect the new fine amount
        } else {
            await finesList.updateOne({userId: user.userId, isbn: book.isbn}, {$set: {amount: fineAmount, fineDate: new Date()}}) //This will update the fine amount and date to reflect the new fine amount and when the fine was updated
        }
    }
    })
    const fines = await finesList.find({userId: user.userId}).toArray(); //After we have added all the necessary fines, we will get an updated list of fines for the user in question to return back to them
    return res.status(200).json({success: true, message: 'Fines updated successfully', fines: fines}) 
    } catch (error) {
        console.error('Error adding fine:', error);
        res.status(500).json({success: false, message: 'Error adding fine'});
    }
    }
}

//This function will return all the books for the user that are due within 5 days
export async function dueSoon(user,req,res, next, returnRes = false){
    let response = await getSessionInfo(req, res, next);
    //Helps to ensure that we don't permit a non logged in user to access this function or trigger it by accident
    if(!response.loggedIn){
        return res.status(200).json({success: false, message: 'User not logged in'});
    } else {
    let today = new Date();
    const booksCheckedOut = await booksCheckedOutList.find({username: user}).toArray();
    let dueSoonBooks = booksCheckedOut.filter(book => {
        let timeDiff = book.dueDate.getTime() - today.getTime();
        let daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24)); //Converts the time difference from milliseconds to days and rounds down to the nearest whole number
        return daysDiff > 0 && daysDiff <= 5; //We want to return books that are due within the next 5 days
    });
    //Determines whether or not we return a response back to the user or instead just return a value
    if(returnRes){
        res.status(200).json({success: true, books: dueSoonBooks})
    } else {
        return dueSoonBooks;
    }
    }
}

//This function handles out checkout logic for when users checkout a book
export async function checkOutBook(req, res, next){
    try{
        let response = await getSessionInfo(req, res, next);
        let isBookCheckedOut = await booksCheckedOutList.findOne({isbn: req.body.isbn}) //We will first check to see if the book is already checked out by another user
        if(!isBookCheckedOut){
        let bookRequested = await booksList.updateOne({isbn: req.body.isbn}, {$set: {available: false}}) // This will change the availability of the book in question to false so that users will know that it is not available
        let name = await getUsersName(req, res);
        name = name ? name.replace(/['"]+/g, '').trim() : null;
        console.log("User checking out book: ", name);//Using this for debugging purposes
        let person = await usersList.findOne({username: name})
        let personId = person.userId
        let personName = person.username
        let bookTitle = req.body.title
        let bookAuthor = req.body.author
        let bookISBN = req.body.isbn
        let dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); //Every User gets a 30 day time limit for every book they check out that starts from the moment they check out the book

        //The info we will log for each checkout
        let checkoutInfo = {
            userId: personId,
            username: personName,
            title: bookTitle,
            author: bookAuthor,
            isbn: bookISBN,
            dueDate: dueDate
        }

        await booksCheckedOutList.insertOne(checkoutInfo)
        res.status(200).json({success: true, message: `${bookTitle} has been checked out successfully!`})
        } else {
            res.status(200).json({success: false, message: 'Book is already checked out by another user'}) //Let the user know that the book is already checked out
        }
    } catch(err){
        console.error("Error while checking out book: ", err);
        res.status(200).json({success: false, error: 'Error occurred while trying to checkout book, please try again later'})
    }

}

//This function will be used soley to get the books checked out by the user in session
export async function getUsersBooks(req, res){
    try{
        let name = await getUsersName(req, res);
        //We will onnly preform this operation if the user is logged in and has a valid session
        if(!name){
            return res.status(200).json({success: false, message: 'User not logged in'});
        }
        let booksCheckedOut = await booksCheckedOutList.find({username: name}).toArray();
        if(booksCheckedOut.length > 0){
            res.status(200).json({success: true, books: booksCheckedOut})
        } else {
            res.status(200).json({success: false, message: 'No books found for this user'}) //We will return this if we have foudn no books
        }
    } catch (err){
        console.log("Error with getting users books: ", err)
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

//This will handle the book return logic and process for users returning books
export async function returnBook(req, res, next){
    let response = await getSessionInfo(req, res, next);
    if(!response.loggedIn){
        return res.status(200).json({success: false, message: 'User not logged in'});
    } else {

    try{
        let name = await getUsersName(req, res);
        name = name ? name.replace(/['"]+/g, '').trim() : null; //We want to make sure that we are trimming any white spaces and removing any quotes from the users name to ensure that we can properly query the database for the books they have checked out
        let bookISBN = req.body.isbn
        //Wanna make sure that the book is actaully in their position before we return it
        let checkedOutBook = await booksCheckedOutList.findOne({username: name, isbn: bookISBN});
        if(checkedOutBook){
            let bookReturned = await booksList.updateOne({isbn: req.body.isbn}, {$set: {available: true}}) // This will change the availability of the book in question to true so that users will know that it is now available
            await booksCheckedOutList.deleteOne({username: name, isbn: bookISBN})
            res.status(200).json({success: true, message: 'Book returned successfully'})
        } else {
            return res.status(200).json({success: false, message: 'No record of this book being checked out by this user'})
        }
    } catch(err){
        console.error("Error returning book: ", err);
        res.status(200).json({success: false, message: 'Error occurred while trying to return book, please try again later'})
    }
    }
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

export async function editBook(req, res){
    let {title, author, genre, year, availability} = req.body;
    let bookImage = req.file //This will grab the new image for the file

    try{
        //We must first locate the book that we want to edit within the database
        const isbn = Number(req.body.isbn);

        if (!req.body.isbn || Number.isNaN(isbn)) {
            return res.status(400).json({ success: false, message: 'Invalid ISBN provided' });
        }

        let bookToEdit = await booksList.findOne({ isbn });
        if (!bookToEdit) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        let theBookImage = await bookImages.findOne({ name: bookToEdit.title });
        let oldTitle = bookToEdit.title;

        const bookTitle = title ? title : bookToEdit.title;
        const bookAuthor = author ? author : bookToEdit.author;
        const bookGenre = genre ? genre : bookToEdit.genre;
        const bookYear = year ? year : bookToEdit.year;
        const bookAvailability = availability !== undefined ? availability : bookToEdit.available;

        await booksList.updateOne(
            { isbn },
            { $set: { title: bookTitle, author: bookAuthor, genre: bookGenre, year: bookYear, available: bookAvailability } }
        );

        const imageName = title || bookToEdit.title;
        if (bookImage) {
            await bookImages.updateOne(
                { name: oldTitle },
                { $set: { name: imageName, data: bookImage.buffer, contentType: bookImage.mimetype } }
            );
        } else if (theBookImage) {
            await bookImages.updateOne(
                { name: oldTitle },
                { $set: { name: imageName, data: theBookImage.data, contentType: theBookImage.contentType } }
            );
        }

        res.status(200).json({ success: true, message: 'Book edited successfully' });
    } catch(err){
        console.error("Error finding book to edit: ", err); 
    }
}


