import { useState, useMemo, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { post as apiPost, get as apiGet, del as apiDel } from 'aws-amplify/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import ReactGA from 'react-ga4';
import { useLanguage } from '../LanguageContext';

const COMPARE_COLORS = ['#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#14b8a6'];

const getThemeColors = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'dark'
    ? { bg: '#161b22', border: '#30363d', text: '#e6edf3', grid: '#21262d', axis: '#8b949e' }
    : { bg: '#ffffff', border: '#e5e7eb', text: '#1f2937', grid: '#f3f4f6', axis: '#6b7280' };
};

const fmt = (v) => {
  if (v >= 1000000) return `€${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `€${Math.round(v / 1000)}k`;
  return `€${v}`;
};

const computeData = (age, capital, monthly, annualReturn, inflation) => {
  const rows = [];
  let c = capital;
  const monthlyRate = annualReturn / 100 / 12;
  const inflRate = inflation / 100;
  for (let y = 0; y <= 50; y++) {
    const real = c / Math.pow(1 + inflRate, y);
    rows.push({ year: y, age: age + y, nominal: Math.round(c), real: Math.round(real) });
    for (let m = 0; m < 12; m++) c = c * (1 + monthlyRate) + monthly;
  }
  return rows;
};

export default function Simulator({ preset }) {
  const { t } = useLanguage();
  const [themeColors, setThemeColors] = useState(getThemeColors());

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeColors(getThemeColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const [age, setAge] = useState(30);
  const [currentCapital, setCurrentCapital] = useState(50000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [annualReturn, setAnnualReturn] = useState(preset?.annualReturn ?? 7);
  const [inflation, setInflation] = useState(2.5);
  const [targetAmount, setTargetAmount] = useState(1000000);

  useEffect(() => {
    if (preset?.annualReturn != null) setAnnualReturn(preset.annualReturn);
  }, [preset]);

  const [drafts, setDrafts] = useState({});
  const [scenarios, setScenarios] = useState([]);
  const [pinnedScenarios, setPinnedScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => { checkAuth(); }, []);

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
        options: { headers: { Authorization: `Bearer ${token}` } },
      }).response;
      setScenarios(await response.body.json());
    } catch (err) {
      console.error('Error loading scenarios:', err);
    }
  };

  const saveScenario = async () => {
    if (!scenarioName.trim()) { alert(t('sim.nameRequired')); return; }
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiPost({
        apiName: 'WealthPlannerAPI',
        path: '/scenarios',
        options: {
          body: { name: scenarioName, data: { age, currentCapital, monthlyInvestment, annualReturn, inflation } },
          headers: { Authorization: `Bearer ${token}` },
        },
      }).response;
      setScenarioName('');
      setShowSave(false);
      loadScenarios();
    } catch (err) {
      console.error('Error saving:', err);
      alert(t('sim.errorSaving') + err.message);
    }
  };

  const loadScenario = (s) => {
    setAge(s.data.age);
    setCurrentCapital(s.data.currentCapital);
    setMonthlyInvestment(s.data.monthlyInvestment);
    setAnnualReturn(s.data.annualReturn);
    setInflation(s.data.inflation);
  };

  const deleteScenario = async (id) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiDel({
        apiName: 'WealthPlannerAPI',
        path: `/scenarios/${id}`,
        options: { headers: { Authorization: `Bearer ${token}` } },
      }).response;
      setPinnedScenarios(prev => prev.filter(p => p.id !== id));
      loadScenarios();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const togglePin = (scenario) => {
    const id = scenario.scenarioId ?? scenario.id;
    setPinnedScenarios(prev => {
      if (prev.find(p => p.id === id)) return prev.filter(p => p.id !== id);
      const color = COMPARE_COLORS[prev.length % COMPARE_COLORS.length];
      const scenData = computeData(
        scenario.data.age, scenario.data.currentCapital,
        scenario.data.monthlyInvestment, scenario.data.annualReturn, scenario.data.inflation
      );
      return [...prev, { id, name: scenario.name, scenData, color }];
    });
  };

  const data = useMemo(() => {
    const base = computeData(age, currentCapital, monthlyInvestment, annualReturn, inflation);
    return base.map((pt, i) => {
      const enriched = { ...pt };
      pinnedScenarios.forEach(ps => { enriched[`cmp_${ps.id}`] = ps.scenData[i]?.real ?? null; });
      return enriched;
    });
  }, [age, currentCapital, monthlyInvestment, annualReturn, inflation, pinnedScenarios]);

  const goalData = useMemo(() => {
    const hit = data.find(d => d.nominal >= targetAmount);
    return hit ? { age: hit.age, year: hit.year } : null;
  }, [data, targetAmount]);

  const projected50 = data[data.length - 1];

  const track = (name, value) =>
    ReactGA.event({ category: 'User Input', action: `Adjusted ${name}`, value: Math.round(value) });

  const controls = [
    { label: t('sim.currentAge'), id: 'age', value: age, set: setAge, min: 18, max: 80, step: 1, suffix: t('sim.yrs') },
    { label: t('sim.startCap'), id: 'currentCapital', value: currentCapital, set: setCurrentCapital, min: 0, max: 500000, step: 1000, prefix: '€', format: true },
    { label: t('sim.monthlyInv'), id: 'monthlyInvestment', value: monthlyInvestment, set: setMonthlyInvestment, min: 0, max: 10000, step: 100, prefix: '€', format: true },
    { label: t('sim.annualReturn'), id: 'annualReturn', value: annualReturn, set: setAnnualReturn, min: 0, max: 15, step: 0.5, suffix: '%' },
    { label: t('sim.inflation'), id: 'inflation', value: inflation, set: setInflation, min: 0, max: 10, step: 0.5, suffix: '%' },
    { label: t('sim.goalAmount'), id: 'targetAmount', value: targetAmount, set: setTargetAmount, min: 10000, max: 5000000, step: 10000, prefix: '€', format: true },
  ];

  const goalBanner = goalData
    ? t('sim.goalReached')
        .replace('{amount}', fmt(targetAmount))
        .replace('{age}', goalData.age)
        .replace('{year}', goalData.year)
    : t('sim.goalMissed');

  return (
    <div className="simulator">

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t('sim.startCap')}</div>
          <div className="stat-value">€{currentCapital.toLocaleString('es-ES')}</div>
        </div>
        <div className={`stat-card ${goalData ? 'stat-card--success' : 'stat-card--warn'}`}>
          <div className="stat-label">{t('sim.goal')}</div>
          <div className="stat-value">{fmt(targetAmount)}</div>
          <div className="stat-sub">
            {goalData ? `${t('sim.ageLabel')} ${goalData.age} · ${goalData.year}y` : t('sim.notReached')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('sim.proj50')}</div>
          <div className="stat-value">{fmt(projected50?.real ?? 0)}</div>
          <div className="stat-sub">{t('sim.inflAdj')} {age + 50}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('sim.monthlyContrib')}</div>
          <div className="stat-value">€{monthlyInvestment.toLocaleString('es-ES')}</div>
          <div className="stat-sub">{annualReturn}{t('sim.expectedRet')}</div>
        </div>
      </div>

      {/* Goal Banner */}
      <div className={`milestone ${goalData ? '' : 'warning'}`}>{goalBanner}</div>

      {/* Controls */}
      <div className="controls">
        <h3 className="section-title">{t('sim.params')}</h3>
        <div className="controls-grid">
          {controls.map(({ label, id, value, set, min, max, step, prefix, suffix, format }) => (
            <div key={id} className="control">
              <div className="control-header">
                <label htmlFor={`input-${id}`}>{label}</label>
                <div className="control-input-wrap">
                  {prefix && <span className="control-affix">{prefix}</span>}
                  {format ? (
                    <input
                      id={`input-${id}`}
                      type="text"
                      inputMode="numeric"
                      className="control-number"
                      value={drafts[id] !== undefined ? drafts[id] : value.toLocaleString('es-ES')}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setDrafts(d => ({ ...d, [id]: e.target.value.replace(/[^0-9.,]/g, '') }));
                        const num = parseInt(raw, 10);
                        if (!isNaN(num)) set(num);
                      }}
                      onBlur={() => {
                        const v = Math.min(max, Math.max(min, value));
                        set(v);
                        setDrafts(d => { const nd = { ...d }; delete nd[id]; return nd; });
                        track(label, v);
                      }}
                    />
                  ) : (
                    <input
                      id={`input-${id}`}
                      type="number"
                      className="control-number"
                      value={value}
                      min={min}
                      max={max}
                      step={step}
                      onChange={e => {
                        if (!isNaN(e.target.valueAsNumber)) set(e.target.valueAsNumber);
                      }}
                      onBlur={e => {
                        const v = Math.min(max, Math.max(min, isNaN(e.target.valueAsNumber) ? min : e.target.valueAsNumber));
                        set(v);
                        track(label, v);
                      }}
                    />
                  )}
                  {suffix && <span className="control-affix">{suffix}</span>}
                </div>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => { set(+e.target.value); track(label, +e.target.value); }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="chart">
        <div className="chart-header">
          <h3 className="section-title">{t('sim.projection')}</h3>
          {pinnedScenarios.length > 0 && (
            <div className="compare-badges">
              {pinnedScenarios.map(ps => (
                <span key={ps.id} className="compare-badge" style={{ borderColor: ps.color, color: ps.color }}>
                  {ps.name}
                  <button className="badge-remove" onClick={() => togglePin({ scenarioId: ps.id, data: ps.scenData[0] })}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <XAxis
              dataKey="age"
              stroke={themeColors.axis}
              tick={{ fill: themeColors.axis, fontSize: 12 }}
              label={{ value: t('sim.age'), position: 'insideBottomRight', offset: -10, fill: themeColors.axis, fontSize: 12 }}
            />
            <YAxis
              stroke={themeColors.axis}
              tick={{ fill: themeColors.axis, fontSize: 12 }}
              tickFormatter={fmt}
              width={72}
            />
            <Tooltip
              contentStyle={{
                background: themeColors.bg,
                border: `1px solid ${themeColors.border}`,
                borderRadius: '8px',
                color: themeColors.text,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
              labelStyle={{ color: themeColors.text, fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: themeColors.text }}
              labelFormatter={v => `${t('sim.ageLabel')} ${v}`}
              formatter={(v, name) => [`€${Number(v).toLocaleString('es-ES')}`, name]}
            />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
            <ReferenceLine
              y={targetAmount}
              stroke="#22c55e"
              strokeDasharray="4 4"
              label={{ value: fmt(targetAmount), fill: '#22c55e', fontSize: 11, position: 'right' }}
            />
            <Line type="monotone" dataKey="nominal" stroke="#3b82f6" name={t('sim.nominal')} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="real" stroke="#22c55e" name={t('sim.real')} strokeWidth={2} dot={false} />
            {pinnedScenarios.map(ps => (
              <Line
                key={ps.id}
                type="monotone"
                dataKey={`cmp_${ps.id}`}
                stroke={ps.color}
                name={`${ps.name} (real)`}
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 3"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scenarios Panel */}
      {isLoggedIn && (
        <div className="scenarios-panel">
          <div className="scenarios-header">
            <h3 className="section-title">{t('sim.savedScenarios')}</h3>
            <button className="btn btn--secondary" onClick={() => setShowSave(s => !s)}>
              {showSave ? t('sim.cancel') : t('sim.saveCurrent')}
            </button>
          </div>

          {showSave && (
            <div className="save-form">
              <input
                type="text"
                placeholder={t('sim.nameScenario')}
                value={scenarioName}
                onChange={e => setScenarioName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveScenario()}
                autoFocus
              />
              <button className="btn btn--primary" onClick={saveScenario}>{t('sim.save')}</button>
            </div>
          )}

          <div className="scenarios-list">
            {scenarios.length === 0 && (
              <p className="scenarios-empty">{t('sim.noScenarios')}</p>
            )}
            {scenarios.map(s => {
              const pinned = pinnedScenarios.find(p => p.id === s.scenarioId);
              return (
                <div key={s.scenarioId} className="scenario-item">
                  <div className="scenario-info">
                    <span className="scenario-name">{s.name}</span>
                    <span className="scenario-meta">
                      {t('sim.ageLabel')} {s.data.age} · €{s.data.monthlyInvestment.toLocaleString('es-ES')}{t('sim.perMonth')} · {s.data.annualReturn}{t('sim.return')}
                    </span>
                  </div>
                  <div className="scenario-actions">
                    <button
                      className={`btn btn--compare ${pinned ? 'active' : ''}`}
                      style={pinned ? { borderColor: pinned.color, color: pinned.color, background: `${pinned.color}15` } : {}}
                      onClick={() => togglePin(s)}
                    >
                      {pinned ? t('sim.comparing') : t('sim.compare')}
                    </button>
                    <button className="btn btn--ghost" onClick={() => loadScenario(s)}>{t('sim.load')}</button>
                    <button className="btn btn--danger" onClick={() => deleteScenario(s.scenarioId)}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
