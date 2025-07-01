import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

const Reports = () => {
  const [customers, setCustomers] = useState([]);
  const [milkEntries, setMilkEntries] = useState([]);
  const [reportType, setReportType] = useState('daily');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedWeek, setSelectedWeek] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    const savedEntries = JSON.parse(localStorage.getItem('milkEntries') || '[]');
    setCustomers(savedCustomers);
    setMilkEntries(savedEntries);
  };

  const generateReport = () => {
    let filteredEntries = [];
    let reportTitle = '';

    switch (reportType) {
      case 'daily':
        filteredEntries = milkEntries.filter(entry => entry.date === selectedDate);
        reportTitle = `Daily Report - ${format(new Date(selectedDate), 'dd/MM/yyyy')}`;
        break;
      case 'weekly':
        const weekStart = startOfWeek(new Date(selectedWeek));
        const weekEnd = endOfWeek(new Date(selectedWeek));
        filteredEntries = milkEntries.filter(entry => {
          const entryDate = parseISO(entry.date);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
        reportTitle = `Weekly Report - ${format(weekStart, 'dd/MM/yyyy')} to ${format(weekEnd, 'dd/MM/yyyy')}`;
        break;
      case 'monthly':
        const monthStart = startOfMonth(new Date(selectedMonth + '-01'));
        const monthEnd = endOfMonth(new Date(selectedMonth + '-01'));
        filteredEntries = milkEntries.filter(entry => {
          const entryDate = parseISO(entry.date);
          return entryDate >= monthStart && entryDate <= monthEnd;
        });
        reportTitle = `Monthly Report - ${format(monthStart, 'MMMM yyyy')}`;
        break;
      case 'customer':
        if (selectedCustomer) {
          filteredEntries = milkEntries.filter(entry => entry.customerId === selectedCustomer);
          const customer = customers.find(c => c.id === selectedCustomer);
          reportTitle = `Customer Report - ${customer?.name}`;
        }
        break;
      case 'comprehensive':
        filteredEntries = milkEntries;
        reportTitle = 'Comprehensive Business Report';
        break;
      default:
        break;
    }

    if (selectedCustomer && reportType !== 'customer') {
      filteredEntries = filteredEntries.filter(entry => entry.customerId === selectedCustomer);
    }

    const totalQuantity = filteredEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const averageQuantity = filteredEntries.length > 0 ? totalQuantity / filteredEntries.length : 0;

    const customerBreakdown = customers.map(customer => {
      const customerEntries = filteredEntries.filter(entry => entry.customerId === customer.id);
      const customerTotal = customerEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const customerQuantity = customerEntries.reduce((sum, entry) => sum + entry.quantity, 0);
      return {
        name: customer.name,
        category: customer.category,
        entries: customerEntries.length,
        quantity: customerQuantity,
        amount: customerTotal
      };
    }).filter(customer => customer.entries > 0);

    setReportData({
      title: reportTitle,
      entries: filteredEntries,
      summary: {
        totalEntries: filteredEntries.length,
        totalQuantity: totalQuantity.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        averageQuantity: averageQuantity.toFixed(2)
      },
      customerBreakdown
    });
  };

  const exportReport = () => {
    if (!reportData) return;

    // Prepare CSV content
    let csv = '';
    csv += `"${reportData.title}",Generated on:,${format(new Date(), 'dd/MM/yyyy HH:mm')}\n`;
    csv += '\nSUMMARY\n';
    csv += 'Total Entries,Total Quantity (L),Total Amount (PKR),Average Quantity per Entry (L)\n';
    csv += `${reportData.summary.totalEntries},${reportData.summary.totalQuantity},${reportData.summary.totalAmount},${reportData.summary.averageQuantity}\n`;
    csv += '\nCUSTOMER BREAKDOWN\n';
    csv += 'Customer,Category,Entries,Quantity (L),Amount (PKR)\n';
    reportData.customerBreakdown.forEach(customer => {
      csv += `${customer.name},${customer.category},${customer.entries},${customer.quantity.toFixed(2)},${customer.amount.toFixed(2)}\n`;
    });
    csv += '\nDETAILED ENTRIES\n';
    csv += 'Date,Customer,Quantity (L),Rate (PKR/Gravi),Amount (PKR),Notes\n';
    reportData.entries.forEach(entry => {
      csv += `${format(new Date(entry.date), 'dd/MM/yyyy')},${entry.customerName},${entry.quantity},${entry.rate},${entry.amount.toFixed(2)},"${(entry.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="card">
        <h2>Reports</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label>Report Type</label>
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="customer">Customer Report</option>
              <option value="comprehensive">Comprehensive Report</option>
            </select>
          </div>

          {reportType === 'daily' && (
            <div className="form-group">
              <label>Select Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {reportType === 'weekly' && (
            <div className="form-group">
              <label>Select Week</label>
              <input
                type="date"
                className="form-control"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <div className="form-group">
              <label>Select Month</label>
              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          )}

          {reportType === 'customer' && (
            <div className="form-group">
              <label>Select Customer</label>
              <select
                className="form-control"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType !== 'customer' && customers.length > 0 && (
            <div className="form-group">
              <label>Filter by Customer (Optional)</label>
              <select
                className="form-control"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn btn-primary" onClick={generateReport}>
            Generate Report
          </button>
          {reportData && (
            <button className="btn btn-success" onClick={exportReport}>
              Export Report
            </button>
          )}
        </div>

        {reportData && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{reportData.title}</h3>
              <small style={{ color: '#718096' }}>
                Generated on {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </small>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{reportData.summary.totalEntries}</div>
                <div className="stat-label">Total Entries</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{reportData.summary.totalQuantity}L</div>
                <div className="stat-label">Total Quantity</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">PKR{reportData.summary.totalAmount}</div>
                <div className="stat-label">Total Amount</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{reportData.summary.averageQuantity}L</div>
                <div className="stat-label">Average per Entry</div>
              </div>
            </div>

            {reportData.customerBreakdown.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4>Customer Breakdown</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Category</th>
                      <th>Entries</th>
                      <th>Quantity (L)</th>
                      <th>Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.customerBreakdown.map((customer, index) => (
                      <tr key={index}>
                        <td>{customer.name}</td>
                        <td>
                          <span className={`category-badge category-${customer.category}`}>
                            {customer.category.charAt(0).toUpperCase() + customer.category.slice(1)}
                          </span>
                        </td>
                        <td>{customer.entries}</td>
                        <td>{customer.quantity.toFixed(2)}</td>
                        <td>PKR{customer.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportData.entries.length > 0 && (
              <div>
                <h4>Detailed Entries</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Quantity (L)</th>
                      <th>Rate (PKR/Gravi)</th>
                      <th>Amount (PKR)</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.entries.map(entry => (
                      <tr key={entry.id}>
                        <td>{format(new Date(entry.date), 'dd/MM/yyyy')}</td>
                        <td>{entry.customerName}</td>
                        <td>{entry.quantity}</td>
                        <td>PKR{entry.rate}</td>
                        <td>PKR{entry.amount.toFixed(2)}</td>
                        <td>{entry.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports; 