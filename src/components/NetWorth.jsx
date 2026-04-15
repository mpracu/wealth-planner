import React, { useState, useEffect, useMemo, useRef } from 'react';
import { post as apiPost, get as apiGet, put as apiPut, del as apiDel } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './NetWorth.css';

const getThemeColors = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'dark' 
    ? { bg: '#1a1a1a', border: '#333', text: '#fff', grid: '#333', axis: '#888' }
    : { bg: '#ffffff', border: '#ddd', text: '#1a1a1a', grid: '#ddd', axis: '#666' };
};

export default function NetWorth() {
  const formRef = useRef(null);
  const [items, setItems] = useState([]);
  const [recurringItems, setRecurringItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'asset',
    value: 0,
    tags: ''
  });
  const [recurringFormData, setRecurringFormData] = useState({
    assetName: '',
    amount: 0,
    dayOfMonth: 1,
    tags: ''
  });
  const [currency, setCurrency] = useState('€');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [forecastYears, setForecastYears] = useState(10);
  const [forecastReturn, setForecastReturn] = useState(7);
  const [forecastInflation, setForecastInflation] = useState(2);
  const [themeColors, setThemeColors] = useState(getThemeColors());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeColors(getThemeColors());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadItems();
    loadRecurringItems();
    loadHistory();
  }, []);

  const loadItems = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await apiGet({ 
        apiName: 'WealthPlannerAPI', 
        path: '/networth',
        options: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      const data = await response.body.json();
      setItems(data);
    } catch (err) {
      console.error('Error loading items:', err);
    }
  };

  const loadRecurringItems = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await apiGet({ 
        apiName: 'WealthPlannerAPI', 
        path: '/recurring',
        options: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      const data = await response.body.json();
      setRecurringItems(data);
    } catch (err) {
      console.error('Error loading recurring items:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await apiGet({ 
        apiName: 'WealthPlannerAPI', 
        path: '/networth-history',
        options: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      const data = await response.body.json();
      setHistory(data);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const saveItem = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.value === 0) return;
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (editingId) {
        await apiPut({
          apiName: 'WealthPlannerAPI',
          path: `/networth/${editingId}`,
          options: { 
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }).response;
      } else {
        await apiPost({
          apiName: 'WealthPlannerAPI',
          path: '/networth',
          options: { 
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }).response;
      }
      resetForm();
      loadItems();
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  const saveRecurringItem = async (e) => {
    e.preventDefault();
    if (!recurringFormData.assetName || recurringFormData.amount === 0) return;
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiPost({
        apiName: 'WealthPlannerAPI',
        path: '/recurring',
        options: { 
          body: recurringFormData,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      resetRecurringForm();
      loadRecurringItems();
    } catch (err) {
      console.error('Error saving recurring item:', err);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiDel({ 
        apiName: 'WealthPlannerAPI', 
        path: `/networth/${itemId}`,
        options: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      loadItems();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const deleteRecurringItem = async (itemId) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiDel({ 
        apiName: 'WealthPlannerAPI', 
        path: `/recurring/${itemId}`,
        options: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      loadRecurringItems();
    } catch (err) {
      console.error('Error deleting recurring item:', err);
    }
  };

  const refreshPrices = async () => {
    setRefreshing(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiPost({
        apiName: 'WealthPlannerAPI',
        path: '/refresh-prices',
        options: { headers: { Authorization: `Bearer ${token}` } }
      }).response;
      await loadItems();
    } catch (err) {
      console.error('Error refreshing prices:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push('Type,Name,Value,Tags,ISIN,Shares,PricePerShare');
    
    items.forEach(item => {
      csvRows.push([
        item.type,
        `"${item.name}"`,
        item.value,
        `"${item.tags || ''}"`,
        item.isin || '',
        item.shares || '',
        item.pricePerShare || ''
      ].join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `networth-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const text = await file.text();
    const lines = text.split('\n').slice(1); // Skip header
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const match = line.match(/^([^,]+),"([^"]+)",([^,]+),"([^"]*)",([^,]*),([^,]*),([^,]*)$/);
        if (!match) continue;
        
        const [, type, name, value, tags, isin, shares, pricePerShare] = match;
        
        const itemData = {
          name: name.trim(),
          type: type.trim(),
          value: parseFloat(value),
          tags: tags.trim(),
          ...(isin && { isin: isin.trim() }),
          ...(shares && { shares: parseFloat(shares) }),
          ...(pricePerShare && { pricePerShare: parseFloat(pricePerShare) })
        };
        
        await apiPost({
          apiName: 'WealthPlannerAPI',
          path: '/networth',
          options: {
            headers: { Authorization: `Bearer ${token}` },
            body: itemData
          }
        }).response;
      }
      
      loadItems();
      alert('Import successful!');
    } catch (err) {
      console.error('Error importing:', err);
      alert('Import failed. Check console for details.');
    }
    
    e.target.value = '';
  };

  const editItem = (item) => {
    setFormData({
      name: item.name,
      type: item.type,
      value: item.value,
      tags: item.tags || '',
      isin: item.isin || '',
      shares: item.shares || '',
      pricePerShare: item.pricePerShare || ''
    });
    setEditingId(item.itemId);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'asset', value: 0, tags: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const resetRecurringForm = () => {
    setRecurringFormData({ assetName: '', amount: 0, dayOfMonth: 1, tags: '' });
    setShowRecurringForm(false);
  };

  const assetNames = [...new Set(items.filter(i => i.type === 'asset').map(i => i.name))];

  const totalAssets = items.filter(i => i.type === 'asset').reduce((sum, i) => sum + i.value, 0);
  const totalLiabilities = items.filter(i => i.type === 'liability').reduce((sum, i) => sum + i.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const chartData = useMemo(() => {
    return history.map(h => ({
      date: new Date(h.date).toLocaleDateString(),
      netWorth: h.netWorth
    }));
  }, [history]);

  const forecastData = useMemo(() => {
    const monthlyRecurring = recurringItems.reduce((sum, r) => sum + r.amount, 0);
    const annualRecurring = monthlyRecurring * 12;
    
    let currentValue = netWorth;
    const data = [{ year: 0, nominal: currentValue, real: currentValue }];
    
    for (let year = 1; year <= forecastYears; year++) {
      currentValue = (currentValue + annualRecurring) * (1 + forecastReturn / 100);
      const realValue = currentValue / Math.pow(1 + forecastInflation / 100, year);
      data.push({
        year,
        nominal: Math.round(currentValue),
        real: Math.round(realValue)
      });
    }
    
    return data;
  }, [netWorth, recurringItems, forecastYears, forecastReturn, forecastInflation]);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const allocationData = useMemo(() => {
    const grouped = {};
    items.filter(i => i.type === 'asset').forEach(item => {
      const category = item.tags?.split(',')[0]?.trim() || 'Other';
      grouped[category] = (grouped[category] || 0) + item.value;
    });
    
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalAssets) * 100).toFixed(2)
    })).sort((a, b) => b.value - a.value);
  }, [items, totalAssets]);

  return (
    <div className="networth">
      <div className="networth-header">
        <div className="networth-summary">
          <div className="summary-card">
            <h3>Total Assets</h3>
            <p className="positive">{currency}{totalAssets.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          <div className="summary-card">
            <h3>Total Liabilities</h3>
            <p className="negative">{currency}{totalLiabilities.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          <div className="summary-card highlight">
            <h3>Net Worth</h3>
            <p className={netWorth >= 0 ? 'positive' : 'negative'}>{currency}{netWorth.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={refreshPrices}
            disabled={refreshing}
            title="Refresh prices from Yahoo Finance"
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Prices'}
          </button>
          <button
            className="export-btn"
            onClick={exportToCSV}
            title="Export data to CSV"
          >
            📥 Export
          </button>
          <label className="import-btn" title="Import data from CSV">
            📤 Import
            <input 
              type="file" 
              accept=".csv" 
              onChange={importFromCSV} 
              style={{ display: 'none' }}
            />
          </label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="currency-select">
            <option value="€">€ EUR</option>
            <option value="$">$ USD</option>
            <option value="£">£ GBP</option>
          </select>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'assets' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('assets')}
        >
          💰 Assets & Liabilities
        </button>
        <button 
          className={activeTab === 'recurring' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('recurring')}
        >
          🔄 Recurring Investments
        </button>
        <button 
          className={activeTab === 'history' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('history')}
        >
          📈 History
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="charts-grid">
            {chartData.length > 0 && (
              <div className="chart">
                <h3>Net Worth History</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                    <XAxis dataKey="date" stroke={themeColors.axis} />
                    <YAxis stroke={themeColors.axis} tickFormatter={v => `${currency}${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ background: themeColors.bg, border: `1px solid ${themeColors.border}`, color: themeColors.text }} 
                      labelStyle={{ color: themeColors.text }}
                      itemStyle={{ color: themeColors.text }}
                      formatter={v => `${currency}${v.toLocaleString('es-ES', {minimumFractionDigits: 2})}`} 
                    />
                    <Line type="monotone" dataKey="netWorth" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {allocationData.length > 0 && (
              <div className="chart">
                <h3>Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: themeColors.bg, border: `1px solid ${themeColors.border}`, color: themeColors.text }}
                      labelStyle={{ color: themeColors.text }}
                      itemStyle={{ color: themeColors.text }}
                      formatter={(value) => `${currency}${value.toLocaleString('es-ES', {minimumFractionDigits: 2})}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="forecast-section">
            <h3>📈 Net Worth Forecast</h3>
            <div className="forecast-controls">
              <label>
                <span>Years</span>
                <input 
                  type="number" 
                  min="1" 
                  max="50" 
                  value={forecastYears} 
                  onChange={e => setForecastYears(+e.target.value)}
                />
              </label>
              <label>
                <span>Annual Return (%)</span>
                <input 
                  type="number" 
                  step="0.1" 
                  value={forecastReturn} 
                  onChange={e => setForecastReturn(+e.target.value)}
                />
              </label>
              <label>
                <span>Inflation (%)</span>
                <input 
                  type="number" 
                  step="0.1" 
                  value={forecastInflation} 
                  onChange={e => setForecastInflation(+e.target.value)}
                />
              </label>
            </div>
            
            <div className="forecast-summary">
              <div className="forecast-card">
                <h4>Current Net Worth</h4>
                <p>{currency}{netWorth.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="forecast-card">
                <h4>Monthly Recurring</h4>
                <p>{currency}{recurringItems.reduce((sum, r) => sum + r.amount, 0).toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="forecast-card highlight">
                <h4>Projected ({forecastYears} years)</h4>
                <p>{currency}{forecastData[forecastYears]?.nominal.toLocaleString('es-ES')}</p>
                <small>Real: {currency}{forecastData[forecastYears]?.real.toLocaleString('es-ES')}</small>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                <XAxis dataKey="year" stroke={themeColors.axis} label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke={themeColors.axis} tickFormatter={v => `${currency}${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ background: themeColors.bg, border: `1px solid ${themeColors.border}`, color: themeColors.text }}
                  labelStyle={{ color: themeColors.text }}
                  itemStyle={{ color: themeColors.text }}
                  formatter={v => `${currency}${v.toLocaleString('es-ES')}`}
                />
                <Line type="monotone" dataKey="nominal" stroke="#3b82f6" strokeWidth={2} name="Nominal Value" />
                <Line type="monotone" dataKey="real" stroke="#22c55e" strokeWidth={2} name="Real Value (Inflation-Adjusted)" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="allocation-table">
            <h3>Detailed Allocation</h3>
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Value</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {items.filter(i => i.type === 'asset').sort((a, b) => b.value - a.value).map(item => (
                  <tr key={item.itemId}>
                    <td>{item.name}</td>
                    <td>{currency}{item.value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>{((item.value / totalAssets) * 100).toFixed(2)}%</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td><strong>{currency}{totalAssets.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'assets' && (
        <>
          <div className="tab-header">
            <h2>Manage Assets & Liabilities</h2>
            <button onClick={() => { console.log('Add Item clicked'); setShowForm(!showForm); }}>
              ➕ Add Item
            </button>
          </div>

      <div className="import-help">
        <p>💡 <a href="/networth-template.csv" download>Download CSV Template</a> for bulk import</p>
      </div>

      {showForm && !editingId && (
        <div className="item-form" ref={formRef}>
          <h3>New Item</h3>
          <form onSubmit={saveItem}>
            <div className="form-grid">
              <label className="form-field form-field--wide">
                <span>Name</span>
                <input placeholder="e.g., Savings Account, Fidelity S&P 500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </label>

              <label className="form-field">
                <span>Type</span>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                </select>
              </label>

              <label className="form-field">
                <span>Value ({currency})</span>
                <input type="number" step="0.01" placeholder="0.00" value={formData.value} onChange={e => setFormData({...formData, value: +e.target.value})} required />
              </label>

              <label className="form-field form-field--wide">
                <span>Tags <span className="field-hint">(optional, comma separated)</span></span>
                <input placeholder="e.g., Stocks, Real Estate, Index Fund" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </label>

              {formData.type === 'asset' && (
                <>
                  <label className="form-field">
                    <span>ISIN <span className="field-hint">(optional)</span></span>
                    <input
                      placeholder="e.g., IE00BYX5MX67"
                      value={formData.isin || ''}
                      onChange={e => setFormData({...formData, isin: e.target.value.toUpperCase()})}
                      maxLength={12}
                    />
                  </label>

                  <label className="form-field">
                    <span>Shares / Units <span className="field-hint">(optional)</span></span>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="e.g., 1000"
                      value={formData.shares || ''}
                      onChange={e => setFormData({...formData, shares: e.target.value})}
                    />
                  </label>

                  <label className="form-field">
                    <span>Price per Share <span className="field-hint">(optional)</span></span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 14.49"
                      value={formData.pricePerShare || ''}
                      onChange={e => setFormData({...formData, pricePerShare: e.target.value})}
                    />
                  </label>
                </>
              )}
            </div>

            <div className="form-actions">
              <button type="submit">💾 Save</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showRecurringForm && (
        <div className="item-form">
          <h3>Recurring Monthly Investment</h3>
          <form onSubmit={saveRecurringItem}>
            <select value={recurringFormData.assetName} onChange={e => setRecurringFormData({...recurringFormData, assetName: e.target.value})} required>
              <option value="">Select existing asset...</option>
              {assetNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <input type="number" placeholder="Amount" value={recurringFormData.amount} onChange={e => setRecurringFormData({...recurringFormData, amount: +e.target.value})} required />
            <input type="number" min="1" max="28" placeholder="Day of month (1-28)" value={recurringFormData.dayOfMonth} onChange={e => setRecurringFormData({...recurringFormData, dayOfMonth: +e.target.value})} required />
            <input placeholder="Tags (comma separated)" value={recurringFormData.tags} onChange={e => setRecurringFormData({...recurringFormData, tags: e.target.value})} />
            
            <div className="form-actions">
              <button type="submit">💾 Save</button>
              <button type="button" onClick={resetRecurringForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="items-list">
        <div className="items-section-header">
          <h3>Assets</h3>
          <span className="items-count">{items.filter(i => i.type === 'asset').length} items</span>
        </div>
        {items.filter(i => i.type === 'asset').length === 0 && (
          <div className="empty-state-small">No assets yet. Click "Add Item" to get started.</div>
        )}
        {items.filter(i => i.type === 'asset').map(item => (
          <React.Fragment key={item.itemId}>
            <div className={`item-card ${item.isin ? 'item-card--investment' : ''}`}>
              <div className="item-header">
                <div className="item-title-group">
                  <h4>{item.name}</h4>
                  {item.tags && <div className="item-tags">{item.tags.split(',').map(t => <span key={t} className="tag">{t.trim()}</span>)}</div>}
                </div>
                <div className="item-actions">
                  <button className="btn-icon" onClick={() => editItem(item)} title="Edit">✏️</button>
                  <button className="btn-icon btn-icon--danger" onClick={() => deleteItem(item.itemId)} title="Delete">🗑️</button>
                </div>
              </div>
              <p className="item-value">{currency}{item.value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              {item.isin && (
                <div className="investment-details">
                  <span className="isin-badge">{item.isin}</span>
                  {item.shares && (
                    <span className="shares-detail">
                      {parseFloat(item.shares).toLocaleString('es-ES', {minimumFractionDigits: 3, maximumFractionDigits: 3})} shares
                      {item.pricePerShare && <> · {currency}{parseFloat(item.pricePerShare).toFixed(2)}/share</>}
                    </span>
                  )}
                  {item.updatedAt && <span className="price-updated">updated {new Date(item.updatedAt).toLocaleDateString()}</span>}
                </div>
              )}
            </div>

            {showForm && editingId === item.itemId && (
              <div className="item-form" ref={formRef}>
                <h3>Edit Item</h3>
                <form onSubmit={saveItem}>
                  <div className="form-grid">
                    <label className="form-field form-field--wide">
                      <span>Name</span>
                      <input placeholder="e.g., Savings Account, Fidelity S&P 500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </label>
                    <label className="form-field">
                      <span>Type</span>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Value ({currency})</span>
                      <input type="number" step="0.01" placeholder="0.00" value={formData.value} onChange={e => setFormData({...formData, value: +e.target.value})} required />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Tags <span className="field-hint">(optional)</span></span>
                      <input placeholder="e.g., Stocks, Real Estate, Index Fund" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                    </label>
                    {formData.type === 'asset' && (
                      <>
                        <label className="form-field">
                          <span>ISIN <span className="field-hint">(optional)</span></span>
                          <input placeholder="e.g., IE00BYX5MX67" value={formData.isin || ''} onChange={e => setFormData({...formData, isin: e.target.value.toUpperCase()})} maxLength={12} />
                        </label>
                        <label className="form-field">
                          <span>Shares / Units <span className="field-hint">(optional)</span></span>
                          <input type="number" step="0.001" placeholder="e.g., 1000" value={formData.shares || ''} onChange={e => setFormData({...formData, shares: e.target.value})} />
                        </label>
                        <label className="form-field">
                          <span>Price per Share <span className="field-hint">(optional)</span></span>
                          <input type="number" step="0.01" placeholder="e.g., 14.49" value={formData.pricePerShare || ''} onChange={e => setFormData({...formData, pricePerShare: e.target.value})} />
                        </label>
                      </>
                    )}
                  </div>
                  <div className="form-actions">
                    <button type="submit">💾 Save</button>
                    <button type="button" onClick={resetForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </React.Fragment>
        ))}

        <div className="items-section-header" style={{marginTop: '1.5rem'}}>
          <h3>Liabilities</h3>
          <span className="items-count">{items.filter(i => i.type === 'liability').length} items</span>
        </div>
        {items.filter(i => i.type === 'liability').length === 0 && (
          <div className="empty-state-small">No liabilities.</div>
        )}
        {items.filter(i => i.type === 'liability').map(item => (
          <React.Fragment key={item.itemId}>
            <div className="item-card item-card--liability">
              <div className="item-header">
                <div className="item-title-group">
                  <h4>{item.name}</h4>
                  {item.tags && <div className="item-tags">{item.tags.split(',').map(t => <span key={t} className="tag">{t.trim()}</span>)}</div>}
                </div>
                <div className="item-actions">
                  <button className="btn-icon" onClick={() => editItem(item)} title="Edit">✏️</button>
                  <button className="btn-icon btn-icon--danger" onClick={() => deleteItem(item.itemId)} title="Delete">🗑️</button>
                </div>
              </div>
              <p className="item-value negative">{currency}{item.value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            {showForm && editingId === item.itemId && (
              <div className="item-form" ref={formRef}>
                <h3>Edit Liability</h3>
                <form onSubmit={saveItem}>
                  <div className="form-grid">
                    <label className="form-field form-field--wide">
                      <span>Name</span>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </label>
                    <label className="form-field">
                      <span>Value ({currency})</span>
                      <input type="number" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: +e.target.value})} required />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Tags <span className="field-hint">(optional)</span></span>
                      <input placeholder="e.g., Mortgage, Car Loan" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="submit">💾 Save</button>
                    <button type="button" onClick={resetForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
        </>
      )}

      {activeTab === 'recurring' && (
        <>
          <div className="tab-header">
            <h2>Recurring Investments</h2>
            <button onClick={() => setShowRecurringForm(!showRecurringForm)}>
              ➕ Add Recurring
            </button>
          </div>

          {showRecurringForm && (
            <div className="item-form">
              <h3>New Recurring Investment</h3>
              <form onSubmit={saveRecurringItem}>
                <label>
                  <span>Asset Name</span>
                  <input placeholder="e.g., Index Fund" value={recurringFormData.assetName} onChange={e => setRecurringFormData({...recurringFormData, assetName: e.target.value})} required />
                </label>
                
                <label>
                  <span>Monthly Amount ({currency})</span>
                  <input type="number" step="0.01" placeholder="0.00" value={recurringFormData.amount} onChange={e => setRecurringFormData({...recurringFormData, amount: +e.target.value})} required />
                </label>
                
                <label>
                  <span>Day of Month</span>
                  <input type="number" placeholder="1-28" min="1" max="28" value={recurringFormData.dayOfMonth} onChange={e => setRecurringFormData({...recurringFormData, dayOfMonth: +e.target.value})} required />
                  <small style={{color: '#888', display: 'block', marginTop: '0.25rem'}}>This amount will be added monthly on day {recurringFormData.dayOfMonth}</small>
                </label>
                
                <label>
                  <span>Tags (optional)</span>
                  <input placeholder="e.g., Stocks, Retirement" value={recurringFormData.tags} onChange={e => setRecurringFormData({...recurringFormData, tags: e.target.value})} />
                </label>
                
                <div className="form-actions">
                  <button type="submit">💾 Save</button>
                  <button type="button" onClick={() => setShowRecurringForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="items-list">
            {recurringItems.map(item => (
              <div key={item.itemId} className="item-card">
                <div className="item-header">
                  <h4>{item.assetName}</h4>
                  <button onClick={() => deleteRecurringItem(item.itemId)}>🗑️</button>
                </div>
                <p className="item-value">{currency}{item.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})} monthly on day {item.dayOfMonth}</p>
                {item.tags && <p className="item-tags">{item.tags}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <>
          <h2>Net Worth History</h2>
          <div className="chart-large">
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                <XAxis dataKey="date" stroke={themeColors.axis} />
                <YAxis stroke={themeColors.axis} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
