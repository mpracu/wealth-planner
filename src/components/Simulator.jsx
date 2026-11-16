import { useState, useMemo, useEffect } from 'react';
import { Trash2, Link } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { post as apiPost, get as apiGet, del as apiDel } from 'aws-amplify/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import ReactGA from '../reactGA.js';
import { useLanguage } from '../LanguageContext';
import { useFormat } from '../lib/format';
import { pathFor } from '../routes.js';
import ParamControls from './ParamControls';

const COMPARE_COLORS = ['#e0a019', '#d4614b', '#5bb8a4', '#8a93c9', '#b9a36a'];

const getThemeColors = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'dark'
    ? { bg: '#121a24', border: '#26313f', text: '#e8edf3', grid: '#1b2430', axis: '#8693a4', accent: '#7d8cff', green: '#34c79c' }
    : { bg: '#ffffff', border: '#dde3ea', text: '#14202e', grid: '#eef1f5', axis: '#5d6b7c', accent: '#3d4fd6', green: '#0f9f7a' };
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

export default function Simulator({ preset, portfolio }) {
  const { t } = useLanguage();
  const f = useFormat();
  const fmt = f.compact;
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
  const [copied, setCopied] = useState(false);

  // Load params from shared URL on first mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (!p.has('sim')) return;
    if (p.get('a')) setAge(+p.get('a'));
    if (p.get('c')) setCurrentCapital(+p.get('c'));
    if (p.get('m')) setMonthlyInvestment(+p.get('m'));
    if (p.get('r')) setAnnualReturn(+p.get('r'));
    if (p.get('i')) setInflation(+p.get('i'));
    if (p.get('g')) setTargetAmount(+p.get('g'));
  }, []);

  useEffect(() => {
    if (preset?.annualReturn != null) setAnnualReturn(preset.annualReturn);
  }, [preset]);

  // Signed-in users start from their tracked net worth and recurring
  // contribution instead of the generic example, unless they opened a shared
  // link. A note says so and offers the way back.
  const [usingPortfolio, setUsingPortfolio] = useState(false);
  const [portfolioDismissed, setPortfolioDismissed] = useState(
    () => new URLSearchParams(window.location.search).has('sim')
  );
  useEffect(() => {
    if (!portfolio || portfolioDismissed || usingPortfolio) return;
    if (!(portfolio.netWorth > 0)) return;
    setCurrentCapital(Math.round(portfolio.netWorth));
    if (portfolio.monthlyContribution > 0) setMonthlyInvestment(Math.round(portfolio.monthlyContribution));
    setUsingPortfolio(true);
  }, [portfolio, portfolioDismissed, usingPortfolio]);

  const backToExample = () => {
    setPortfolioDismissed(true);
    setUsingPortfolio(false);
    setCurrentCapital(50000);
    setMonthlyInvestment(1000);
  };

  const getShareUrl = () => {
    const p = new URLSearchParams({
      sim: '1', a: age, c: currentCapital, m: monthlyInvestment,
      r: annualReturn, i: inflation, g: targetAmount,
    });
    return `${window.location.origin}${pathFor('simulator')}?${p}`;
  };

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
    const hit = data.find(d => d.real >= targetAmount);
    return hit ? { age: hit.age, year: hit.year } : null;
  }, [data, targetAmount]);

  const projected50 = data[data.length - 1];

  const track = (name, value) =>
    ReactGA.event({ category: 'User Input', action: `Adjusted ${name}`, value: Math.round(value) });

  const controls = [
    { label: t('sim.currentAge'), id: 'age', value: age, set: setAge, min: 0, max: 100, step: 1, suffix: t('sim.yrs') },
    { label: t('sim.startCap'), id: 'currentCapital', value: currentCapital, set: setCurrentCapital, min: 0, max: 500000, step: 1000, suffix: '€', open: true },
    { label: t('sim.monthlyInv'), id: 'monthlyInvestment', value: monthlyInvestment, set: setMonthlyInvestment, min: 0, max: 10000, step: 100, suffix: '€', open: true },
    { label: t('sim.annualReturn'), id: 'annualReturn', value: annualReturn, set: setAnnualReturn, min: 0, max: 15, step: 0.5, suffix: '%' },
    { label: t('sim.inflation'), id: 'inflation', value: inflation, set: setInflation, min: 0, max: 10, step: 0.5, suffix: '%' },
    { label: t('sim.goalAmount'), id: 'targetAmount', value: targetAmount, set: setTargetAmount, min: 0, max: 5000000, step: 10000, suffix: '€', open: true },
  ];

  const goalBanner = goalData
    ? t('sim.goalReached')
        .replace('{amount}', fmt(targetAmount))
        .replace('{age}', goalData.age)
        .replace('{year}', goalData.year)
    : t('sim.goalMissed');

  // Scale the chart to the inflation-adjusted path and the goal, which are
  // what matter for planning. The nominal line may run off the top.
  const yAxisMax = useMemo(() => {
    const peak = Math.max(
      targetAmount,
      ...data.map(d => d.real),
      ...pinnedScenarios.map(ps => Math.max(...ps.scenData.map(r => r.real))),
    );
    // Four evenly spaced, round ticks (1, 2, 2.5 or 5 times a power of ten).
    const raw = (peak * 1.1) / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
    const nice = [1, 2, 2.5, 5, 10].find(n => n * mag >= raw) * mag;
    return nice * 4;
  }, [data, targetAmount, pinnedScenarios]);
  const yTicks = [0, 1, 2, 3, 4].map(i => (yAxisMax / 4) * i);

  return (
    <div className="simulator">

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t('sim.startCap')}</div>
          <div className="stat-value">{f.money(currentCapital)}</div>
        </div>
        <div className={`stat-card ${goalData ? 'stat-card--success' : 'stat-card--warn'}`}>
          <div className="stat-label">{t('sim.goal')}</div>
          <div className="stat-value">{fmt(targetAmount)}</div>
          <div className="stat-sub">
            {goalData ? t('sim.goalAtAge').replace('{age}', goalData.age).replace('{years}', goalData.year) : t('sim.notReached')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('sim.proj50')}</div>
          <div className="stat-value">{fmt(projected50?.real ?? 0)}</div>
          <div className="stat-sub">{t('sim.inflAdj')} {age + 50}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('sim.monthlyContrib')}</div>
          <div className="stat-value">{f.money(monthlyInvestment)}</div>
          <div className="stat-sub">{t('sim.expectedRet').replace('{pct}', f.percent(annualReturn, Number.isInteger(annualReturn) ? 0 : 1))}</div>
        </div>
      </div>

      {/* Goal Banner */}
      <div className={`milestone ${goalData ? '' : 'warning'}`}>{goalBanner}</div>

      {/* Controls */}
      <div className="controls">
        <div className="controls-title-row">
          <h3 className="section-title">{t('sim.params')}</h3>
          <div className="sim-share-btns">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(t('sim.shareText').replace('{capital}', f.money(currentCapital)).replace('{monthly}', f.money(monthlyInvestment)).replace('{return}', f.percent(annualReturn, Number.isInteger(annualReturn) ? 0 : 1)) + '\n' + getShareUrl())}`}
              target="_blank" rel="noopener noreferrer"
              className="share-btn share-btn--whatsapp share-btn--sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <button className={`share-btn share-btn--copy share-btn--sm${copied ? ' copied' : ''}`} onClick={copyShareLink}>
              <Link size={13} />
              {copied ? t('blog.copied') : t('blog.copyLink')}
            </button>
          </div>
        </div>
        {usingPortfolio && (
          <p className="portfolio-note">
            {t('sim.fromPortfolio')}
            <button type="button" className="link-btn" onClick={backToExample}>{t('sim.useExample')}</button>
          </p>
        )}
        <ParamControls controls={controls} idPrefix="input" onCommit={track} />
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
          <LineChart data={data} margin={{ top: 16, right: 24, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <XAxis
              dataKey="age"
              stroke={themeColors.axis}
              tick={{ fill: themeColors.axis, fontSize: 12 }}
              label={{ value: t('sim.age'), position: 'insideBottomRight', offset: -10, fill: themeColors.axis, fontSize: 12 }}
            />
            <YAxis
              domain={[0, yAxisMax]}
              ticks={yTicks}
              allowDataOverflow
              stroke={themeColors.axis}
              tick={{ fill: themeColors.axis, fontSize: 12 }}
              tickFormatter={fmt}
              width={84}
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
              formatter={(v, name) => [f.money(v), name]}
            />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
            <ReferenceLine
              y={targetAmount}
              stroke={themeColors.green}
              strokeDasharray="4 4"
              label={{ value: `${t('sim.goalAmount')} ${fmt(targetAmount)}`, fill: themeColors.green, fontSize: 12, fontWeight: 600, position: 'insideBottomLeft' }}
            />
            {/* The inflation-adjusted line is the one to plan with, so it leads;
                the nominal line stays as quiet context. */}
            <Line type="monotone" dataKey="nominal" stroke={themeColors.axis} name={t('sim.nominal')} strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
            <Line type="monotone" dataKey="real" stroke={themeColors.accent} name={t('sim.real')} strokeWidth={3} dot={false} />
            {goalData && (
              <ReferenceDot
                x={goalData.age}
                y={data[goalData.year].real}
                r={6}
                fill={themeColors.green}
                stroke={themeColors.bg}
                strokeWidth={2}
                label={{ value: `${t('sim.ageLabel')} ${goalData.age}`, fill: themeColors.text, fontSize: 12, fontWeight: 600, position: 'top', offset: 10 }}
              />
            )}
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
                      {t('sim.ageLabel')} {s.data.age}, {f.money(s.data.monthlyInvestment)}{t('sim.perMonth')}, {f.percent(s.data.annualReturn, Number.isInteger(s.data.annualReturn) ? 0 : 1)} {t('sim.return')}
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
