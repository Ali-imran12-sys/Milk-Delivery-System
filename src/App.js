import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CustomerManagement from './components/CustomerManagement';
import DailyMilkEntry from './components/DailyMilkEntry';
import Reports from './components/Reports';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>🥛 Milk Delivery System</h1>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/customers" className="nav-link">Customers</Link>
            <Link to="/daily-entry" className="nav-link">Daily Entry</Link>
            <Link to="/reports" className="nav-link">Reports</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/daily-entry" element={<DailyMilkEntry />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
