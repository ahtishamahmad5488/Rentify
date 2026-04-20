// Generic alias over the existing Hostel model.
// We keep the underlying mongoose model name as 'Hostel' so existing refs
// (e.g. ref: 'HostelOwner', ref: 'Hostel') keep working. New code should
// import this file as `Property` for clarity going forward.
import Hostel from './Hostel.js';

export default Hostel;
