const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Change this line:
// app.use(cors());

// To this for production:


// If you don't know the URL yet, you can keep the simple line for now:
// app.use(cors());
// and configure it properly later.



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};


app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, employeeId, department } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword, role, employeeId, department });
    await newUser.save();
    res.json(newUser);
  } catch (err) { res.status(500).send('Server Error'); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, department: user.department, employeeId: user.employeeId } });
  } catch (err) { res.status(500).send('Server Error'); }
});


app.post('/api/attendance/checkin', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    let attendance = await Attendance.findOne({ userId: req.user.id, date: today });
    if (attendance) return res.status(400).json({ msg: 'Already checked in' });

    
    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

    attendance = new Attendance({
      userId: req.user.id,
      date: today,
      checkInTime: now,
      status: isLate ? 'late' : 'present'
    });
    await attendance.save();
    res.json(attendance);
  } catch (err) { res.status(500).send('Server Error'); }
});


app.post('/api/attendance/checkout', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    let attendance = await Attendance.findOne({ userId: req.user.id, date: today });
    if (!attendance) return res.status(400).json({ msg: 'Have not checked in yet' });
    
    attendance.checkOutTime = new Date();
   
    const diff = Math.abs(attendance.checkOutTime - attendance.checkInTime) / 36e5; // Hours
    attendance.totalHours = diff.toFixed(2);
    
   
    if(diff < 4) attendance.status = 'half-day';

    await attendance.save();
    res.json(attendance);
  } catch (err) { res.status(500).send('Server Error'); }
});


app.get('/api/attendance/today', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const attendance = await Attendance.findOne({ userId: req.user.id, date: today });
    res.json(attendance || null);
  } catch (err) { res.status(500).send('Server Error'); }
});


app.get('/api/attendance/my-history', auth, async (req, res) => {
    try {
        const history = await Attendance.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(history);
    } catch (err) { res.status(500).send('Server Error'); }
});


app.get('/api/attendance/my-summary', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const now = new Date();
        
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
        
        
        const records = await Attendance.find({ 
            userId, 
            date: { $gte: startOfMonthStr } 
        });

        const stats = {
            present: 0,
            late: 0,
            halfDay: 0,
            absent: 0,
            totalHours: 0
        };

        
        for (const record of records) {
            if (record.status === 'present') stats.present++;
            else if (record.status === 'late') stats.late++;
            else if (record.status === 'half-day') stats.halfDay++;
            
            stats.totalHours += (record.totalHours || 0);
        }


        const daysPassed = now.getDate() - 1; 
        
        const daysAttended = stats.present + stats.late + stats.halfDay;
        
        
        stats.absent = Math.max(0, daysPassed - daysAttended);

        stats.totalHours = stats.totalHours.toFixed(1);

        res.json(stats);
    } catch (err) { 
        console.error("Summary Error:", err);
        res.status(500).send('Server Error fetching summary'); 
    }
});


app.get('/api/attendance/all', auth, async (req, res) => {
    if(req.user.role !== 'manager') return res.status(403).json({msg: "Access denied"});
    try {
        const records = await Attendance.find().populate('userId', 'name email');
        res.json(records);
    } catch (err) { res.status(500).send('Server Error'); }
});


app.get('/api/dashboard/manager', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ msg: 'Access denied' });

  const today = new Date().toISOString().split('T')[0];
  
  try {
    
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    
    const attendanceToday = await Attendance.find({ date: today });
    const presentCount = attendanceToday.length;
    const lateCount = attendanceToday.filter(a => a.status === 'late').length;
    const absentCount = totalEmployees - presentCount;

    
    const presentUserIds = attendanceToday.map(a => a.userId);
    const absentEmployees = await User.find({ 
      role: 'employee', 
      _id: { $nin: presentUserIds } 
    }).select('name department employeeId');

    
    const departments = {};
    const allUsers = await User.find({ role: 'employee' });
    allUsers.forEach(u => {
      if (!departments[u.department]) departments[u.department] = { total: 0, present: 0 };
      departments[u.department].total++;
    });
    
    
    for (let att of attendanceToday) {
       const u = allUsers.find(user => user._id.toString() === att.userId.toString());
       if (u && departments[u.department]) {
           departments[u.department].present++;
       }
    }
    const deptData = Object.keys(departments).map(dept => ({
      name: dept,
      Present: departments[dept].present,
      Absent: departments[dept].total - departments[dept].present
    }));

    res.json({
      totalEmployees,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      absentEmployees,
      departmentStats: deptData
    });

  } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});


app.get('/api/attendance/report', auth, async (req, res) => {
    if (req.user.role !== 'manager') return res.status(403).json({ msg: 'Access denied' });

    const { date, employeeId } = req.query;
    let query = {};

    
    if (date) query.date = date;
    
   
    if (employeeId) {
        
        const u = await User.findOne({ employeeId });
        if (u) query.userId = u._id;
    }

    try {
        const records = await Attendance.find(query).populate('userId', 'name employeeId department');
        res.json(records);
    } catch (err) { res.status(500).send('Server Error'); }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));