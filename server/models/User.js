import mongoose from 'mongoose';
import userSchema from './userSchema.js';

export default mongoose.model('User', userSchema);
