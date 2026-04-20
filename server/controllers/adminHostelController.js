import Hostel from '../models/Hostel.js';
import HostelOwner from '../models/HostelOwner.js';
import { sendHostelStatusEmail } from '../config/nodemailer.js';
import { getIO } from '../config/socket.js';

// ─── @desc    Update Hostel Approval Status ───────────────────────────────────
// @route   PATCH /api/admin/hostels/:id/status
// @access  Private (admin only)
export const updateHostelStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Only allow the two admin-controlled terminal statuses
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be APPROVED or REJECTED',
      });
    }

    // Bypass the soft-delete pre-find filter so admin can approve/reject
    // a hostel even if it was soft-deleted (edge case: deleted while pending)
    const hostel = await Hostel.findOne({
      _id: req.params.id,
      isDeleted: { $in: [true, false] },
    });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    hostel.status = status;
    await hostel.save({ validateModifiedOnly: true });

    // Notify owner via email + socket (non-blocking)
    HostelOwner.findById(hostel.owner).select('name email').then((owner) => {
      if (owner) {
        sendHostelStatusEmail(owner.email, owner.name, hostel.name, status).catch((err) =>
          console.error('Hostel status email failed:', err.message)
        );
        // Notify admin room that a hostel status was updated
        try {
          getIO().to('admin_room').emit('new_notification', {
            type: status === 'APPROVED' ? 'HOSTEL_APPROVED' : 'HOSTEL_REJECTED',
            title: status === 'APPROVED' ? 'Hostel Approved' : 'Hostel Rejected',
            message: `"${hostel.name}" has been ${status.toLowerCase()}`,
            hostelId: hostel._id,
            createdAt: new Date(),
          });
        } catch (e) { /* socket not ready — skip */ }
      }
    });

    res.status(200).json({
      success: true,
      message: `Hostel ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      data: {
        _id: hostel._id,
        name: hostel.name,
        status: hostel.status,
        owner: hostel.owner,
      },
    });
  } catch (error) {
    next(error);
  }
};
