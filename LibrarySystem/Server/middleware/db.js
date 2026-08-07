//Allows us to use our environment variables from our .env file
import dotenv from 'dotenv';

dotenv.config();

//Client used to connect to our mongo DB

import { MongoClient, GridFSBucket, ServerApiVersion} from 'mongodb';


// Access them using process.env
const dbUser = process.env.MONGODB_USERNAME;
const dbPassword = process.env.MONGODB_PASSWORD;
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

console.log("MONGO_URI:", MONGO_URI);
console.log("DB_NAME:", DB_NAME);

// MongoDB connection URI
//const MONGO_URI = 'mongodb://localhost:27017';
//const DB_NAME = 'Miracles_Library';

// Singleton client instance
let client = null;
let db = null;

/**
 * Connects to MongoDB server
 * @returns {Promise<MongoClient>} MongoDB client instance
 */
export async function connect() {
    //Will test to see if we have a connection,
    //else, it will use the client to connect,
    // to the database

    try{
        client = new MongoClient(MONGO_URI, {
            //We are using serverApi to ensure that we are using the latest version of the mongoDB server, and to avoid any issues if atlas were to do any updates
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await client.connect();
        db = client.db(DB_NAME);
        return db;

    } catch(err){
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

//Allows us to get hold of the database, and will connect if not already connected
export async function getDB(){
    if(!db){
        await connect();
    }
    return db;
}

//Allows us to get hold of a specific collection we desire from the database
export async function getCollection(collectionName){
    const database = await getDB();
    return database.collection(collectionName);
}

//This function will help us create the bucket we need in our database to save pdf files
export async function initGridFS() {
  const db = await getDB(); //This will get us our database connection
  
  // Creates a bucket named "fs" by default (fs.files and fs.chunks)
  const bucket = new GridFSBucket(db); 
  
  // Custom names can be applied using: new GridFSBucket(db, { bucketName: 'myCustomBucket' })
  return bucket;
}