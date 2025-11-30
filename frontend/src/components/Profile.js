import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="header">
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>&larr; Back to Dashboard</button>
        <h2>My Profile</h2>
      </div>

      <div className="card" style={{ textAlign: 'left', color: 'black', background: 'white', border: '1px solid #ddd' }}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Employee ID:</strong> {user.employeeId}</p>
        <p><strong>Department:</strong> {user.department}</p>
        <p><strong>Role:</strong> {user.role.toUpperCase()}</p>
      </div>
    </div>
  );
};

export default Profile;