import { useLanguage } from '../LanguageContext';
import { useFormat } from '../lib/format';

const W = 600;
const H = 120;

// What a signed-in user sees first on the home page: their own numbers and
// the next thing to do with them, instead of the pitch for new visitors.
export default function HomeSummary({ portfolio, onNavigate }) {
  const { t } = useLanguage();
  const f = useFormat();
  const { netWorth, monthlyContribution, positions, history } = portfolio;

  // Change across the tracked history, when there is one to compare against.
  const first = history.length > 1 ? history[0] : null;
  const change = first ? netWorth - first.netWorth : null;
  const changePct = first && first.netWorth ? (change / first.netWorth) * 100 : null;

  let spark = null;
  if (history.length > 1) {
    const values = [...history.map(h => h.netWorth), netWorth];
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const span = hi - lo || 1;
    const pts = values.map((v, i) => [
      (i / (values.length - 1)) * W,
      H - 6 - ((v - lo) / span) * (H - 12),
    ]);
    const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    spark = { line, area: `${line} L${W} ${H} L0 ${H} Z` };
  }

  return (
    <section className="home-summary">
      <div className="home-summary-main">
        <h1 className="home-summary-title">{t('home.title')}</h1>
        <p className="home-summary-value">{f.money(netWorth, { decimals: 2 })}</p>
        {change !== null && (
          <p className={`home-summary-change ${change >= 0 ? 'is-up' : 'is-down'}`}>
            {change >= 0 ? '+' : '-'}{f.money(Math.abs(change))}
            {changePct !== null && ` (${f.percent(changePct, 1, { signed: true })})`}
            <span>{t('home.since').replace('{date}', f.date(first.date, { month: 'long', year: 'numeric' }))}</span>
          </p>
        )}
        <div className="home-summary-actions">
          <button className="btn-primary" onClick={() => onNavigate('networth')}>{t('home.openNetWorth')}</button>
          <button className="btn-outline" onClick={() => onNavigate('simulator')}>{t('home.project')}</button>
        </div>
      </div>

      <div className="home-summary-side">
        {spark && (
          <svg className="home-summary-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={t('home.sparkAlt')}>
            <path d={spark.area} className="home-summary-spark-area" />
            <path d={spark.line} className="home-summary-spark-line" />
          </svg>
        )}
        <dl className="home-summary-facts">
          <div>
            <dt>{t('home.monthly')}</dt>
            <dd>{f.money(monthlyContribution)}</dd>
          </div>
          <div>
            <dt>{t('home.positions')}</dt>
            <dd>{f.number(positions)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
