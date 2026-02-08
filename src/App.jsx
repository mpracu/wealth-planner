import { useState, useMemo, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import ReactGA from 'react-ga4'
import './App.css'

function App() {
  const [age, setAge] = useState(30)
  const [currentCapital, setCurrentCapital] = useState(50000)
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000)
  const [annualReturn, setAnnualReturn] = useState(7)
  const [inflation, setInflation] = useState(2.5)

  // Track page view on mount
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname })
  }, [])

  const data = useMemo(() => {
    const years = []
    let capital = currentCapital
    const monthlyRate = annualReturn / 100 / 12
    const inflationRate = inflation / 100
    
    for (let year = 0; year <= 50; year++) {
      const currentAge = age + year
      const realValue = capital / Math.pow(1 + inflationRate, year)
      
      years.push({
        age: currentAge,
        nominal: Math.round(capital),
        real: Math.round(realValue)
      })
      
      for (let month = 0; month < 12; month++) {
        capital = capital * (1 + monthlyRate) + monthlyInvestment
      }
    }
    
    return years
  }, [age, currentCapital, monthlyInvestment, annualReturn, inflation])

  const millionAge = useMemo(() => {
    const inflationRate = inflation / 100
    const target = data.find(d => d.real >= 1000000)
    return target ? target.age : null
  }, [data, inflation])

  // Track when user reaches $1M milestone
  useEffect(() => {
    if (millionAge) {
      ReactGA.event({
        category: 'Calculation',
        action: 'Million Dollar Goal',
        label: `Age ${millionAge}`,
        value: millionAge - age
      })
    }
  }, [millionAge, age])

  // Track slider interactions
  const trackSliderChange = (sliderName, value) => {
    ReactGA.event({
      category: 'User Input',
      action: `Adjusted ${sliderName}`,
      value: Math.round(value)
    })
  }

  return (
    <div className="app">
      <div className="container">
        <h1>💰 Wealth Planner</h1>
        <p className="subtitle">When will you reach $1M in today's dollars?</p>
        
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
            <input 
              type="range" 
              min="18" 
              max="65" 
              value={age} 
              onChange={e => {
                const newValue = +e.target.value
                setAge(newValue)
                trackSliderChange('Age', newValue)
              }} 
            />
          </div>
          
          <div className="control">
            <label>Current Capital: <strong>${currentCapital.toLocaleString()}</strong></label>
            <input 
              type="range" 
              min="0" 
              max="500000" 
              step="5000" 
              value={currentCapital} 
              onChange={e => {
                const newValue = +e.target.value
                setCurrentCapital(newValue)
                trackSliderChange('Capital', newValue)
              }} 
            />
          </div>
          
          <div className="control">
            <label>Monthly Investment: <strong>${monthlyInvestment.toLocaleString()}</strong></label>
            <input 
              type="range" 
              min="0" 
              max="10000" 
              step="100" 
              value={monthlyInvestment} 
              onChange={e => {
                const newValue = +e.target.value
                setMonthlyInvestment(newValue)
                trackSliderChange('Monthly Investment', newValue)
              }} 
            />
          </div>
          
          <div className="control">
            <label>Annual Return: <strong>{annualReturn}%</strong></label>
            <input 
              type="range" 
              min="0" 
              max="15" 
              step="0.5" 
              value={annualReturn} 
              onChange={e => {
                const newValue = +e.target.value
                setAnnualReturn(newValue)
                trackSliderChange('Annual Return', newValue)
              }} 
            />
          </div>
          
          <div className="control">
            <label>Inflation Rate: <strong>{inflation}%</strong></label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.5" 
              value={inflation} 
              onChange={e => {
                const newValue = +e.target.value
                setInflation(newValue)
                trackSliderChange('Inflation', newValue)
              }} 
            />
          </div>
        </div>

        <div className="chart">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="age" stroke="#888" />
              <YAxis 
                stroke="#888" 
                tickFormatter={v => {
                  if (v >= 1000000) return `$${Math.round(v/1000000)}M`
                  if (v >= 1000) return `$${Math.round(v/1000)}k`
                  return `$${v}`
                }} 
              />
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                formatter={v => `$${v.toLocaleString()}`}
              />
              <Legend />
              <ReferenceLine y={1000000} stroke="#22c55e" strokeDasharray="3 3" label="$1M" />
              <Line type="monotone" dataKey="nominal" stroke="#3b82f6" name="Nominal Value" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="real" stroke="#22c55e" name="Real Value (Inflation-Adjusted)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default App
