// One place for every number, currency and date the app shows, so the
// whole site follows the reader's language instead of mixing conventions.
import { useMemo } from 'react';
import { useLanguage } from '../LanguageContext';

const LOCALES = { es: 'es-ES', en: 'en-GB' };

export const localeFor = (lang) => LOCALES[lang] || LOCALES.es;

const nf = (locale, opts) =>
  // 'always' keeps the thousands separator on four-digit numbers (9.370),
  // which es-ES drops by default.
  new Intl.NumberFormat(locale, { useGrouping: 'always', ...opts });

export function makeFormatters(lang = 'es') {
  const locale = localeFor(lang);
  const es = lang !== 'en';

  // Plain number: 50.000 / 50,000
  // decimals: a fixed count, or 'auto' for "up to two, only when needed".
  const number = (v, decimals = 0) => {
    const opts = decimals === 'auto'
      ? { minimumFractionDigits: 0, maximumFractionDigits: 2 }
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    return nf(locale, opts).format(Number(v) || 0);
  };

  // Money with an arbitrary symbol (the user can pick €, $ or £):
  // 50.000 € in Spanish, €50,000 in English.
  const money = (v, { decimals = 0, symbol = '€' } = {}) => {
    const n = Number(v) || 0;
    const body = number(Math.abs(n), decimals);
    const sign = n < 0 ? '-' : '';
    return es ? `${sign}${body} ${symbol}` : `${sign}${symbol}${body}`;
  };

  // Short money for stat cards and chart axes: 1,2 M€ / 600 k€ / €1.2M / €600k
  const compact = (v, { symbol = '€' } = {}) => {
    const n = Number(v) || 0;
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    let body;
    let unit = '';
    if (abs >= 1_000_000) {
      body = nf(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(abs / 1_000_000);
      unit = 'M';
    } else if (abs >= 10_000) {
      body = number(Math.round(abs / 1000));
      unit = 'k';
    } else {
      body = number(Math.round(abs));
    }
    if (es) return `${sign}${body} ${unit}${symbol}`;
    return `${sign}${symbol}${body}${unit}`;
  };

  // 57,91 % / 57.91%
  const percent = (v, decimals = 1, { signed = false } = {}) => {
    const n = Number(v) || 0;
    const body = nf(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Math.abs(n));
    const sign = n < 0 ? '-' : signed && n > 0 ? '+' : '';
    return es ? `${sign}${body} %` : `${sign}${body}%`;
  };

  const date = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
    new Date(d).toLocaleDateString(locale, opts);

  // Turn what someone typed ("50.000", "50,000", "2,5") back into a number.
  const parse = (raw) => {
    if (typeof raw === 'number') return raw;
    let s = String(raw ?? '').trim().replace(/[^\d.,-]/g, '');
    if (!s) return NaN;
    const group = es ? '.' : ',';
    const dec = es ? ',' : '.';
    const lastDec = s.lastIndexOf(dec);
    const lastGroup = s.lastIndexOf(group);
    if (lastDec === -1 && lastGroup !== -1) {
      // Only the grouping character is present. Treat it as a decimal point
      // when it can't be a thousands separator ("2.5" typed on a Spanish page).
      const tail = s.length - lastGroup - 1;
      const groups = s.split(group).length - 1;
      if (groups === 1 && tail !== 3) return parseFloat(s.replace(group, '.'));
    }
    s = s.split(group).join('').replace(dec, '.');
    return parseFloat(s);
  };

  return { locale, number, money, compact, percent, date, parse };
}

export function useFormat() {
  const { lang } = useLanguage();
  return useMemo(() => makeFormatters(lang), [lang]);
}
