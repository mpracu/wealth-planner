// The signed-in user's headline numbers (net worth and monthly recurring
// contribution), so the simulators and the home page can start from real
// data instead of generic defaults. Returns null while loading, when signed
// out, or when nothing has been tracked yet.
import { useEffect, useState } from 'react';
import { get as apiGet } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

const fetchJson = async (path, token) => {
  const response = await apiGet({
    apiName: 'WealthPlannerAPI',
    path,
    options: { headers: { Authorization: `Bearer ${token}` } },
  }).response;
  return response.body.json();
};

const sum = (rows, pick) => rows.reduce((s, r) => s + (Number(pick(r)) || 0), 0);

export function usePortfolio(enabled = true) {
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    if (!enabled) { setPortfolio(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) return;
        const [items, recurring, history] = await Promise.all([
          fetchJson('/networth', token),
          fetchJson('/recurring', token).catch(() => []),
          fetchJson('/networth-history', token).catch(() => []),
        ]);
        if (cancelled || !Array.isArray(items) || items.length === 0) return;
        const assets = sum(items.filter(i => i.type === 'asset'), i => i.value);
        const liabilities = sum(items.filter(i => i.type === 'liability'), i => i.value);
        const points = (Array.isArray(history) ? history : [])
          .filter(h => h?.date && Number.isFinite(Number(h.netWorth)))
          .map(h => ({ date: h.date, netWorth: Number(h.netWorth) }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setPortfolio({
          netWorth: assets - liabilities,
          assets,
          liabilities,
          monthlyContribution: sum(Array.isArray(recurring) ? recurring : [], r => r.amount),
          positions: items.length,
          history: points,
        });
      } catch {
        // Signed out or offline: the tools simply keep their defaults.
      }
    })();
    return () => { cancelled = true; };
  }, [enabled]);

  return portfolio;
}
