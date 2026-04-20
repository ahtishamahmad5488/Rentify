import mongoose from 'mongoose';

console.log('Testing MongoDB Connection...\n');

const mongoURI = 'mongodb://localhost:27017/ahsaanbackend';
console.log(`Trying to connect to: ${mongoURI}\n`);

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
})
.then(() => {
  console.log('✅ Connection Successful!');
  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Connection State: ${mongoose.connection.readyState}`);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Connection Failed!');
  console.error(`Error: ${error.message}`);
  console.log('\nMake sure:');
  console.log('1. MongoDB daemon is running (mongod.exe)');
  console.log('2. MongoDB is listening on port 27017');
  console.log('3. Check Windows Services for MongoDB');
  process.exit(1);
});
