import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [attendance, setAttendance] = useState(null);
  const [allRecords, setAllRecords] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { 'x-auth-token': token } };

  const fetchToday = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/today', config);
      setAttendance(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/all', config);
      setAllRecords(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchToday();
    if (user.role === 'manager') fetchAll();
  }, [user]);

  const handleCheckIn = async () => {
    try {
      await axios.post('http://localhost:5000/api/attendance/checkin', {}, config);
      fetchToday();
      alert('Checked In!');
    } catch (err) { alert(err.response.data.msg); }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('http://localhost:5000/api/attendance/checkout', {}, config);
      fetchToday();
      alert('Checked Out!');
    } catch (err) { alert(err.response.data.msg); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Welcome, {user.name} ({user.role})</h1>
        <button onClick={handleLogout} style={{ height: '30px' }}>Logout</button>
      </div>

      
      {user.role === 'employee' && (
        <div>
          <h3>Today's Status</h3>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> {attendance?.checkInTime ? 'Present' : 'Not Checked In'}</p>
            <p><strong>Check In:</strong> {attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString() : '-'}</p>
            <p><strong>Check Out:</strong> {attendance?.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString() : '-'}</p>
            
            <div style={{ marginTop: '20px' }}>
              {!attendance?.checkInTime && <button onClick={handleCheckIn}>Check In</button>}
              {attendance?.checkInTime && !attendance?.checkOutTime && <button onClick={handleCheckOut} style={{ marginLeft: '10px' }}>Check Out</button>}
            </div>
          </div>
        </div>
      )}

      
      {user.role === 'manager' && (
        <div>
          <h3>Team Attendance Summary</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allRecords.map(rec => (
                <tr key={rec._id}>
                  <td>{rec.userId?.name || 'Unknown'}</td>
                  <td>{rec.date}</td>
                  <td>{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '-'}</td>
                  <td>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                  <td>{rec.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;