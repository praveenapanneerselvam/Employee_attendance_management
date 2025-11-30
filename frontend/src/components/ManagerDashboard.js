import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard/manager', {
          headers: { 'x-auth-token': token }
        });
        setStats(res.data);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);
  if (error) return <div className="dashboard-container" style={{color: 'red', textAlign: 'center', marginTop: '50px'}}>
      <h2>❌ Dashboard Failed to Load</h2>
      <p>Check if your Node.js Backend Server is running and accessible at http://localhost:5000.</p>
  </div>;
  if (!stats) return <div>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Manager Dashboard</h2>
        <div>
            <button className="btn-secondary" onClick={() => navigate('/reports')}>View Reports</button>
            <button className="btn-secondary" style={{marginLeft:'10px'}} onClick={() => {
                localStorage.clear(); window.location.href='/login';
            }}>Logout</button>
        </div>
      </div>

      [cite_start]
      <div className="stats-grid">
        <div className="card blue">
          <h3>{stats.totalEmployees}</h3>
          <p>Total Employees</p>
        </div>
        <div className="card green">
          <h3>{stats.present}</h3>
          <p>Present Today</p>
        </div>
        <div className="card red">
          <h3>{stats.absent}</h3>
          <p>Absent Today</p>
        </div>
        <div className="card yellow">
          <h3>{stats.late}</h3>
          <p>Late Arrivals</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        
        [cite_start]{}
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>Department Attendance</h3>
            <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.departmentStats}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Present" fill="#2ecc71" />
                        <Bar dataKey="Absent" fill="#e74c3c" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        [cite_start]
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>Absent Employees Today</h3>
            {stats.absentEmployees.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {stats.absentEmployees.map(emp => (
                        <li key={emp._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                            <strong>{emp.name}</strong> <br/>
                            <span style={{ fontSize: '12px', color: '#666' }}>{emp.department} | {emp.employeeId}</span>
                        </li>
                    ))}
                </ul>
            ) : <p>Everyone is present! 🎉</p>}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;