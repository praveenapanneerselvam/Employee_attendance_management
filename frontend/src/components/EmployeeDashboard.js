import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [today, setToday] = useState(null);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, totalHours: 0 });
  const [recent, setRecent] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const config = { headers: { 'x-auth-token': token } };

  const fetchData = async () => {
    try {
      
      const todayRes = await axios.get('http://localhost:5000/api/attendance/today', config);
      setToday(todayRes.data);

      
      const summaryRes = await axios.get('http://localhost:5000/api/attendance/my-summary', config);
      setSummary(summaryRes.data);

      
      const historyRes = await axios.get('http://localhost:5000/api/attendance/my-history', config);
      setRecent(historyRes.data.slice(0, 5)); // Take top 5
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  
  const handleCheckIn = async () => {
    try {
      await axios.post('http://localhost:5000/api/attendance/checkin', {}, config);
      alert('Checked In Successfully!');
      fetchData(); 
    } catch (err) { 
      alert(err.response?.data?.msg || 'Error checking in'); 
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('http://localhost:5000/api/attendance/checkout', {}, config);
      alert('Checked Out Successfully!');
      fetchData(); 
    } catch (err) { 
      alert(err.response?.data?.msg || 'Error checking out'); 
    }
  };

  return (
    <div className="dashboard-container">
      
      <div className="header">
        <h2>Welcome, {user.name}</h2>
        <div className="profile-badge">{user.department} | {user.employeeId}</div>
        <button className="btn-secondary" onClick={() => navigate('/history')}>View Full History</button>
        <button className="btn-secondary" style={{marginLeft:'10px'}} onClick={() => {
                localStorage.clear(); window.location.href='/login';
            }}>Logout</button>
      </div>
<div>
    <button className="btn-secondary" onClick={() => navigate('/profile')}>My Profile</button>
     
      </div>

      <div className="stats-grid">
        <div className="card green">
          <h3>{summary.present}</h3>
          <p>Present Days</p>
        </div>
        <div className="card red">
          <h3>{summary.absent}</h3>
          <p>Absent Days</p>
        </div>
        <div className="card yellow">
          <h3>{summary.late}</h3>
          <p>Late Days</p>
        </div>
        <div className="card blue">
          <h3>{summary.totalHours} hrs</h3>
          <p>Worked This Month</p>
        </div>
      </div>

      
      <div className="action-section" style={{ textAlign: 'center', margin: '30px 0' }}>
        <h3>Today's Status: {new Date().toLocaleDateString()}</h3>
        
        <div className="status-box" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
             
             
             {!today || !today.checkInTime ? (
                <div>
                    <p>You have not marked attendance today.</p>
                    <button className="btn-checkin" onClick={handleCheckIn}>
                        ✅ Check In Now
                    </button>
                </div>
             ) : (
               
                <div>
                    <p style={{ fontSize: '18px' }}>
                        <strong>Checked In at:</strong> {new Date(today.checkInTime).toLocaleTimeString()}
                    </p>
                    
                   
                    {!today.checkOutTime ? (
                        <div>
                            <p>Current Status: Working...</p>
                            <button className="btn-checkout" onClick={handleCheckOut}>
                                🛑 Check Out
                            </button>
                        </div>
                    ) : (
                       
                        <div className="completed-msg">
                            <p style={{ fontSize: '18px' }}>
                                <strong>Checked Out at:</strong> {new Date(today.checkOutTime).toLocaleTimeString()}
                            </p>
                            <span className="badge badge-present" style={{ fontSize: '16px', padding: '10px' }}>
                                ✨ Attendance Completed
                            </span>
                        </div>
                    )}
                </div>
             )}
        </div>
      </div>

     
      <div className="recent-list">
        <h3>Recent Activity</h3>
        <table>
            <thead><tr><th>Date</th><th>Status</th><th>Hours</th></tr></thead>
            <tbody>
                {recent.map(rec => (
                    <tr key={rec._id}>
                        <td>{rec.date}</td>
                        <td className={`status-${rec.status}`}>
                            <span className={`badge badge-${rec.status}`}>
                                {rec.status.toUpperCase()}
                            </span>
                        </td>
                        <td>{rec.totalHours || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;