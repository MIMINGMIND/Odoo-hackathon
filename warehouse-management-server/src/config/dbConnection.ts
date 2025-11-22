// config/dbconfig.ts
import mongoose from 'mongoose';

const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/stockmaster';

const connectDB = async () => {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
};

export default connectDB;