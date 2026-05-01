import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import './RiskProfile.css';

const QUESTIONS = {
  es: [
    {
      id: 1,
      text: '¿Cuánto tiempo planeas mantener tus inversiones antes de necesitar el dinero?',
      options: [
        { label: 'Menos de 2 años', score: 1 },
        { label: 'De 2 a 5 años', score: 2 },
        { label: 'De 5 a 10 años', score: 3 },
        { label: 'Más de 10 años', score: 4 },
      ],
    },
    {
      id: 2,
      text: 'Tu cartera cae un 25% en una crisis de mercado. ¿Qué haces?',
      options: [
        { label: 'Lo vendo todo. No puedo aguantar el estrés', score: 1 },
        { label: 'Vendo parte para reducir el riesgo', score: 2 },
        { label: 'Me mantengo firme y espero la recuperación', score: 3 },
        { label: 'Compro más. Es una oportunidad de compra', score: 4 },
      ],
    },
    {
      id: 3,
      text: '¿Cuál es tu objetivo principal de inversión?',
      options: [
        { label: 'Proteger mis ahorros de perder valor', score: 1 },
        { label: 'Crecer de forma constante con un riesgo moderado', score: 2 },
        { label: 'Crecer significativamente a largo plazo', score: 3 },
        { label: 'Maximizar rentabilidad. Acepto alta volatilidad', score: 4 },
      ],
    },
    {
      id: 4,
      text: '¿Cómo describirías tu experiencia inversora?',
      options: [
        { label: 'Ninguna. Estoy empezando', score: 1 },
        { label: 'Básica. Tengo una cuenta de ahorro o plan de pensiones', score: 2 },
        { label: 'Intermedia. Tengo algunos fondos o ETFs', score: 3 },
        { label: 'Avanzada. Gestiono activamente una cartera diversificada', score: 4 },
      ],
    },
    {
      id: 5,
      text: '¿Qué parte de tus ahorros totales planeas invertir?',
      options: [
        { label: 'Menos del 10%. Necesito la mayoría accesible', score: 1 },
        { label: '10–30%', score: 2 },
        { label: '30–60%', score: 3 },
        { label: 'Más del 60%. Tengo un fondo de emergencia sólido', score: 4 },
      ],
    },
    {
      id: 6,
      text: '¿Qué estabilidad tiene tu ingreso en los próximos años?',
      options: [
        { label: 'Muy incierta. Autónomo o irregular', score: 1 },
        { label: 'Algo incierta. Podría cambiar pronto', score: 2 },
        { label: 'Bastante estable. Empleo asalariado', score: 3 },
        { label: 'Muy estable. Empleo seguro o múltiples fuentes de ingresos', score: 4 },
      ],
    },
    {
      id: 7,
      text: '¿Qué afirmación refleja mejor tu actitud ante el riesgo y la rentabilidad?',
      options: [
        { label: 'Prefiero seguridad sobre crecimiento. Un 2–3% está bien', score: 1 },
        { label: 'Quiero algo de crecimiento pero odio las grandes fluctuaciones. Un 4–6% me parece bien', score: 2 },
        { label: 'Puedo tolerar la volatilidad a cambio de rentabilidades del 7–10%', score: 3 },
        { label: 'Quiero la máxima rentabilidad a largo plazo. Objetivo: +10%', score: 4 },
      ],
    },
  ],
  en: [
    {
      id: 1,
      text: 'How long do you plan to keep your investments before needing the money?',
      options: [
        { label: 'Less than 2 years', score: 1 },
        { label: '2 to 5 years', score: 2 },
        { label: '5 to 10 years', score: 3 },
        { label: 'More than 10 years', score: 4 },
      ],
    },
    {
      id: 2,
      text: 'Your portfolio drops 25% in a market crash. What do you do?',
      options: [
        { label: "Sell everything. I can't handle the stress", score: 1 },
        { label: 'Sell part of my holdings to reduce risk', score: 2 },
        { label: 'Hold on and wait for recovery', score: 3 },
        { label: "Buy more. It's a discount opportunity", score: 4 },
      ],
    },
    {
      id: 3,
      text: 'What is your primary investment goal?',
      options: [
        { label: 'Protect my savings from losing value', score: 1 },
        { label: 'Grow steadily with modest risk', score: 2 },
        { label: 'Grow significantly over the long term', score: 3 },
        { label: 'Maximise returns. I accept high volatility', score: 4 },
      ],
    },
    {
      id: 4,
      text: 'How would you describe your investing experience?',
      options: [
        { label: "None. I'm just starting out", score: 1 },
        { label: 'Basic. I have a savings account or pension', score: 2 },
        { label: 'Intermediate. I own some funds or ETFs', score: 3 },
        { label: 'Advanced. I actively manage a diversified portfolio', score: 4 },
      ],
    },
    {
      id: 5,
      text: 'What share of your total savings are you planning to invest?',
      options: [
        { label: 'Less than 10%. I need most of it accessible', score: 1 },
        { label: '10–30%', score: 2 },
        { label: '30–60%', score: 3 },
        { label: 'More than 60%. I have a solid emergency fund', score: 4 },
      ],
    },
    {
      id: 6,
      text: 'How stable is your income over the next few years?',
      options: [
        { label: 'Very uncertain. Freelance or irregular', score: 1 },
        { label: 'Somewhat uncertain. Could change soon', score: 2 },
        { label: 'Fairly stable. Salaried employment', score: 3 },
        { label: 'Very stable. Secure job or multiple income sources', score: 4 },
      ],
    },
    {
      id: 7,
      text: 'Which statement best matches your attitude toward risk and reward?',
      options: [
        { label: 'I prefer safety over growth. Even 2-3% is fine', score: 1 },
        { label: 'I want some growth but hate big swings. 4-6% feels right', score: 2 },
        { label: 'I can handle volatility for 7–10% expected returns', score: 3 },
        { label: 'I want maximum long-term returns. 10%+ target', score: 4 },
      ],
    },
  ],
};

