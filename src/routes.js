// Every screen of the app has its own URL, so it can be linked, bookmarked,
// refreshed and indexed. Shared by the Astro pages (which emit one HTML file
// per route) and by App.jsx (which maps the URL to a view and back).
export const ROUTES = {
  landing: {
    path: '/',
  },
  simulator: {
    path: '/simulador/',
    title: 'Simulador de interés compuesto e inversión | Caudal',
    description: 'Calcula cuánto crecerá tu dinero con aportaciones mensuales, rentabilidad e inflación. Simulador gratuito de interés compuesto, sin registro.',
  },
  coastfire: {
    path: '/coast-fire/',
    title: 'Calculadora Coast FIRE | Caudal',
    description: 'Calcula tu número FIRE y a qué edad podrías dejar de ahorrar para la jubilación y dejar que el interés compuesto haga el resto.',
  },
  networth: {
    path: '/patrimonio/',
    title: 'Mi patrimonio | Caudal',
    description: 'Sigue tu patrimonio neto sin conectar tus bancos. Los fondos actualizan su precio con solo añadir el ISIN.',
    private: true,
  },
  budget: {
    path: '/presupuesto/',
    title: 'Presupuesto mensual | Caudal',
    description: 'Registra ingresos y gastos, define un presupuesto por categoría y descubre cuánto ahorras cada mes.',
    private: true,
  },
  login: {
    path: '/acceder/',
    title: 'Acceder | Caudal',
    description: 'Inicia sesión o crea tu cuenta gratuita en Caudal.',
    private: true,
  },
  about: {
    path: '/que-es-caudal/',
    title: '¿Qué es Caudal? | Caudal',
    description: 'Caudal es un simulador de inversión y un seguimiento de patrimonio hecho en España, sin conexión bancaria y sin venta de datos.',
  },
  brand: {
    path: '/marca/',
    title: 'Portal de marca | Caudal',
    description: 'Identidad visual, color, tipografía y tono de voz de Caudal.',
  },
};

const normalise = (p) => (p.endsWith('/') ? p : `${p}/`);

export function viewFromLocation(loc) {
  const params = new URLSearchParams(loc.search);
  const path = normalise(loc.pathname);
  const hit = Object.entries(ROUTES).find(([, r]) => r.path === path);
  if (hit && hit[0] !== 'landing') return hit[0];
  // Links shared before each tool had its own URL.
  if (params.has('sim')) return 'simulator';
  if (params.has('brand')) return 'brand';
  return 'landing';
}

export const pathFor = (view) => (ROUTES[view] || ROUTES.landing).path;
