import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import ReactGA from '../reactGA.js';
import { useLanguage } from '../LanguageContext';
import { useFormat } from '../lib/format';
import ParamControls from './ParamControls';
import './CoastFire.css';

const getThemeColors = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'dark'
    ? { bg: '#121a24', border: '#26313f', text: '#e8edf3', grid: '#1b2430', axis: '#8693a4', accent: '#7d8cff', green: '#34c79c' }
    : { bg: '#ffffff', border: '#dde3ea', text: '#14202e', grid: '#eef1f5', axis: '#5d6b7c', accent: '#3d4fd6', green: '#0f9f7a' };
};

const computeReal = (capital, monthly, annualReturn, inflation, years) => {
  const rows = [];
  let c = capital;
  const monthlyRate = annualReturn / 100 / 12;
  const inflRate = inflation / 100;
  for (let y = 0; y <= years; y++) {
    rows.push({ year: y, real: c / Math.pow(1 + inflRate, y) });
    for (let m = 0; m < 12; m++) c = c * (1 + monthlyRate) + monthly;
  }
  return rows;
};

export default function CoastFire({ portfolio }) {
  const { t } = useLanguage();
  const f = useFormat();
  const fmt = f.compact;
  const [themeColors, setThemeColors] = useState(getThemeColors());

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeColors(getThemeColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentCapital, setCurrentCapital] = useState(30000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [inflation, setInflation] = useState(2.5);
  const [annualExpenses, setAnnualExpenses] = useState(24000);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  // Same idea as the simulator: start from the signed-in user's real numbers.
  const [usingPortfolio, setUsingPortfolio] = useState(false);
  const [portfolioDismissed, setPortfolioDismissed] = useState(false);
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
    setCurrentCapital(30000);
    setMonthlyInvestment(500);
  };

  const track = (name, value) =>
    ReactGA.event({ category: 'User Input', action: `Adjusted ${name}`, value: Math.round(value) });

  const {
    fireNumber, coastNumberToday, alreadyCoasting, coastAge, coastYears,
    yearsToRetirement, chartData, progressPct,
  } = useMemo(() => {
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const realReturn = (1 + annualReturn / 100) / (1 + inflation / 100) - 1;
    const fireNumber = annualExpenses / (withdrawalRate / 100);
    const requiredAt = (age) => age >= retirementAge
      ? fireNumber
      : fireNumber / Math.pow(1 + realReturn, retirementAge - age);

    const chartYears = Math.min(50, Math.max(yearsToRetirement + 10, 10));
    const trajectory = computeReal(currentCapital, monthlyInvestment, annualReturn, inflation, chartYears);

    const chartData = trajectory.map(row => ({
      age: currentAge + row.year,
      real: Math.round(row.real),
      required: Math.round(requiredAt(currentAge + row.year)),
    }));

    let coastAge = null;
    let coastYears = null;
    for (let y = 0; y <= yearsToRetirement; y++) {
      if (chartData[y].real >= chartData[y].required) {
        coastAge = currentAge + y;
        coastYears = y;
        break;
      }
    }

    const coastNumberToday = requiredAt(currentAge);
    const alreadyCoasting = coastAge === currentAge;
    const progressPct = coastNumberToday > 0
      ? Math.min(100, Math.round((currentCapital / coastNumberToday) * 100))
      : 100;

    return { fireNumber, coastNumberToday, alreadyCoasting, coastAge, coastYears, yearsToRetirement, chartData, progressPct };
  }, [currentAge, retirementAge, currentCapital, monthlyInvestment, annualReturn, inflation, annualExpenses, withdrawalRate]);

  const banner = yearsToRetirement <= 0
    ? t('coast.bannerRetired').replace('{capital}', fmt(currentCapital)).replace('{fire}', fmt(fireNumber))
    : alreadyCoasting
      ? t('coast.bannerAlready').replace('{fire}', fmt(fireNumber)).replace('{age}', retirementAge)
      : coastAge != null
        ? t('coast.bannerFuture')
            .replace('{coastAge}', coastAge)
            .replace('{years}', coastYears)
            .replace('{fire}', fmt(fireNumber))
            .replace('{age}', retirementAge)
        : t('coast.bannerNever').replace('{age}', retirementAge);

  const bannerOk = yearsToRetirement > 0 && (alreadyCoasting || coastAge != null);

  const controls = [
    { label: t('sim.currentAge'), id: 'currentAge', value: currentAge, set: setCurrentAge, min: 16, max: 75, step: 1, suffix: t('sim.yrs') },
    { label: t('coast.retirementAge'), id: 'retirementAge', value: retirementAge, set: setRetirementAge, min: 30, max: 90, step: 1, suffix: t('sim.yrs') },
    { label: t('coast.currentCapital'), id: 'currentCapital', value: currentCapital, set: setCurrentCapital, min: 0, max: 1000000, step: 1000, suffix: '€', open: true },
    { label: t('sim.monthlyInv'), id: 'monthlyInvestment', value: monthlyInvestment, set: setMonthlyInvestment, min: 0, max: 10000, step: 50, suffix: '€', open: true },
    { label: t('sim.annualReturn'), id: 'annualReturn', value: annualReturn, set: setAnnualReturn, min: 0, max: 15, step: 0.5, suffix: '%' },
    { label: t('sim.inflation'), id: 'inflation', value: inflation, set: setInflation, min: 0, max: 10, step: 0.5, suffix: '%' },
    { label: t('coast.annualExpenses'), id: 'annualExpenses', value: annualExpenses, set: setAnnualExpenses, min: 0, max: 200000, step: 1000, suffix: '€', open: true },
    { label: t('coast.withdrawalRate'), id: 'withdrawalRate', value: withdrawalRate, set: setWithdrawalRate, min: 2, max: 6, step: 0.1, suffix: '%' },
  ];

  return (
    <div className="simulator coastfire">

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t('coast.fireNumber')}</div>
          <div className="stat-value">{fmt(fireNumber)}</div>
          <div className="stat-sub">{t('coast.fireNumberSub')}</div>
        </div>
        <div className={`stat-card ${progressPct >= 100 ? 'stat-card--success' : 'stat-card--warn'}`}>
          <div className="stat-label">{t('coast.neededToday')}</div>
          <div className="stat-value">{fmt(coastNumberToday)}</div>
          <div className="stat-sub">
            {t('coast.progressPct').replace('{pct}%', f.percent(progressPct, 0))}
          </div>
          <div className="coast-progress-track">
            <div className="coast-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('coast.currentCapital')}</div>
          <div className="stat-value">{f.money(currentCapital)}</div>
        </div>
        <div className={`stat-card ${bannerOk ? 'stat-card--success' : 'stat-card--warn'}`}>
          <div className="stat-label">{t('coast.coastAge')}</div>
          <div className="stat-value">
            {yearsToRetirement <= 0
              ? '—'
              : alreadyCoasting
                ? t('coast.alreadyCoasting')
                : coastAge != null
                  ? coastAge
                  : t('coast.notReachedShort')}
          </div>
          {yearsToRetirement > 0 && !alreadyCoasting && coastAge != null && (
            <div className="stat-sub">{t('coast.yearsFromNow').replace('{years}', coastYears)}</div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className={`milestone ${bannerOk || yearsToRetirement <= 0 ? '' : 'warning'}`}>{banner}</div>

      {/* Controls */}
      <div className="controls">
        <div className="controls-title-row">
          <h3 className="section-title">{t('coast.params')}</h3>
        </div>
        {usingPortfolio && (
          <p className="portfolio-note">
            {t('sim.fromPortfolio')}
            <button type="button" className="link-btn" onClick={backToExample}>{t('sim.useExample')}</button>
          </p>
        )}
        <ParamControls controls={controls} idPrefix="coast-input" onCommit={track} />
      </div>

      {/* Chart */}
      <div className="chart">
        <div className="chart-header">
          <h3 className="section-title">{t('coast.chartTitle')}</h3>
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={chartData} margin={{ top: 24, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <XAxis
              dataKey="age"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={chartData.filter(d => d.age % 5 === 0).map(d => d.age)}
              stroke={themeColors.axis}
              tick={{ fill: themeColors.axis, fontSize: 12 }}
              label={{ value: t('sim.age'), position: 'insideBottomRight', offset: -10, fill: themeColors.axis, fontSize: 12 }}
            />
            <YAxis
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
              y={fireNumber}
              stroke={themeColors.green}
              strokeDasharray="4 4"
              label={{ value: fmt(fireNumber), fill: themeColors.green, fontSize: 11, position: 'insideBottomRight' }}
            />
            <ReferenceLine
              x={retirementAge}
              stroke={themeColors.axis}
              strokeDasharray="4 4"
              label={{ value: t('coast.retirementLine'), fill: themeColors.axis, fontSize: 11, position: 'insideTopLeft' }}
            />
            {coastAge != null && coastAge !== retirementAge && (
              <ReferenceLine
                x={coastAge}
                stroke={themeColors.accent}
                strokeDasharray="4 4"
                label={{ value: t('coast.coastLine'), fill: themeColors.accent, fontSize: 11, position: 'insideTopRight' }}
              />
            )}
            <Line type="monotone" dataKey="real" stroke={themeColors.accent} name={t('coast.yourPath')} strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="required" stroke="#e0a019" name={t('coast.required')} strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explainer */}
      <div className="controls coast-explainer">
        <h3 className="section-title">{t('coast.explainerTitle')}</h3>
        <p>{t('coast.explainerBody1')}</p>
        <p>{t('coast.explainerBody2')}</p>
        <dl className="coast-glossary">
          <dt>FIRE</dt>
          <dd>{t('coast.glossaryFire')}</dd>
          <dt>Coast FIRE</dt>
          <dd>{t('coast.glossaryCoast')}</dd>
          <dt>SWR</dt>
          <dd>{t('coast.glossarySwr')}</dd>
        </dl>
      </div>
    </div>
  );
}
