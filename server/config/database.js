import mongoose from 'mongoose';
import { setDefaultResultOrder, setServers } from 'dns';
setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Rejected');
    console.error('📛 Error:', error.message);

    process.exit(1);
  }
};

export default connectDB;