const PROFILES = {
  conservative: {
    name: { es: 'Conservador', en: 'Conservative' },
    tagline: { es: 'Preservación del capital primero', en: 'Capital preservation first' },
    color: '#3b82f6',
    colorSoft: 'rgba(59,130,246,0.15)',
    returnRange: '3–5%',
    description: {
      es: 'Priorizas proteger lo que tienes antes que perseguir el crecimiento. Tu cartera está anclada en bonos y activos estables, con una exposición limitada a renta variable para ofrecer algo de rentabilidad sin una volatilidad excesiva.',
      en: 'You prioritise protecting what you have over chasing growth. Your portfolio is anchored in bonds and stable assets, with limited equity exposure to provide some upside without excessive volatility.',
    },
    allocation: [
      { name: { es: 'Bonos', en: 'Bonds' }, pct: 60, color: '#3b82f6' },
      { name: { es: 'Renta variable global', en: 'Global Equities' }, pct: 25, color: '#6366f1' },
      { name: { es: 'Efectivo / Monetario', en: 'Cash / Money Market' }, pct: 15, color: '#8b949e' },
    ],
    funds: [
      { name: 'Fidelity MSCI World Index Fund EUR P Acc', isin: 'IE00BYX5NX33', role: { es: 'Índice global de renta variable en 23 mercados desarrollados, 25% de renta variable', en: 'Global equity index across 23 developed markets, 25% equity sleeve' } },
      { name: 'Fidelity Index Euro Government Bond Fund P Acc EUR', isin: 'IE00BYX5MZ82', role: { es: 'Bonos gubernamentales de la eurozona, posición defensiva principal', en: 'Eurozone government bonds, core defensive holding' } },
      { name: 'Vanguard Global Bond Index Fund EUR Hedged Acc', isin: 'IE00B18GC888', role: { es: 'Bonos globales, cubiertos en EUR', en: 'Global bonds, currency-hedged to EUR' } },
    ],
  },
  moderate: {
    name: { es: 'Moderado', en: 'Moderate' },
    tagline: { es: 'Crecimiento equilibrado y estabilidad', en: 'Balanced growth and stability' },
    color: '#f59e0b',
    colorSoft: 'rgba(245,158,11,0.15)',
    returnRange: '5–8%',
    description: {
      es: "Quieres que tu dinero crezca de forma significativa con el tiempo, pero no puedes aguantar verlo caer a la mitad. Una combinación diversificada de fondos indexados de renta variable y renta fija te ofrece potencial de crecimiento amortiguando las caídas del mercado.",
      en: "You want your money to grow meaningfully over time but can't stomach watching it drop by half. A diversified mix of equity and bond index funds gives you growth potential while cushioning market shocks.",
    },
    allocation: [
      { name: { es: 'Renta variable global', en: 'Global Equities' }, pct: 60, color: '#f59e0b' },
      { name: { es: 'Bonos', en: 'Bonds' }, pct: 30, color: '#3b82f6' },
      { name: { es: 'Mercados emergentes', en: 'Emerging Markets' }, pct: 10, color: '#a855f7' },
    ],
    funds: [
      { name: 'Fidelity MSCI World Index Fund EUR P Acc', isin: 'IE00BYX5NX33', role: { es: 'Índice global de renta variable en 23 mercados desarrollados, 60% de la cartera', en: 'Core global equity index across 23 developed markets, 60% of portfolio' } },
      { name: 'Vanguard Global Bond Index Fund EUR Hedged Acc', isin: 'IE00B18GC888', role: { es: 'Índice global de bonos, cubierto en EUR, estabilizador del 30%', en: 'Global bond index, hedged to EUR, 30% stabiliser' } },
      { name: 'iShares Emerging Markets Index Fund (IE) S Acc EUR', isin: 'IE000QAZP7L2', role: { es: 'Índice de renta variable de mercados emergentes: China, India, Brasil y más', en: 'Emerging market equity index: China, India, Brazil and more' } },
    ],
  },
  aggressive: {
    name: { es: 'Agresivo', en: 'Aggressive' },
    tagline: { es: 'Máximo crecimiento a largo plazo', en: 'Maximum long-term growth' },
    color: '#10b981',
    colorSoft: 'rgba(16,185,129,0.15)',
    returnRange: '8–12%',
    description: {
      es: 'Juegas a largo plazo. La volatilidad a corto plazo no te preocupa. Los mercados se recuperan y el tiempo en el mercado supera al timing. Una cartera casi totalmente de fondos indexados de renta variable, diversificada globalmente, es tu camino a la riqueza.',
      en: "You're playing the long game. Short-term volatility doesn't faze you. Markets recover and time in the market beats timing the market. A near-total equity index fund portfolio, globally diversified, is your path to wealth.",
    },
    allocation: [
      { name: { es: 'Renta variable global', en: 'Global Equities' }, pct: 70, color: '#10b981' },
      { name: { es: 'Mercados emergentes', en: 'Emerging Markets' }, pct: 20, color: '#6366f1' },
      { name: { es: 'Renta variable EE.UU.', en: 'US Equities' }, pct: 10, color: '#f59e0b' },
    ],
    funds: [
      { name: 'Fidelity MSCI World Index Fund EUR P Acc', isin: 'IE00BYX5NX33', role: { es: 'Índice global de renta variable en 23 mercados desarrollados, 70% de la cartera', en: 'Core global equity index across 23 developed markets, 70% of portfolio' } },
      { name: 'iShares Emerging Markets Index Fund (IE) S Acc EUR', isin: 'IE000QAZP7L2', role: { es: 'Índice de renta variable de mercados emergentes de mayor crecimiento, 20%', en: 'Higher-growth emerging market equity index, 20%' } },
      { name: 'Fidelity S&P 500 Index Fund EUR P Acc', isin: 'IE00BYX5MX67', role: { es: 'Índice de renta variable de grandes empresas EE.UU., inclinación adicional al crecimiento, 10%', en: 'US large-cap equity index, additional growth tilt, 10%' } },
    ],
  },
};

