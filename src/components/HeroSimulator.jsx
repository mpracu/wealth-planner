import { useMemo, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useFormat } from '../lib/format';

const RETURN = 7;
const W = 400;
const H = 170;

// A two-slider compound-interest demo for the landing page: the product's
// core idea, working, before anyone signs up or opens the full simulator.
export default function HeroSimulator({ onOpen }) {
  const { t } = useLanguage();
  const f = useFormat();
  const [monthly, setMonthly] = useState(300);
  const [years, setYears] = useState(25);

  const { rows, total, contributed } = useMemo(() => {
    const rate = RETURN / 100 / 12;
    const rows = [{ value: 0, paid: 0 }];
    let c = 0;
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) c = c * (1 + rate) + monthly;
      rows.push({ value: c, paid: monthly * 12 * y });
    }
    return { rows, total: c, contributed: monthly * 12 * years };
  }, [monthly, years]);

  const max = Math.max(total, 1);
  const x = (i) => (i / years) * W;
  const y = (v) => H - (v / max) * (H - 8);
  const line = (key) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(r[key]).toFixed(1)}`).join(' ');
  const area = (key) => `${line(key)} L${W} ${H} L0 ${H} Z`;

  const fill = (v, min, mx) => `${((v - min) / (mx - min)) * 100}%`;

  return (
    <div className="hero-sim">
      <p className="hero-sim-lead">
        {t('land.sim.lead').replace('{monthly}', f.money(monthly)).replace('{years}', years)}
      </p>
      <p className="hero-sim-total" aria-live="polite">{f.money(Math.round(total))}</p>

      <svg className="hero-sim-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={t('land.sim.chartAlt')}>
        <path d={area('value')} className="hero-sim-growth" />
        <path d={area('paid')} className="hero-sim-paid" />
        <path d={line('value')} className="hero-sim-line" />
      </svg>

      <dl className="hero-sim-split">
        <div>
          <dt><span className="hero-sim-key hero-sim-key--paid" />{t('land.sim.paid')}</dt>
          <dd>{f.money(contributed)}</dd>
        </div>
        <div>
          <dt><span className="hero-sim-key hero-sim-key--growth" />{t('land.sim.growth')}</dt>
          <dd>{f.money(Math.round(total - contributed))}</dd>
        </div>
      </dl>

      <div className="hero-sim-controls">
        <label>
          <span>{t('land.sim.monthly')}</span>
          <input type="range" min={50} max={2000} step={50} value={monthly}
            style={{ '--fill': fill(monthly, 50, 2000) }}
            onChange={e => setMonthly(+e.target.value)} />
        </label>
        <label>
          <span>{t('land.sim.years')}</span>
          <input type="range" min={5} max={40} step={1} value={years}
            style={{ '--fill': fill(years, 5, 40) }}
            onChange={e => setYears(+e.target.value)} />
        </label>
      </div>

      <div className="hero-sim-foot">
        <span>{t('land.sim.assumption').replace('{pct}', f.percent(RETURN, 0))}</span>
        <button type="button" className="link-btn" onClick={() => onOpen(`?sim=1&c=0&m=${monthly}&r=${RETURN}`)}>
          {t('land.sim.open')}
        </button>
      </div>
    </div>
  );
}
