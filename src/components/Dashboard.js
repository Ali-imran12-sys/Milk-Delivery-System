import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalMilkDelivered: 0,
    totalEarnings: 0,
    todayDeliveries: 0
  });

  useEffect(() => {
    // Load data from localStorage
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const milkEntries = JSON.parse(localStorage.getItem('milkEntries') || '[]');
    
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = milkEntries.filter(entry => entry.date === today);
    
    const totalMilk = milkEntries.reduce((sum, entry) => sum + parseFloat(entry.quantity), 0);
    const totalEarnings = milkEntries.reduce((sum, entry) => sum + (parseFloat(entry.quantity) * 50), 0); // Assuming ₹50 per liter
    
    setStats({
      totalCustomers: customers.length,
      totalMilkDelivered: totalMilk.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2),
      todayDeliveries: todayEntries.length
    });
  }, []);

  return (
    <div>
      <div className="card">
        <h2>Dashboard Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalMilkDelivered}L</div>
            <div className="stat-label">Total Milk Delivered</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">PKR{stats.totalEarnings}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.todayDeliveries}</div>
            <div className="stat-label">Today's Deliveries</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/customers" className="btn btn-primary">
            Add New Customer
          </Link>
          <Link to="/daily-entry" className="btn btn-success">
            Daily Milk Entry
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            View Reports
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Recent Activity</h2>
        <div style={{ color: '#718096', fontStyle: 'italic' }}>
          No recent activity to display. Start by adding customers or making daily entries.
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 