import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { post, get, del } from 'aws-amplify/api';
import './Portfolio.css';

function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fundName: '',
    isin: '',
    shares: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [currency, setCurrency] = useState('€');

  useEffect(() => {
    loadHoldings();
  }, []);

  const loadHoldings = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await get({
        apiName: 'WealthPlannerAPI',
        path: '/portfolio',
        options: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }).response;
      const data = await response.body.json();
      setHoldings(data);
    } catch (error) {
      console.error('Error loading holdings:', error);
    }
  };

  const addHolding = async (e) => {
    e.preventDefault();
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await post({
        apiName: 'WealthPlannerAPI',
        path: '/portfolio',
        options: {
          body: {
            ...formData,
            shares: parseFloat(formData.shares),
            purchasePrice: parseFloat(formData.purchasePrice)
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      }).response;
      setFormData({
        fundName: '',
        isin: '',
        shares: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      loadHoldings();
    } catch (error) {
      console.error('Error adding holding:', error);
      alert('Error adding holding');
    }
  };

  const deleteHolding = async (holdingId) => {
    if (!confirm('Delete this holding?')) return;
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await del({
        apiName: 'WealthPlannerAPI',
        path: `/portfolio/${holdingId}`,
        options: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }).response;
      loadHoldings();
    } catch (error) {
      console.error('Error deleting holding:', error);
    }
  };

  const calculateMetrics = () => {
    const totalInvested = holdings.reduce((sum, h) => sum + (h.shares * h.purchasePrice), 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.shares * (h.currentPrice || h.purchasePrice)), 0);
    const totalGain = currentValue - totalInvested;
    const totalReturn = totalInvested > 0 ? ((totalGain / totalInvested) * 100) : 0;

    return { totalInvested, currentValue, totalGain, totalReturn };
  };

  const metrics = calculateMetrics();

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>📈 Index Fund Portfolio</h1>
        <div className="header-actions">
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="currency-select">
            <option value="€">€ EUR</option>
            <option value="$">$ USD</option>
            <option value="£">£ GBP</option>
          </select>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Holding'}
          </button>
        </div>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Invested</h3>
          <p>{currency}{metrics.totalInvested.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
        </div>
        <div className="summary-card">
          <h3>Current Value</h3>
          <p>{currency}{metrics.currentValue.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
        </div>
        <div className="summary-card highlight">
          <h3>Total Gain/Loss</h3>
          <p className={metrics.totalGain >= 0 ? 'positive' : 'negative'}>
            {currency}{metrics.totalGain.toLocaleString('es-ES', {minimumFractionDigits: 2})}
          </p>
        </div>
        <div className="summary-card">
          <h3>Return</h3>
          <p className={metrics.totalReturn >= 0 ? 'positive' : 'negative'}>
            {metrics.totalReturn.toFixed(2)}%
          </p>
        </div>
      </div>

      {showForm && (
        <div className="holding-form">
          <h3>Add New Holding</h3>
          <form onSubmit={addHolding}>
            <label>
              <span>Fund Name *</span>
              <input
                type="text"
                value={formData.fundName}
                onChange={e => setFormData({...formData, fundName: e.target.value})}
                placeholder="e.g., Vanguard Global Stock Index"
                required
              />
            </label>
            <label>
              <span>ISIN *</span>
              <input
                type="text"
                value={formData.isin}
                onChange={e => setFormData({...formData, isin: e.target.value.toUpperCase()})}
                placeholder="e.g., IE00B3RBWM25"
                pattern="[A-Z]{2}[A-Z0-9]{10}"
                required
              />
            </label>
            <label>
              <span>Shares/Units *</span>
              <input
                type="number"
                step="0.001"
                value={formData.shares}
                onChange={e => setFormData({...formData, shares: e.target.value})}
                placeholder="e.g., 10.5"
                required
              />
            </label>
            <label>
              <span>Purchase Price ({currency}) *</span>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={e => setFormData({...formData, purchasePrice: e.target.value})}
                placeholder="e.g., 85.50"
                required
              />
            </label>
            <label>
              <span>Purchase Date *</span>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                required
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Add Holding</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="holdings-table">
        <h3>Holdings</h3>
        {holdings.length === 0 ? (
          <p className="empty-state">No holdings yet. Add your first index fund!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fund Name</th>
                <th>ISIN</th>
                <th>Shares</th>
                <th>Purchase Price</th>
                <th>Current Price</th>
                <th>Total Value</th>
                <th>Gain/Loss</th>
                <th>Return %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(holding => {
                const currentPrice = holding.currentPrice || holding.purchasePrice;
                const totalValue = holding.shares * currentPrice;
                const invested = holding.shares * holding.purchasePrice;
                const gain = totalValue - invested;
                const returnPct = (gain / invested) * 100;

                return (
                  <tr key={holding.holdingId}>
                    <td><strong>{holding.fundName}</strong></td>
                    <td className="isin">{holding.isin}</td>
                    <td>{holding.shares.toFixed(3)}</td>
                    <td>{currency}{holding.purchasePrice.toFixed(2)}</td>
                    <td>{currency}{currentPrice.toFixed(2)}</td>
                    <td>{currency}{totalValue.toLocaleString('es-ES', {minimumFractionDigits: 2})}</td>
                    <td className={gain >= 0 ? 'positive' : 'negative'}>
                      {currency}{gain.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                    </td>
                    <td className={returnPct >= 0 ? 'positive' : 'negative'}>
                      {returnPct.toFixed(2)}%
                    </td>
                    <td>
                      <button onClick={() => deleteHolding(holding.holdingId)} className="btn-delete">🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Portfolio;
