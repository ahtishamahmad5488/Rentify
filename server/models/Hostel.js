import mongoose from 'mongoose';
import hostelSchema from './hostelSchema.js';

export default mongoose.model('Hostel', hostelSchema);
