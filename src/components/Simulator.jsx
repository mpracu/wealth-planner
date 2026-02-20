import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { post as apiPost, get as apiGet, del as apiDel } from 'aws-amplify/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import ReactGA from 'react-ga4';

const getThemeColors = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'dark' 
    ? { bg: '#1a1a1a', border: '#333', text: '#fff', grid: '#333', axis: '#888' }
    : { bg: '#ffffff', border: '#ddd', text: '#1a1a1a', grid: '#ddd', axis: '#666' };
};

export default function Simulator() {
  const [themeColors, setThemeColors] = useState(getThemeColors());
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeColors(getThemeColors());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  
  const [age, setAge] = useState(30);
  const [currentCapital, setCurrentCapital] = useState(50000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [inflation, setInflation] = useState(2.5);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      setIsLoggedIn(true);
      loadScenarios();
    } catch {
      setIsLoggedIn(false);
    }
  };

  const loadScenarios = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await apiGet({ 
        apiName: 'WealthPlannerAPI', 
        path: '/scenarios',
        options: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      const data = await response.body.json();
      setScenarios(data);
    } catch (err) {
      console.error('Error loading scenarios:', err);
    }
  };

  const saveScenario = async () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      console.log('Saving scenario:', { name: scenarioName, token: token ? 'present' : 'missing' });
      
      const response = await apiPost({
        apiName: 'WealthPlannerAPI',
        path: '/scenarios',
        options: {
          body: {
            name: scenarioName,
            data: { age, currentCapital, monthlyInvestment, annualReturn, inflation }
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      
      console.log('Save response:', response);
      setScenarioName('');
      setShowSave(false);
      loadScenarios();
      alert('Scenario saved!');
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      alert('Error saving scenario: ' + (err.response?.body ? JSON.stringify(err.response.body) : err.message));
    }
  };

  const loadScenario = (scenario) => {
    const { age, currentCapital, monthlyInvestment, annualReturn, inflation } = scenario.data;
    setAge(age);
    setCurrentCapital(currentCapital);
    setMonthlyInvestment(monthlyInvestment);
    setAnnualReturn(annualReturn);
    setInflation(inflation);
  };

  const deleteScenario = async (scenarioId) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiDel({ 
        apiName: 'WealthPlannerAPI', 
        path: `/scenarios/${scenarioId}`,
        options: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      loadScenarios();
    } catch (err) {
      console.error('Error deleting scenario:', err);
    }
  };

  const data = useMemo(() => {
    const years = [];
    let capital = currentCapital;
    const monthlyRate = annualReturn / 100 / 12;
    const inflationRate = inflation / 100;
    
    for (let year = 0; year <= 50; year++) {
      const currentAge = age + year;
      const realValue = capital / Math.pow(1 + inflationRate, year);
      
      years.push({
        age: currentAge,
        nominal: Math.round(capital),
        real: Math.round(realValue)
      });
      
      for (let month = 0; month < 12; month++) {
        capital = capital * (1 + monthlyRate) + monthlyInvestment;
      }
    }
    
    return years;
  }, [age, currentCapital, monthlyInvestment, annualReturn, inflation]);

  const millionAge = useMemo(() => {
    const target = data.find(d => d.real >= 1000000);
    return target ? target.age : null;
  }, [data]);

  const trackSliderChange = (sliderName, value) => {
    ReactGA.event({
      category: 'User Input',
      action: `Adjusted ${sliderName}`,
      value: Math.round(value)
    });
  };

  return (
    <div className="simulator">
      {millionAge && (
        <div className="milestone">
          🎯 You'll reach $1M at age <strong>{millionAge}</strong> ({millionAge - age} years from now)
        </div>
      )}
      {!millionAge && (
        <div className="milestone warning">
          ⚠️ Goal not reached within 50 years. Increase investments or returns.
        </div>
      )}

      <div className="controls">
        <div className="control">
          <label>Current Age: <strong>{age}</strong></label>
          <input type="range" min="18" max="65" value={age} onChange={e => { setAge(+e.target.value); trackSliderChange('Age', +e.target.value); }} />
        </div>
        
        <div className="control">
          <label>Current Capital: <strong>${currentCapital.toLocaleString()}</strong></label>
          <input type="range" min="0" max="500000" step="5000" value={currentCapital} onChange={e => { setCurrentCapital(+e.target.value); trackSliderChange('Capital', +e.target.value); }} />
        </div>
        
        <div className="control">
          <label>Monthly Investment: <strong>${monthlyInvestment.toLocaleString()}</strong></label>
          <input type="range" min="0" max="10000" step="100" value={monthlyInvestment} onChange={e => { setMonthlyInvestment(+e.target.value); trackSliderChange('Monthly Investment', +e.target.value); }} />
        </div>
        
        <div className="control">
          <label>Annual Return: <strong>{annualReturn}%</strong></label>
          <input type="range" min="0" max="15" step="0.5" value={annualReturn} onChange={e => { setAnnualReturn(+e.target.value); trackSliderChange('Annual Return', +e.target.value); }} />
        </div>
        
        <div className="control">
          <label>Inflation Rate: <strong>{inflation}%</strong></label>
          <input type="range" min="0" max="10" step="0.5" value={inflation} onChange={e => { setInflation(+e.target.value); trackSliderChange('Inflation', +e.target.value); }} />
        </div>
      </div>

      <div className="chart">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <XAxis dataKey="age" stroke={themeColors.axis} />
            <YAxis stroke={themeColors.axis} tickFormatter={v => v >= 1000000 ? `$${Math.round(v/1000000)}M` : v >= 1000 ? `$${Math.round(v/1000)}k` : `$${v}`} />
            <Tooltip 
              contentStyle={{ background: themeColors.bg, border: `1px solid ${themeColors.border}`, color: themeColors.text }} 
              labelStyle={{ color: themeColors.text }}
              itemStyle={{ color: themeColors.text }}
              formatter={v => `$${v.toLocaleString()}`} 
            />
            <Legend />
            <ReferenceLine y={1000000} stroke="#22c55e" strokeDasharray="3 3" label="$1M" />
            <Line type="monotone" dataKey="nominal" stroke="#3b82f6" name="Nominal Value" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="real" stroke="#22c55e" name="Real Value" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {isLoggedIn && (
        <div className="scenarios-panel">
          <h3>Saved Scenarios</h3>
          <button onClick={() => setShowSave(!showSave)}>💾 Save Current</button>
          {showSave && (
            <div className="save-form">
              <input 
                type="text" 
                placeholder="Scenario name" 
                value={scenarioName}
                onChange={e => setScenarioName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && saveScenario()}
              />
              <button onClick={saveScenario}>Save</button>
            </div>
          )}
          <div className="scenarios-list">
            {scenarios.map(s => (
              <div key={s.scenarioId} className="scenario-item">
                <span onClick={() => loadScenario(s)}>{s.name}</span>
                <button onClick={() => deleteScenario(s.scenarioId)}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
