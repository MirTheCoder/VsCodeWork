import mongoose from "mongoose"
import fs from 'fs'
import { getCollection } from './db.js';

//Gets the Collection, list of books
const booksList = await getCollection('books')


//This is the schema for our image uploads, structuring how we will be uploading images to our database
const imageSchema = new mongoose.Schema({
  name: String,        // A simple name for the image
  data: Buffer,        // Stores the actual binary image data
  contentType: String  // Stores the MIME type (e.g., 'image/jpeg' or 'image/png')
});

const Image = mongoose.model('BookImages', imageSchema); // Creates a model called 'Image' using this schema


//This will be used to check and see if there are books within the library
export async function getBooks(req, res){
    try{
        const books = booksList.find({ }).toArray() //Gets a list of all the books in the library
        if(books){
            return res.status(200).json({success: true, books: books})
        } else {
            return res.status(200).json({success: false})
        }
    } catch(err){
        console.log(err)
    }    
}


//We will be using this function to upload images to the mongo database
export async function saveBookImage (req, res) {
    try{
        const imgData = fs.readFileSync(req.body.image); // Reads the image file as binary data
        const type = await FileType.fromBuffer(imgData);

        const img = new Image({
            name: req.body.name,  // Give your image a name
            data: imgData,        // Store the binary data
            contentType: type.mime // Set the MIME type to whatever image has been uploaded
        });

        await img.save();        // Save the document in MongoDB
        console.log('Image saved!');
    } catch(error){
        console.log(error)
    }
};

//This will retrieve the image from the database to populate the image on the html page
export async function getImage(req, res, name){
    const img = await Image.findOne({ name: name });
    //fs.writeFileSync('output.jpg', img.data);
    res.contentType(img.contentType) //This is how we will let the browser know what type of image we are sending it 
    res.send(img.data) //This sends the actaul binary data of the image
}


