import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const DailyMilkEntry = () => {
  const [customers, setCustomers] = useState([]);
  const [milkEntries, setMilkEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    quantity: '',
    notes: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = () => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    const savedEntries = JSON.parse(localStorage.getItem('milkEntries') || '[]');
    setCustomers(savedCustomers);
    const dateEntries = savedEntries.filter(entry => entry.date === selectedDate);
    setMilkEntries(dateEntries);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.quantity) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }
    const customer = customers.find(c => c.id === formData.customerId);
    const newEntry = {
      id: editingEntry ? editingEntry.id : Date.now().toString(),
      customerId: formData.customerId,
      customerName: customer.name,
      quantity: parseFloat(formData.quantity),
      rate: customer.rate,
      amount: parseFloat(formData.quantity) * customer.rate,
      date: selectedDate,
      notes: formData.notes,
      createdAt: editingEntry ? editingEntry.createdAt : new Date().toISOString()
    };
    let allEntries = JSON.parse(localStorage.getItem('milkEntries') || '[]');
    if (editingEntry) {
      allEntries = allEntries.map(entry => entry.id === editingEntry.id ? newEntry : entry);
    } else {
      allEntries.push(newEntry);
    }
    localStorage.setItem('milkEntries', JSON.stringify(allEntries));
    setMilkEntries(allEntries.filter(entry => entry.date === selectedDate));
    setShowModal(false);
    setEditingEntry(null);
    resetForm();
    showAlert(editingEntry ? 'Entry updated successfully!' : 'Entry added successfully!', 'success');
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      customerId: entry.customerId,
      quantity: entry.quantity.toString(),
      notes: entry.notes
    });
    setShowModal(true);
  };

  const handleDelete = (entryId) => {
    setDeleteTarget(entryId);
  };

  const confirmDelete = () => {
    let allEntries = JSON.parse(localStorage.getItem('milkEntries') || '[]');
    allEntries = allEntries.filter(entry => entry.id !== deleteTarget);
    localStorage.setItem('milkEntries', JSON.stringify(allEntries));
    setMilkEntries(allEntries.filter(entry => entry.date === selectedDate));
    setDeleteTarget(null);
    showAlert('Entry deleted successfully!', 'success');
  };

  const cancelDelete = () => setDeleteTarget(null);

  const resetForm = () => {
    setFormData({
      customerId: '',
      quantity: '',
      notes: ''
    });
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const getTotalForDate = () => {
    return milkEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getTotalQuantityForDate = () => {
    return milkEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Daily Milk Entry</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto' }}
            />
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingEntry(null);
                resetForm();
                setShowModal(true);
              }}
              disabled={customers.length === 0}
            >
              Add Entry
            </button>
          </div>
        </div>

        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        {customers.length === 0 && (
          <div className="alert alert-error">
            No customers found. Please add customers first before making milk entries.
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{milkEntries.length}</div>
            <div className="stat-label">Total Entries</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{getTotalQuantityForDate().toFixed(2)}L</div>
            <div className="stat-label">Total Quantity</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">PKR{getTotalForDate().toFixed(2)}</div>
            <div className="stat-label">Total Amount</div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Quantity (L)</th>
              <th>Rate (PKR/Gravi)</th>
              <th>Amount (PKR)</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {milkEntries.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic' }}>
                  No entries found for {format(new Date(selectedDate), 'dd/MM/yyyy')}. Add your first entry to get started.
                </td>
              </tr>
            ) : (
              milkEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.customerName}</td>
                  <td>{entry.quantity}</td>
                  <td>PKR{entry.rate}</td>
                  <td>PKR{entry.amount.toFixed(2)}</td>
                  <td>{entry.notes}</td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}
                      onClick={() => handleEdit(entry)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer *</label>
                <select
                  className="form-control"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - PKR{customer.rate}/Gravi
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity (L) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity in liters"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes"
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEntry ? 'Update Entry' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="close-btn" onClick={cancelDelete}>×</button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              Are you sure you want to delete this entry? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMilkEntry; 