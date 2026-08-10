import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

/**
 * Boots up an isolated MongoDB memory server instance and establishes Mongoose connectivity.
 */
export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
};

/**
 * Disconnects from the in-memory database and stops the instance.
 */
export const closeTestDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Wipes out all records from every collection inside the memory server.
 */
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
