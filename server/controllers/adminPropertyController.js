import Property from '../models/Property.js';
import Landlord from '../models/Landlord.js';
import { sendPropertyStatusEmail } from '../config/nodemailer.js';
import { getIO } from '../config/socket.js';

// ─── @desc    Update Property Approval Status ────────────────────────────────
// @route   PATCH /api/auth/admin/properties/:id/status
// @access  Private (admin)
export const updatePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }

    // Bypass soft-delete filter so admin can approve/reject deleted listings
    const property = await Property.findOne({
      _id: req.params.id,
      isDeleted: { $in: [true, false] },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.status = status;
    await property.save({ validateModifiedOnly: true });

    // Notify landlord (non-blocking)
    Landlord.findById(property.owner).select('name email').then((owner) => {
      if (owner) {
        sendPropertyStatusEmail(owner.email, owner.name, property.title, status).catch(() => {});
        try {
          getIO().to('admin_room').emit('new_notification', {
            type: status === 'APPROVED' ? 'PROPERTY_APPROVED' : 'PROPERTY_REJECTED',
            title: status === 'APPROVED' ? 'Property Approved' : 'Property Rejected',
            message: `"${property.title}" has been ${status.toLowerCase()}`,
            propertyId: property._id,
            createdAt: new Date(),
          });
        } catch { /* socket not ready */ }
      }
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Property ${status.toLowerCase()} successfully`,
      data: { _id: property._id, title: property.title, status: property.status },
    });
  } catch (error) {
    next(error);
  }
};
