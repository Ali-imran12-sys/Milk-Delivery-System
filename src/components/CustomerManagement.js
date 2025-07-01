import React, { useState, useEffect } from 'react';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    category: 'daily',
    rate: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    setCustomers(savedCustomers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    const newCustomer = {
      id: editingCustomer ? editingCustomer.id : Date.now().toString(),
      ...formData,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString()
    };

    let updatedCustomers;
    if (editingCustomer) {
      updatedCustomers = customers.map(customer => 
        customer.id === editingCustomer.id ? newCustomer : customer
      );
    } else {
      updatedCustomers = [...customers, newCustomer];
    }

    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
    setShowModal(false);
    setEditingCustomer(null);
    resetForm();
    showAlert(
      editingCustomer ? 'Customer updated successfully!' : 'Customer added successfully!', 
      'success'
    );
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      category: customer.category,
      rate: customer.rate
    });
    setShowModal(true);
  };

  const handleDelete = (customerId) => {
    setDeleteTarget(customerId);
  };

  const confirmDelete = () => {
    const updatedCustomers = customers.filter(customer => customer.id !== deleteTarget);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
    setDeleteTarget(null);
    showAlert('Customer deleted successfully!', 'success');
  };

  const cancelDelete = () => setDeleteTarget(null);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      category: 'daily',
      rate: ''
    });
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'daily': return 'category-daily';
      case 'weekly': return 'category-weekly';
      case 'monthly': return 'category-monthly';
      default: return 'category-daily';
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      try {
        const rows = text.split(/\r?\n/).filter(Boolean);
        if (rows.length < 2) throw new Error('CSV must have a header and at least one row');
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const required = ['name', 'phone', 'address', 'category', 'rate'];
        if (!required.every(r => headers.includes(r))) {
          throw new Error('CSV must include columns: name, phone, address, category, rate');
        }
        const newCustomers = rows.slice(1).map(row => {
          const cols = row.split(',');
          const obj = {};
          headers.forEach((h, i) => obj[h] = cols[i]?.trim() || '');
          return {
            id: Date.now().toString() + Math.random(),
            name: obj.name,
            phone: obj.phone,
            address: obj.address,
            category: obj.category.toLowerCase(),
            rate: parseFloat(obj.rate) || '',
            createdAt: new Date().toISOString()
          };
        });
        const updatedCustomers = [...customers, ...newCustomers];
        localStorage.setItem('customers', JSON.stringify(updatedCustomers));
        setCustomers(updatedCustomers);
        setImportError('');
        showAlert('Customers imported successfully!', 'success');
      } catch (err) {
        setImportError(err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Customer Management</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingCustomer(null);
                resetForm();
                setShowModal(true);
              }}
            >
              Add New Customer
            </button>
            <label className="btn btn-secondary" style={{ margin: 0 }}>
              Import CSV
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} />
            </label>
          </div>
        </div>
        {importError && <div className="alert alert-error">{importError}</div>}

        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Category</th>
              <th>Rate (PKR/L)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic' }}>
                  No customers found. Add your first customer to get started.
                </td>
              </tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address}</td>
                  <td>
                    <span className={`category-badge ${getCategoryBadgeClass(customer.category)}`}>
                      {customer.category.charAt(0).toUpperCase() + customer.category.slice(1)}
                    </span>
                  </td>
                  <td>PKR{customer.rate}</td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={() => handleDelete(customer.id)}
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
              <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rate per Gravi</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="Enter rate per gravi"
                  min="0"
                  step="0.01"
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
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
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
              Are you sure you want to delete this customer? This action cannot be undone.
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

export default CustomerManagement; 