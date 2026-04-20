import mongoose from 'mongoose';
import hostelOwnerSchema from './hostelOwnerSchema.js';

export default mongoose.model('HostelOwner', hostelOwnerSchema);
