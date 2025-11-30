import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('https://attendance-backend-moq7.onrender.com/api/attendance/my-history', {
            headers: { 'x-auth-token': token }
        });
        setHistory(res.data);
      } catch (err) { console.error(err); }
    };
    fetchHistory();
  }, []);

  
  const filteredHistory = history.filter(rec => rec.date.startsWith(filterMonth));

  return (
    <div className="dashboard-container">
      <div className="header">
        <button onClick={() => navigate('/dashboard')}>&larr; Back to Dashboard</button>
        <h2>My Attendance History</h2>
      </div>

      <div className="controls">
        <label>Select Month: </label>
        <input 
            type="month" 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)} 
        />
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.length > 0 ? filteredHistory.map(record => (
            <tr key={record._id} className={`row-${record.status}`}>
              <td>{record.date}</td>
              <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
              <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}</td>
              <td>{record.totalHours || '0'} hrs</td>
              <td>
                <span className={`badge badge-${record.status}`}>
                    {record.status.toUpperCase()}
                </span>
              </td>
            </tr>
          )) : (
              <tr><td colSpan="5">No records found for this month</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceHistory;