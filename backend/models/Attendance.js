const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  date: { type: String, required: true }, 
  checkInTime: { type: Date }, 
  checkOutTime: { type: Date }, 
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day'], default: 'absent' },
  totalHours: { type: Number, default: 0 }, 
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);