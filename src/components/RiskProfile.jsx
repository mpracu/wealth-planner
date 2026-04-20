import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './RiskProfile.css';

const QUESTIONS = [
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
      { label: 'Sell everything — I can\'t handle the stress', score: 1 },
      { label: 'Sell part of my holdings to reduce risk', score: 2 },
      { label: 'Hold on and wait for recovery', score: 3 },
      { label: 'Buy more — it\'s a discount opportunity', score: 4 },
    ],
  },
  {
    id: 3,
    text: 'What is your primary investment goal?',
    options: [
      { label: 'Protect my savings from losing value', score: 1 },
      { label: 'Grow steadily with modest risk', score: 2 },
      { label: 'Grow significantly over the long term', score: 3 },
      { label: 'Maximise returns — I accept high volatility', score: 4 },
    ],
  },
  {
    id: 4,
    text: 'How would you describe your investing experience?',
    options: [
      { label: 'None — I\'m just starting out', score: 1 },
      { label: 'Basic — I have a savings account or pension', score: 2 },
      { label: 'Intermediate — I own some funds or ETFs', score: 3 },
      { label: 'Advanced — I actively manage a diversified portfolio', score: 4 },
    ],
  },
  {
    id: 5,
    text: 'What share of your total savings are you planning to invest?',
    options: [
      { label: 'Less than 10% — I need most of it accessible', score: 1 },
      { label: '10–30%', score: 2 },
      { label: '30–60%', score: 3 },
      { label: 'More than 60% — I have a solid emergency fund', score: 4 },
    ],
  },
  {
    id: 6,
    text: 'How stable is your income over the next few years?',
    options: [
      { label: 'Very uncertain — freelance or irregular', score: 1 },
      { label: 'Somewhat uncertain — could change soon', score: 2 },
      { label: 'Fairly stable — salaried employment', score: 3 },
      { label: 'Very stable — secure job or multiple income sources', score: 4 },
    ],
  },
  {
    id: 7,
    text: 'Which statement best matches your attitude toward risk and reward?',
    options: [
      { label: 'I prefer safety over growth — even 2–3% is fine', score: 1 },
      { label: 'I want some growth but hate big swings — 4–6% feels right', score: 2 },
      { label: 'I can handle volatility for 7–10% expected returns', score: 3 },
      { label: 'I want maximum long-term returns — 10%+ is the target', score: 4 },
    ],
  },
];

