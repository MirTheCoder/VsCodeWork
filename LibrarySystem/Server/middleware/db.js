//Client used to connect to our mongo DB

import { MongoClient } from 'mongodb';

// MongoDB connection URI
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'Project_3';

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
        if(client && client.isConnected()){
            return client;
        }
        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        return db;

    } catch(err){
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}