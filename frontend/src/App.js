import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import AttendanceHistory from './components/AttendanceHistory';

import Profile from './components/Profile';
import ManagerDashboard from './components/ManagerDashboard'; 
import Reports from './components/Reports'; 
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          <Route path="/dashboard" element={
            user ? (
                user.role === 'employee' 
                ? <EmployeeDashboard /> 
                : <ManagerDashboard /> 
            ) : <Navigate to="/login" />
          } />
  <Route path="/reports" element={
             user && user.role === 'manager' ? <Reports /> : <Navigate to="/login" />
          } />

          <Route path="/history" element={
             user ? <AttendanceHistory /> : <Navigate to="/login" />
          } />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;