import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [empId, setEmpId] = useState('');
  const navigate = useNavigate();

  const fetchReports = async () => {
    const token = localStorage.getItem('token');
    try {
      
      let query = `?date=${date}`;
      if (empId) query += `&employeeId=${empId}`;

      const res = await axios.get(`https://attendance-backend-moq7.onrender.com/api/attendance/report${query}`, {
        headers: { 'x-auth-token': token }
      });
      setAttendance(res.data);
    } catch (err) { alert('Error fetching reports'); }
  };

  useEffect(() => { fetchReports(); }, []); 

  
  const exportCSV = () => {
    if (attendance.length === 0) return alert('No data to export');

    const headers = ["Employee ID,Name,Department,Date,Status,Total Hours"];
    const rows = attendance.map(rec => 
        `${rec.userId?.employeeId || '-'},${rec.userId?.name || 'Unknown'},${rec.userId?.department || '-'},${rec.date},${rec.status},${rec.totalHours}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <div className="header">
         <button onClick={() => navigate('/dashboard')}>&larr; Back to Dashboard</button>
         <h2>Attendance Reports</h2>
      </div>

     
      <div className="card" style={{ background: '#f8f9fa', color: 'black', display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
         <div>
            <label style={{display:'block', marginBottom:'5px'}}>Select Date:</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{padding:'8px'}} />
         </div>
         <div>
            <label style={{display:'block', marginBottom:'5px'}}>Employee ID (Optional):</label>
            <input type="text" placeholder="e.g. EMP001" value={empId} onChange={e => setEmpId(e.target.value)} style={{padding:'8px'}} />
         </div>
         <button className="btn-secondary" style={{background:'#3498db'}} onClick={fetchReports}>Filter Data</button>
         <button className="btn-secondary" style={{background:'#27ae60', marginLeft:'auto'}} onClick={exportCSV}>Export CSV</button>
      </div>

      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Dept</th>
            <th>Date</th>
            <th>Status</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length > 0 ? attendance.map(rec => (
            <tr key={rec._id}>
              <td>{rec.userId?.name || 'Unknown'}</td>
              <td>{rec.userId?.employeeId || '-'}</td>
              <td>{rec.userId?.department || '-'}</td>
              <td>{rec.date}</td>
              <td className={`status-${rec.status}`}>{rec.status.toUpperCase()}</td>
              <td>{rec.totalHours}</td>
            </tr>
          )) : <tr><td colSpan="6" style={{textAlign:'center'}}>No records found</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;