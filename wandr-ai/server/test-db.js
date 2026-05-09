import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing connection to:', process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`SUCCESS: MongoDB Connected: ${conn.connection.host}`);
    process.exit(0);
  } catch (error) {
    console.error(`FAILURE: Error: ${error.message}`);
    process.exit(1);
  }
};

testConnection();
