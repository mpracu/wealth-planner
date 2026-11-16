import { useState } from 'react';
import { useFormat } from '../lib/format';

// Labelled number field + slider, shared by the simulator and Coast FIRE.
// Numbers are shown and parsed in the reader's locale (50.000 in Spanish).
export default function ParamControls({ controls, idPrefix = 'input', onCommit }) {
  const f = useFormat();
  const [drafts, setDrafts] = useState({});

  const show = (v) => f.number(v, Number.isInteger(v) ? 0 : 1);

  return (
    <div className="controls-grid">
      {controls.map(({ label, id, value, set, min, max, step, prefix, suffix, open }) => {
        // A slider can't sit beyond its own range, so let the range grow with
        // the value (for example when it starts from a real, larger portfolio).
        const sliderMax = Math.max(max, value);
        const fill = sliderMax > min ? ((value - min) / (sliderMax - min)) * 100 : 0;
        return (
          <div key={id} className="control">
            <div className="control-header">
              <label htmlFor={`${idPrefix}-${id}`}>{label}</label>
              <div className="control-input-wrap">
                {prefix && <span className="control-affix">{prefix}</span>}
                <input
                  id={`${idPrefix}-${id}`}
                  type="text"
                  inputMode="decimal"
                  className="control-number"
                  value={drafts[id] !== undefined ? drafts[id] : show(value)}
                  onChange={e => {
                    setDrafts(d => ({ ...d, [id]: e.target.value }));
                    const num = f.parse(e.target.value);
                    if (!isNaN(num)) set(num);
                  }}
                  onFocus={e => e.target.select()}
                  onBlur={() => {
                    const num = drafts[id] !== undefined ? f.parse(drafts[id]) : value;
                    // Money fields are open-ended: typing a figure above the slider's
                    // range is allowed. Ages and percentages stay within bounds.
                    const clamped = isNaN(num) ? value : Math.min(open ? Infinity : max, Math.max(min, num));
                    set(clamped);
                    setDrafts(d => { const nd = { ...d }; delete nd[id]; return nd; });
                    onCommit?.(label, clamped);
                  }}
                />
                {suffix && <span className="control-affix">{suffix}</span>}
              </div>
            </div>
            <input
              type="range"
              aria-label={label}
              min={min}
              max={sliderMax}
              step={step}
              value={value}
              style={{ '--fill': `${fill}%` }}
              onChange={e => { set(+e.target.value); onCommit?.(label, +e.target.value); }}
            />
          </div>
        );
      })}
    </div>
  );
}
