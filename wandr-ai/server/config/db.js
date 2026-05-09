import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wandr', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Running in development mode without database - some features will be limited');
      console.log('💡 To fix: Whitelist your IP in MongoDB Atlas or use local MongoDB');
    } else {
      process.exit(1);
    }
  }
};
