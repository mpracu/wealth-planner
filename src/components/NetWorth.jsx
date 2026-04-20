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
  const [editingRecurringId, setEditingRecurringId] = useState(null);
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
    const itemData = { ...formData };
    // Auto-calculate value from shares × price when both are set
    if (itemData.shares && itemData.pricePerShare) {
      itemData.value = parseFloat(itemData.shares) * parseFloat(itemData.pricePerShare);
    }
    if (!itemData.name || !itemData.value) return;
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (editingId) {
        await apiPut({
          apiName: 'WealthPlannerAPI',
          path: `/networth/${editingId}`,
          options: { body: itemData, headers: { Authorization: `Bearer ${token}` } }
        }).response;
      } else {
        await apiPost({
          apiName: 'WealthPlannerAPI',
          path: '/networth',
          options: { body: itemData, headers: { Authorization: `Bearer ${token}` } }
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
    if (!recurringFormData.assetName || !recurringFormData.amount) return;
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (editingRecurringId) {
        await apiPut({
          apiName: 'WealthPlannerAPI',
          path: `/recurring/${editingRecurringId}`,
          options: { body: recurringFormData, headers: { Authorization: `Bearer ${token}` } }
        }).response;
      } else {
        await apiPost({
          apiName: 'WealthPlannerAPI',
          path: '/recurring',
          options: { body: recurringFormData, headers: { Authorization: `Bearer ${token}` } }
        }).response;
      }
      resetRecurringForm();
      loadRecurringItems();
    } catch (err) {
      console.error('Error saving recurring item:', err);
    }
  };

  const editRecurringItem = (item) => {
    setRecurringFormData({
      assetName: item.assetName,
      amount: item.amount,
      dayOfMonth: item.dayOfMonth,
      tags: item.tags || ''
    });
    setEditingRecurringId(item.itemId);
    setShowRecurringForm(true);
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
      const res = await apiPost({
        apiName: 'WealthPlannerAPI',
        path: '/refresh-prices',
        options: { headers: { Authorization: `Bearer ${token}` } }
      }).response;
      const result = await res.body.json();
      console.log('Refresh result:', result);
      if (result.errors?.length) console.warn('Refresh errors:', result.errors);
      await loadItems();
      const msg = result.updated > 0
        ? `Updated ${result.updated} of ${result.total} holding${result.total !== 1 ? 's' : ''}`
        : `No holdings updated (${result.total} with ISIN found${result.errors?.length ? `, ${result.errors.length} error(s). Check console` : ''})`;
      alert(msg);
    } catch (err) {
      console.error('Error refreshing prices:', err);
      alert('Refresh failed. Check console for details.');
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
    setEditingRecurringId(null);
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

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const lastSnapshot = history.length > 0 ? history[history.length - 1] : null;
  const netWorthChange = lastSnapshot ? netWorth - lastSnapshot.netWorth : null;
  const netWorthChangePct = lastSnapshot?.netWorth ? (netWorthChange / lastSnapshot.netWorth) * 100 : null;
  const monthlyDCA = recurringItems.reduce((s, r) => s + r.amount, 0);

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

      {/* ── Premium Hero ─────────────────────────────────── */}
      <div className="nw-hero">
        <div className="nw-hero-glow" />
        <div className="nw-hero-left">
          <p className="nw-hero-label">Total Net Worth</p>
          <h1 className="nw-hero-amount">
            <span className="nw-hero-currency">{currency}</span>
            {Math.abs(netWorth).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h1>
          {netWorthChange !== null && (
            <div className={`nw-hero-badge ${netWorthChange >= 0 ? 'nw-hero-badge--up' : 'nw-hero-badge--down'}`}>
              <span>{netWorthChange >= 0 ? '▲' : '▼'}</span>
              <span>{currency}{Math.abs(netWorthChange).toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
              {netWorthChangePct !== null && <span className="nw-hero-badge-pct">({netWorthChangePct >= 0 ? '+' : ''}{netWorthChangePct.toFixed(2)}%)</span>}
              <span className="nw-hero-badge-sub">since last snapshot</span>
            </div>
          )}
        </div>
        <div className="nw-hero-actions">
          <button className="nw-btn nw-btn--primary" onClick={refreshPrices} disabled={refreshing}>
            {refreshing ? '↻ Updating…' : '↻ Refresh'}
          </button>
          <button className="nw-btn" onClick={exportToCSV}>↓ Export</button>
          <label className="nw-btn">↑ Import<input type="file" accept=".csv" onChange={importFromCSV} style={{display:'none'}} /></label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="nw-currency-select">
            <option value="€">€ EUR</option>
            <option value="$">$ USD</option>
            <option value="£">£ GBP</option>
          </select>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────── */}
      <div className="nw-stats-bar">
        <div className="nw-stat">
          <span className="nw-stat-label">Assets</span>
          <span className="nw-stat-value nw-stat-value--up">{currency}{totalAssets.toLocaleString('es-ES', {maximumFractionDigits: 0})}</span>
        </div>
        <div className="nw-stat-sep" />
        <div className="nw-stat">
          <span className="nw-stat-label">Liabilities</span>
          <span className="nw-stat-value nw-stat-value--down">{currency}{totalLiabilities.toLocaleString('es-ES', {maximumFractionDigits: 0})}</span>
        </div>
        <div className="nw-stat-sep" />
        <div className="nw-stat">
          <span className="nw-stat-label">Monthly DCA</span>
          <span className="nw-stat-value">{currency}{monthlyDCA.toLocaleString('es-ES', {maximumFractionDigits: 0})}<span className="nw-stat-sub">/mo</span></span>
        </div>
        <div className="nw-stat-sep" />
        <div className="nw-stat">
          <span className="nw-stat-label">Tracked Holdings</span>
          <span className="nw-stat-value">{items.filter(i => i.isin).length}<span className="nw-stat-sub"> ISINs</span></span>
        </div>
      </div>

      {/* ── Pill tabs ────────────────────────────────────── */}
      <div className="nw-tabs">
        {[
          { id: 'overview',  label: 'Overview'  },
          { id: 'assets',    label: 'Holdings'  },
          { id: 'recurring', label: 'Recurring' },
          { id: 'history',   label: 'History'   },
        ].map(({ id, label }) => (
          <button key={id} className={`nw-tab ${activeTab === id ? 'nw-tab--active' : ''}`} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Charts row */}
          <div className="nw-charts-grid">
            {chartData.length > 0 && (
              <div className="nw-card">
                <div className="nw-card-header"><h3>Net Worth History</h3></div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{top:8,right:8,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id="gwGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                    <XAxis dataKey="date" stroke={themeColors.axis} tick={{fontSize:11}} />
                    <YAxis stroke={themeColors.axis} tick={{fontSize:11}} tickFormatter={v => `${currency}${(v/1000).toFixed(0)}k`} width={56} />
                    <Tooltip contentStyle={{background:themeColors.bg, border:`1px solid ${themeColors.border}`, borderRadius:'8px', color:themeColors.text, fontSize:'0.85rem'}} formatter={v => [`${currency}${v.toLocaleString('es-ES',{minimumFractionDigits:2})}`, 'Net Worth']} />
                    <Line type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{r:4, fill:'#10b981'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {allocationData.length > 0 && (
              <div className="nw-card">
                <div className="nw-card-header"><h3>Allocation</h3></div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                      {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{background:themeColors.bg, border:`1px solid ${themeColors.border}`, borderRadius:'8px', color:themeColors.text, fontSize:'0.85rem'}} formatter={v => `${currency}${v.toLocaleString('es-ES',{minimumFractionDigits:2})}`} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'0.78rem'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Allocation bars */}
          {allocationData.length > 0 && (
            <div className="nw-card" style={{marginBottom:'1.25rem'}}>
              <div className="nw-card-header"><h3>Portfolio Breakdown</h3><span className="nw-card-sub">{items.filter(i=>i.type==='asset').length} assets · {currency}{totalAssets.toLocaleString('es-ES',{maximumFractionDigits:0})}</span></div>
              <div className="nw-alloc-list">
                {allocationData.map((cat, i) => (
                  <div key={cat.name} className="nw-alloc-row">
                    <div className="nw-alloc-dot" style={{background: COLORS[i % COLORS.length]}} />
                    <div className="nw-alloc-info">
                      <div className="nw-alloc-name">{cat.name}</div>
                      <div className="nw-alloc-bar-track">
                        <div className="nw-alloc-bar-fill" style={{width:`${cat.percentage}%`, background: COLORS[i % COLORS.length]}} />
                      </div>
                    </div>
                    <div className="nw-alloc-numbers">
                      <span className="nw-alloc-value">{currency}{cat.value.toLocaleString('es-ES',{maximumFractionDigits:0})}</span>
                      <span className="nw-alloc-pct">{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecast */}
          <div className="nw-card">
            <div className="nw-card-header">
              <h3>Wealth Forecast</h3>
              <div className="nw-forecast-controls">
                <label className="nw-fc-label"><span>Years</span><input type="number" min="1" max="50" value={forecastYears} onChange={e => setForecastYears(+e.target.value)} /></label>
                <label className="nw-fc-label"><span>Return %</span><input type="number" step="0.1" value={forecastReturn} onChange={e => setForecastReturn(+e.target.value)} /></label>
                <label className="nw-fc-label"><span>Inflation %</span><input type="number" step="0.1" value={forecastInflation} onChange={e => setForecastInflation(+e.target.value)} /></label>
              </div>
            </div>
            <div className="nw-forecast-summary">
              <div className="nw-fc-stat">
                <span>Today</span>
                <strong>{currency}{netWorth.toLocaleString('es-ES',{maximumFractionDigits:0})}</strong>
              </div>
              <div className="nw-fc-arrow">→</div>
              <div className="nw-fc-stat nw-fc-stat--highlight">
                <span>In {forecastYears} years (nominal)</span>
                <strong>{currency}{forecastData[forecastYears]?.nominal.toLocaleString('es-ES')}</strong>
              </div>
              <div className="nw-fc-stat">
                <span>Real (inflation-adj.)</span>
                <strong>{currency}{forecastData[forecastYears]?.real.toLocaleString('es-ES')}</strong>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={forecastData} margin={{top:8,right:8,left:0,bottom:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                <XAxis dataKey="year" stroke={themeColors.axis} tick={{fontSize:11}} label={{value:'Years from now', position:'insideBottom', offset:-4, fill:themeColors.axis, fontSize:11}} />
                <YAxis stroke={themeColors.axis} tick={{fontSize:11}} tickFormatter={v => `${currency}${(v/1000).toFixed(0)}k`} width={56} />
                <Tooltip contentStyle={{background:themeColors.bg, border:`1px solid ${themeColors.border}`, borderRadius:'8px', color:themeColors.text, fontSize:'0.85rem'}} formatter={v => `${currency}${v.toLocaleString('es-ES')}`} />
                <Line type="monotone" dataKey="nominal" stroke="#6366f1" strokeWidth={2} name="Nominal" dot={false} />
                <Line type="monotone" dataKey="real" stroke="#10b981" strokeWidth={2} name="Real" dot={false} strokeDasharray="5 3" />
                <Legend iconType="plainline" wrapperStyle={{fontSize:'0.8rem', paddingTop:'8px'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {activeTab === 'assets' && (
        <>
          <div className="nw-tab-toolbar">
            <div className="nw-tab-toolbar-left">
              <h2>Holdings</h2>
              <a href="/networth-template.csv" download className="nw-template-link">↓ CSV template</a>
            </div>
            <button className="nw-btn nw-btn--primary" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
              + Add Item
            </button>
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
                <span>Value ({currency}){formData.shares && formData.pricePerShare ? <span className="field-hint"> (auto-calculated)</span> : ''}</span>
                <input
                  type="number" step="0.01" placeholder="0.00"
                  value={formData.shares && formData.pricePerShare
                    ? (parseFloat(formData.shares) * parseFloat(formData.pricePerShare)).toFixed(2)
                    : formData.value}
                  readOnly={!!(formData.shares && formData.pricePerShare)}
                  onChange={e => setFormData({...formData, value: +e.target.value})}
                  style={formData.shares && formData.pricePerShare ? {opacity: 0.7, cursor: 'default'} : {}}
                />
              </label>

              <label className="form-field form-field--wide">
                <span>Tags <span className="field-hint">(optional, comma separated)</span></span>
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
          <span className="items-count">{items.filter(i => i.type === 'asset').length} items · {currency}{totalAssets.toLocaleString('es-ES', {maximumFractionDigits: 0})}</span>
        </div>
        {items.filter(i => i.type === 'asset').length === 0 && (
          <div className="empty-state-small">No assets yet. Click "Add Item" to get started.</div>
        )}
        {items.filter(i => i.type === 'asset').sort((a,b) => b.value - a.value).map(item => (
          <React.Fragment key={item.itemId}>
            <div className={`item-row ${item.isin ? 'item-row--investment' : ''}`}>
              <div className="item-row-info">
                <div className="item-row-name">{item.name}</div>
                <div className="item-row-sub">
                  {item.isin && <span className="isin-badge">{item.isin}</span>}
                  {item.shares && item.pricePerShare && (
                    <span className="shares-detail">{parseFloat(item.shares).toLocaleString('es-ES', {maximumFractionDigits: 3})} shares · {currency}{parseFloat(item.pricePerShare).toFixed(2)}</span>
                  )}
                  {item.tags && item.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <div className="item-row-right">
                <span className="item-row-value">{currency}{item.value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                <div className="item-actions">
                  <button className="btn-icon" onClick={() => editItem(item)} title="Edit">✏️</button>
                  <button className="btn-icon btn-icon--danger" onClick={() => deleteItem(item.itemId)} title="Delete">🗑️</button>
                </div>
              </div>
            </div>

            {showForm && editingId === item.itemId && (
              <div className="item-form" ref={formRef}>
                <h3>Edit: {item.name}</h3>
                <form onSubmit={saveItem}>
                  <div className="form-grid">
                    <label className="form-field form-field--wide">
                      <span>Name</span>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </label>
                    <label className="form-field">
                      <span>Type</span>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Value ({currency}){formData.shares && formData.pricePerShare ? <span className="field-hint"> (auto-calculated)</span> : ''}</span>
                      <input
                        type="number" step="0.01"
                        value={formData.shares && formData.pricePerShare
                          ? (parseFloat(formData.shares) * parseFloat(formData.pricePerShare)).toFixed(2)
                          : formData.value}
                        readOnly={!!(formData.shares && formData.pricePerShare)}
                        onChange={e => setFormData({...formData, value: +e.target.value})}
                        style={formData.shares && formData.pricePerShare ? {opacity: 0.7, cursor: 'default'} : {}}
                      />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Tags <span className="field-hint">(optional)</span></span>
                      <input placeholder="e.g., Stocks, Index Fund" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                    </label>
                    {formData.type === 'asset' && (
                      <>
                        <label className="form-field">
                          <span>ISIN <span className="field-hint">(optional)</span></span>
                          <input placeholder="e.g., IE00BYX5MX67" value={formData.isin || ''} onChange={e => setFormData({...formData, isin: e.target.value.toUpperCase()})} maxLength={12} />
                        </label>
                        <label className="form-field">
                          <span>Shares / Units</span>
                          <input type="number" step="0.001" placeholder="e.g., 1000" value={formData.shares || ''} onChange={e => setFormData({...formData, shares: e.target.value})} />
                        </label>
                        <label className="form-field">
                          <span>Price per Share</span>
                          <input type="number" step="0.0001" placeholder="e.g., 14.49" value={formData.pricePerShare || ''} onChange={e => setFormData({...formData, pricePerShare: e.target.value})} />
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
          <span className="items-count">{items.filter(i => i.type === 'liability').length} items · {currency}{totalLiabilities.toLocaleString('es-ES', {maximumFractionDigits: 0})}</span>
        </div>
        {items.filter(i => i.type === 'liability').length === 0 && (
          <div className="empty-state-small">No liabilities.</div>
        )}
        {items.filter(i => i.type === 'liability').sort((a,b) => b.value - a.value).map(item => (
          <React.Fragment key={item.itemId}>
            <div className="item-row item-row--liability">
              <div className="item-row-info">
                <div className="item-row-name">{item.name}</div>
                {item.tags && (
                  <div className="item-row-sub">
                    {item.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="item-row-right">
                <span className="item-row-value negative">{currency}{item.value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                <div className="item-actions">
                  <button className="btn-icon" onClick={() => editItem(item)} title="Edit">✏️</button>
                  <button className="btn-icon btn-icon--danger" onClick={() => deleteItem(item.itemId)} title="Delete">🗑️</button>
                </div>
              </div>
            </div>
            {showForm && editingId === item.itemId && (
              <div className="item-form" ref={formRef}>
                <h3>Edit: {item.name}</h3>
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
          <div className="nw-tab-toolbar">
            <div className="nw-tab-toolbar-left"><h2>Recurring Investments</h2></div>
            <button className="nw-btn nw-btn--primary" onClick={() => { resetRecurringForm(); setShowRecurringForm(s => !s); }}>+ Add Recurring</button>
          </div>

          {showRecurringForm && (
            <div className="item-form">
              <h3>{editingRecurringId ? 'Edit Recurring Investment' : 'New Recurring Investment'}</h3>
              <form onSubmit={saveRecurringItem}>
                <div className="form-grid">
                  <label className="form-field form-field--wide">
                    <span>Linked Asset</span>
                    <select
                      value={recurringFormData.assetName}
                      onChange={e => setRecurringFormData({...recurringFormData, assetName: e.target.value})}
                      required
                    >
                      <option value="">Select an asset…</option>
                      {assetNames.map(name => <option key={name} value={name}>{name}</option>)}
                      <option value="__custom">+ Custom name…</option>
                    </select>
                  </label>

                  {recurringFormData.assetName === '__custom' && (
                    <label className="form-field form-field--wide">
                      <span>Custom Asset Name</span>
                      <input
                        placeholder="e.g., Bitcoin, Pension Fund"
                        onChange={e => setRecurringFormData({...recurringFormData, assetName: e.target.value})}
                        autoFocus
                      />
                    </label>
                  )}

                  <label className="form-field">
                    <span>Monthly Amount ({currency})</span>
                    <input type="number" step="0.01" placeholder="0.00" value={recurringFormData.amount || ''} onChange={e => setRecurringFormData({...recurringFormData, amount: +e.target.value})} required />
                  </label>

                  <label className="form-field">
                    <span>Day of Month <span className="field-hint">(1–28)</span></span>
                    <input type="number" min="1" max="28" value={recurringFormData.dayOfMonth} onChange={e => setRecurringFormData({...recurringFormData, dayOfMonth: +e.target.value})} required />
                  </label>

                  <label className="form-field form-field--wide">
                    <span>Tags <span className="field-hint">(optional)</span></span>
                    <input placeholder="e.g., Stocks, Retirement" value={recurringFormData.tags} onChange={e => setRecurringFormData({...recurringFormData, tags: e.target.value})} />
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit">💾 {editingRecurringId ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={resetRecurringForm}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="items-list">
            {recurringItems.length === 0 && (
              <div className="empty-state-small">No recurring investments set up yet.</div>
            )}
            {recurringItems.map(item => (
              <div key={item.itemId} className="item-row">
                <div className="item-row-info">
                  <div className="item-row-name">{item.assetName}</div>
                  <div className="item-row-sub">
                    <span className="tag">day {item.dayOfMonth} of month</span>
                    {item.tags && item.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
                <div className="item-row-right">
                  <span className="item-row-value">{currency}{item.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}<span className="item-row-sub-value">/mo</span></span>
                  <div className="item-actions">
                    <button className="btn-icon" onClick={() => { editRecurringItem(item); setShowRecurringForm(true); }} title="Edit">✏️</button>
                    <button className="btn-icon btn-icon--danger" onClick={() => deleteRecurringItem(item.itemId)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
            {recurringItems.length > 0 && (
              <div className="recurring-total">
                Total monthly: <strong>{currency}{recurringItems.reduce((s,r) => s + r.amount, 0).toLocaleString('es-ES', {minimumFractionDigits: 2})}</strong>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <>
          <div className="nw-tab-toolbar">
            <div className="nw-tab-toolbar-left"><h2>Net Worth History</h2></div>
          </div>
          {history.length === 0 ? (
            <div className="nw-empty">
              <p>No history yet. Snapshots are taken automatically each day.</p>
            </div>
          ) : (
            <div className="nw-card">
              <ResponsiveContainer width="100%" height={480}>
                <LineChart data={history} margin={{top:16,right:16,left:0,bottom:8}}>
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                  <XAxis dataKey="date" stroke={themeColors.axis} tick={{fontSize:11}} />
                  <YAxis stroke={themeColors.axis} tick={{fontSize:11}} tickFormatter={v => `${currency}${(v/1000).toFixed(0)}k`} width={60} />
                  <Tooltip contentStyle={{background:themeColors.bg, border:`1px solid ${themeColors.border}`, borderRadius:'8px', color:themeColors.text}} formatter={v => [`${currency}${v.toLocaleString('es-ES',{minimumFractionDigits:2})}`, 'Net Worth']} />
                  <Line type="monotone" dataKey="netWorth" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{r:5, fill:'#6366f1'}} />
                </LineChart>
              </ResponsiveContainer>
              <div className="nw-history-table">
                {[...history].reverse().slice(0,12).map(h => (
                  <div key={h.date} className="nw-history-row">
                    <span className="nw-history-date">{new Date(h.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                    <span className="nw-history-val">{currency}{h.netWorth.toLocaleString('es-ES',{minimumFractionDigits:2})}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