const PROFILES = {
  conservative: {
    name: 'Conservative',
    tagline: 'Capital preservation first',
    color: '#3b82f6',
    colorSoft: 'rgba(59,130,246,0.15)',
    returnRange: '3–5%',
    description:
      'You prioritise protecting what you have over chasing growth. Your portfolio is anchored in bonds and stable assets, with limited equity exposure to provide some upside without excessive volatility.',
    allocation: [
      { name: 'Bonds', pct: 60, color: '#3b82f6' },
      { name: 'Global Equities', pct: 25, color: '#6366f1' },
      { name: 'Cash / Money Market', pct: 15, color: '#8b949e' },
    ],
    funds: [
      { name: 'iShares Core € Govt Bond', isin: 'IE00B4WXJJ64', role: 'Eurozone government bonds — core bond holding' },
      { name: 'Vanguard Global Bond Index', isin: 'IE00B18GC888', role: 'Global bond diversification (EUR hedged)' },
      { name: 'Amundi MSCI World', isin: 'LU1681043599', role: 'Broad global equity exposure (25%)' },
    ],
  },
  moderate: {
    name: 'Moderate',
    tagline: 'Balanced growth and stability',
    color: '#f59e0b',
    colorSoft: 'rgba(245,158,11,0.15)',
    returnRange: '5–8%',
    description:
      'You want your money to grow meaningfully over time but can\'t stomach watching it drop by half. A diversified mix of equities and bonds gives you growth potential while cushioning market shocks.',
    allocation: [
      { name: 'Global Equities', pct: 60, color: '#f59e0b' },
      { name: 'Bonds', pct: 30, color: '#3b82f6' },
      { name: 'Real Estate (REITs)', pct: 10, color: '#a855f7' },
    ],
    funds: [
      { name: 'Vanguard FTSE All-World', isin: 'IE00B3RBWM25', role: 'Core global equity — 60% of portfolio' },
      { name: 'iShares Core Global Aggregate Bond', isin: 'IE00B3F81R35', role: 'Diversified global bonds (EUR hedged)' },
      { name: 'Amundi FTSE EPRA Europe Real Estate', isin: 'LU1681038599', role: 'European real estate exposure' },
    ],
  },
  aggressive: {
    name: 'Aggressive',
    tagline: 'Maximum long-term growth',
    color: '#10b981',
    colorSoft: 'rgba(16,185,129,0.15)',
    returnRange: '8–12%',
    description:
      'You\'re playing the long game. Short-term volatility doesn\'t faze you — you know markets recover and time in the market beats timing the market. A near-total equity portfolio, globally diversified, is your path to wealth.',
    allocation: [
      { name: 'Global Equities', pct: 70, color: '#10b981' },
      { name: 'Emerging Markets', pct: 20, color: '#6366f1' },
      { name: 'Small-Cap Equities', pct: 10, color: '#f59e0b' },
    ],
    funds: [
      { name: 'Vanguard FTSE All-World', isin: 'IE00B3RBWM25', role: 'Core global equity — foundation holding' },
      { name: 'iShares MSCI EM IMI', isin: 'IE00BKM4GZ66', role: 'Emerging market growth exposure' },
      { name: 'iShares MSCI World Small Cap', isin: 'IE00BF4RFH31', role: 'Small-cap premium over the long term' },
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
  const [step, setStep] = useState(0); // 0 = intro, 1-7 = questions, 8 = results
  const [answers, setAnswers] = useState([]); // array of scores
  const [selected, setSelected] = useState(null); // currently highlighted option index

  const totalQuestions = QUESTIONS.length;
  const questionIndex = step - 1; // 0-based when step >= 1
  const question = step >= 1 && step <= totalQuestions ? QUESTIONS[questionIndex] : null;

  const progress = step === 0 ? 0 : step > totalQuestions ? 100 : Math.round((step / totalQuestions) * 100);

  const handleStart = () => {
    setStep(1);
    setAnswers([]);
    setSelected(null);
  };

  const handleSelect = (score, idx) => {
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, score];
      setAnswers(newAnswers);
      setSelected(null);
      if (step < totalQuestions) {
        setStep(step + 1);
      } else {
        setStep(totalQuestions + 1);
      }
    }, 320);
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
  };

  // Results
  const totalScore = answers.reduce((s, v) => s + v, 0);
  const profileKey = getProfile(totalScore);
  const profile = PROFILES[profileKey];

  // Intro screen
  if (step === 0) {
    return (
      <div className="rp-wrap">
        <div className="rp-intro-card">
          <div className="rp-intro-icon">🎯</div>
          <h1 className="rp-intro-title">Investor Profile Quiz</h1>
          <p className="rp-intro-sub">
            7 questions · 2 minutes · Personalised portfolio recommendation
          </p>
          <p className="rp-intro-desc">
            Answer honestly — there are no right or wrong answers. We'll match you with a
            risk profile and recommend a concrete ETF allocation suited to your goals,
            timeline, and comfort with volatility.
          </p>
          <button className="rp-btn rp-btn--primary rp-btn--lg" onClick={handleStart}>
            Start the quiz →
          </button>
        </div>
      </div>
    );
  }

  // Question screens
  if (step >= 1 && step <= totalQuestions) {
    return (
      <div className="rp-wrap">
        <div className="rp-quiz-card">
          {/* Progress */}
          <div className="rp-progress-row">
            <span className="rp-progress-label">Question {step} of {totalQuestions}</span>
            <span className="rp-progress-label">{progress}%</span>
          </div>
          <div className="rp-progress-track">
            <div className="rp-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Question */}
          <p className="rp-question">{question.text}</p>

          {/* Options */}
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

          {/* Back */}
          {step > 1 && (
            <button
              className="rp-btn rp-btn--ghost rp-back-btn"
              onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results screen
  return (
    <div className="rp-wrap">
      <div className="rp-results-card">

        {/* Profile badge */}
        <div className="rp-result-header" style={{ background: profile.colorSoft, borderColor: profile.color }}>
          <div className="rp-result-badge" style={{ background: profile.color }}>
            {profile.name}
          </div>
          <p className="rp-result-tagline">{profile.tagline}</p>
          <p className="rp-result-score">Score: {totalScore} / 28 · Expected return: {profile.returnRange} p.a.</p>
        </div>

        <p className="rp-result-desc">{profile.description}</p>

        {/* Allocation chart + legend */}
        <div className="rp-alloc-section">
          <h3 className="rp-section-title">Recommended Allocation</h3>
          <div className="rp-alloc-body">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={profile.allocation}
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
                    <span className="rp-alloc-name">{item.name}</span>
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

        {/* Index Fund Recommendations */}
        <div className="rp-etf-section">
          <h3 className="rp-section-title">Recommended Index Funds (European-listed)</h3>
          <div className="rp-etf-list">
            {profile.funds.map((etf, i) => (
              <div key={i} className="rp-etf-row">
                <div className="rp-etf-info">
                  <span className="rp-etf-name">{etf.name}</span>
                  <span className="rp-etf-role">{etf.role}</span>
                </div>
                <span className="rp-etf-isin">{etf.isin}</span>
              </div>
            ))}
          </div>
          <p className="rp-etf-note">
            These index funds are available on Degiro, Trading 212, Scalable Capital, and Interactive Brokers.
            Always check the KIID and your local tax treatment before investing.
          </p>
        </div>

        {/* Actions */}
        <div className="rp-actions">
          {onLoadInSimulator && (
            <button
              className="rp-btn rp-btn--primary"
              onClick={() => onLoadInSimulator(profileKey, profile)}
            >
              Load into Simulator →
            </button>
          )}
          <button className="rp-btn rp-btn--ghost" onClick={handleRestart}>
            Retake quiz
          </button>
        </div>
      </div>
    </div>
  );
}