const getProfile = (score) => {
  if (score <= 13) return 'conservative';
  if (score <= 20) return 'moderate';
  return 'aggressive';
};

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rp-tooltip">
      <span className="rp-tooltip-name">{name}</span>
      <span className="rp-tooltip-val">{value}%</span>
    </div>
  );
};

export default function RiskProfile({ onLoadInSimulator }) {
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);

  const questions = QUESTIONS[lang] || QUESTIONS.es;
  const totalQuestions = questions.length;
  const questionIndex = step - 1;
  const question = step >= 1 && step <= totalQuestions ? questions[questionIndex] : null;
  const progress = step === 0 ? 0 : step > totalQuestions ? 100 : Math.round((step / totalQuestions) * 100);

  const handleStart = () => { setStep(1); setAnswers([]); setSelected(null); };

  const handleSelect = (score, idx) => {
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, score];
      setAnswers(newAnswers);
      setSelected(null);
      if (step < totalQuestions) setStep(step + 1);
      else setStep(totalQuestions + 1);
    }, 320);
  };

  const handleRestart = () => { setStep(0); setAnswers([]); setSelected(null); };

  const totalScore = answers.reduce((s, v) => s + v, 0);
  const profileKey = getProfile(totalScore);
  const profile = PROFILES[profileKey];

  if (step === 0) {
    return (
      <div className="rp-wrap">
        <div className="rp-intro-card">
          <div className="rp-intro-icon"><Target size={40} strokeWidth={1.5} /></div>
          <h1 className="rp-intro-title">{t('rp.title')}</h1>
          <p className="rp-intro-sub">{t('rp.subtitle')}</p>
          <p className="rp-intro-desc">{t('rp.desc')}</p>
          <button className="rp-btn rp-btn--primary rp-btn--lg" onClick={handleStart}>
            {t('rp.start')} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (step >= 1 && step <= totalQuestions) {
    return (
      <div className="rp-wrap">
        <div className="rp-quiz-card">
          <div className="rp-progress-row">
            <span className="rp-progress-label">{t('rp.question')} {step} {t('rp.of')} {totalQuestions}</span>
            <span className="rp-progress-label">{progress}%</span>
          </div>
          <div className="rp-progress-track">
            <div className="rp-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="rp-question">{question.text}</p>
          <div className="rp-options">
            {question.options.map((opt, i) => (
              <button
                key={i}
                className={`rp-option ${selected === i ? 'rp-option--selected' : ''}`}
                onClick={() => handleSelect(opt.score, i)}
                disabled={selected !== null}
              >
                <span className="rp-option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="rp-option-text">{opt.label}</span>
              </button>
            ))}
          </div>
          {step > 1 && (
            <button
              className="rp-btn rp-btn--ghost rp-back-btn"
              onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }}
            >
              <ArrowLeft size={15} /> {t('rp.back')}
            </button>
          )}
        </div>
      </div>
    );
  }

  const scoreLabel = t('rp.score')
    .replace('{score}', totalScore)
    .replace('{range}', profile.returnRange);

  return (
    <div className="rp-wrap">
      <div className="rp-results-card">
        <div className="rp-result-header" style={{ background: profile.colorSoft, borderColor: profile.color }}>
          <div className="rp-result-badge" style={{ background: profile.color }}>
            {profile.name[lang] || profile.name.en}
          </div>
          <p className="rp-result-tagline">{profile.tagline[lang] || profile.tagline.en}</p>
          <p className="rp-result-score">{scoreLabel}</p>
        </div>

        <p className="rp-result-desc">{profile.description[lang] || profile.description.en}</p>

        <div className="rp-alloc-section">
          <h3 className="rp-section-title">{t('rp.allocTitle')}</h3>
          <div className="rp-alloc-body">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={profile.allocation.map(a => ({ ...a, name: a.name[lang] || a.name.en }))}
                  dataKey="pct"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  strokeWidth={0}
                >
                  {profile.allocation.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CUSTOM_TOOLTIP />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="rp-alloc-legend">
              {profile.allocation.map((item, i) => (
                <div key={i} className="rp-alloc-item">
                  <div className="rp-alloc-dot" style={{ background: item.color }} />
                  <div className="rp-alloc-info">
                    <span className="rp-alloc-name">{item.name[lang] || item.name.en}</span>
                    <span className="rp-alloc-pct" style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <div className="rp-alloc-bar-track">
                    <div className="rp-alloc-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rp-etf-section">
          <h3 className="rp-section-title">{t('rp.fundsTitle')}</h3>
          <div className="rp-etf-list">
            {profile.funds.map((etf, i) => (
              <div key={i} className="rp-etf-row">
                <div className="rp-etf-info">
                  <span className="rp-etf-name">{etf.name}</span>
                  <span className="rp-etf-role">{etf.role[lang] || etf.role.en}</span>
                </div>
                <span className="rp-etf-isin">{etf.isin}</span>
              </div>
            ))}
          </div>
          <p className="rp-etf-note">{t('rp.fundsNote')}</p>
        </div>

        <div className="rp-actions">
          {onLoadInSimulator && (
            <button
              className="rp-btn rp-btn--primary"
              onClick={() => onLoadInSimulator(profileKey, profile)}
            >
              {t('rp.loadSim')} <ChevronRight size={15} />
            </button>
          )}
          <button className="rp-btn rp-btn--ghost" onClick={handleRestart}>
            {t('rp.retake')}
          </button>
        </div>
      </div>
    </div>
  );
}
