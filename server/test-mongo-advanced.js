import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('\n🔍 MongoDB Connection Test');
console.log('=' .repeat(50));
console.log(`Connection String: ${process.env.MONGO_URI || 'NOT SET'}`);
console.log('=' .repeat(50) + '\n');

const testConnection = async () => {
  try {
    console.log('⏳ Testing MongoDB connection...\n');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
    });

    console.log('✅ Connection Successful!\n');
    console.log('Database Details:');
    console.log(`  📍 Database Name: ${conn.connection.name}`);
    console.log(`  🔗 Host: ${conn.connection.host}`);
    console.log(`  📊 Port: ${conn.connection.port}`);
    console.log(`  📌 Status: ${conn.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection Failed!\n');
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}\n`);

    // Diagnosis
    if (error.message.includes('querySrv ECONNREFUSED')) {
      console.error('🔴 DIAGNOSIS: DNS/Network Resolution Failed');
      console.error('   Possible causes:');
      console.error('   1. MongoDB Atlas cluster is PAUSED');
      console.error('   2. Your IP is not whitelisted');
      console.error('   3. Internet connection issue');
      console.error('   4. Cluster name or region is incorrect\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('🔴 DIAGNOSIS: Authentication Failed');
      console.error('   Possible causes:');
      console.error('   1. Username is incorrect');
      console.error('   2. Password is incorrect');
      console.error('   3. User does not exist in MongoDB\n');
    } else if (error.message.includes('timeout')) {
      console.error('🔴 DIAGNOSIS: Connection Timeout');
      console.error('   Possible causes:');
      console.error('   1. Network is too slow');
      console.error('   2. Firewall is blocking connection');
      console.error('   3. MongoDB service is not running\n');
    }

    process.exit(1);
  }
};

testConnection();
