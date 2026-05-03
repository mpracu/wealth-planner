import { useState, useEffect, useRef } from 'react';
import './Brand.css';

const SECTIONS = [
  { id: 'identidad',   label: 'Identidad' },
  { id: 'proposito',   label: 'Propósito' },
  { id: 'logotipo',    label: 'Logotipo' },
  { id: 'color',       label: 'Color' },
  { id: 'tipografia',  label: 'Tipografía' },
  { id: 'iconografia', label: 'Iconografía' },
  { id: 'tono',        label: 'Tono de voz' },
];

const PALETTE = [
  { name: 'Índigo', role: 'Principal', hex: '#6366f1', text: '#fff', desc: 'Confianza, profundidad y tecnología. Protagonista en acciones, botones y gráficas.' },
  { name: 'Esmeralda', role: 'Crecimiento', hex: '#10b981', text: '#fff', desc: 'Rentabilidad positiva, ganancias y progreso. Siempre asociado a resultados favorables.' },
  { name: 'Ámbar', role: 'Atención', hex: '#f59e0b', text: '#1f2937', desc: 'Cautela, puntos de decisión importantes. Nunca alarma; siempre invita a prestar atención.' },
  { name: 'Rojo', role: 'Pérdida / Error', hex: '#ef4444', text: '#fff', desc: 'Valores negativos, pérdidas y alertas críticas. Se usa con moderación y propósito.' },
  { name: 'Violeta', role: 'Acento', hex: '#8b5cf6', text: '#fff', desc: 'Comparativas, elementos secundarios y datos de referencia. Complemento del índigo.' },
];

const NEUTRALS = [
  { name: 'Fondo profundo', hex: '#0f1117', text: '#e6edf3' },
  { name: 'Fondo tarjeta', hex: '#161b22', text: '#e6edf3' },
  { name: 'Borde sutil', hex: '#30363d', text: '#e6edf3' },
  { name: 'Texto secundario', hex: '#8b949e', text: '#0f1117' },
  { name: 'Texto primario', hex: '#e6edf3', text: '#161b22' },
  { name: 'Fondo claro', hex: '#f8fafc', text: '#1f2937' },
];

const TYPE_SCALE = [
  { name: 'Display', size: '3rem', weight: 800, sample: 'Haz fluir tu patrimonio' },
  { name: 'H1', size: '2rem', weight: 700, sample: 'Previsión de patrimonio' },
  { name: 'H2', size: '1.5rem', weight: 600, sample: 'Perfil de riesgo conservador' },
  { name: 'H3', size: '1.125rem', weight: 600, sample: 'Rentabilidad anual estimada' },
  { name: 'Body', size: '1rem', weight: 400, sample: 'Cada euro que inviertes hoy vale más mañana gracias al interés compuesto.' },
  { name: 'Caption', size: '0.8125rem', weight: 400, sample: 'Actualizado hace 2 minutos · Tipo de cambio EUR/USD' },
  { name: 'Mono / Cifras', size: '0.875rem', weight: 600, sample: '€50,000 · +12.4% · 7.0% TAE', mono: true },
];

const PRINCIPLES = [
  {
    name: 'Claros',
    icon: '💡',
    body: 'La complejidad financiera es una barrera que deja fuera a demasiada gente. Rompemos esa barrera con lenguaje directo, explicaciones concretas y sin jerga innecesaria. Si no podemos explicarlo de forma sencilla, no lo decimos.',
  },
  {
    name: 'Rigurosos',
    icon: '📐',
    body: 'Cada cálculo es exacto. No suavizamos cifras ni prometemos lo que los mercados no garantizan. La confianza de nuestros usuarios se gana siendo matemáticamente honestos, incluso cuando los números no son los que esperaban.',
  },
  {
    name: 'Empáticos',
    icon: '🤝',
    body: 'Entendemos que el dinero genera ansiedad. No ignoramos esa realidad: la transformamos. Diseñamos cada pantalla sabiendo que hay una persona con miedos, dudas y aspiraciones reales al otro lado.',
  },
  {
    name: 'Accesibles',
    icon: '🌍',
    body: 'El conocimiento financiero no debería ser un privilegio de quienes ya tienen dinero. Caudal está pensado para cualquier persona que quiera entender y mejorar su situación económica, independientemente de donde empiece.',
  },
];

const TONE_EXAMPLES = [
  {
    think: 'Las aportaciones periódicas tienen un impacto exponencial a largo plazo gracias al efecto del interés compuesto sobre los rendimientos acumulados.',
    say: 'Cada euro que aportas hoy crece sobre los anteriores. Por eso, aportar poco cada mes acaba importando más que aportar mucho una sola vez.',
  },
  {
    think: 'La inflación erosiona el poder adquisitivo del dinero en efectivo a lo largo del tiempo, lo que hace que mantener liquidez sin invertir sea una decisión con coste de oportunidad implícito.',
    say: '€100 de hoy no serán €100 dentro de diez años. Por eso invertir no es un lujo, es la única forma de no perder poder adquisitivo.',
  },
  {
    think: 'Una cartera diversificada con activos de baja correlación reduce la volatilidad global sin sacrificar necesariamente la rentabilidad esperada.',
    say: 'Distribuye tu dinero en tipos de inversión distintos. Si uno baja, no todo baja a la vez.',
  },
];

const DONTS = [
  {
    dont: '"Optimiza tu portafolio mediante la diversificación de activos con correlación negativa."',
    do:   '"Reparte tu dinero en distintos tipos de inversión para que si uno cae, no lo pierdes todo."',
  },
  {
    dont: '"Experimenta retornos superiores al benchmark del mercado mediante estrategias de asset allocation."',
    do:   '"Haz crecer tu dinero más rápido que la media del mercado con una estrategia sencilla."',
  },
];

export default function Brand() {
  const [active, setActive] = useState('identidad');
  const mainRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="brand" ref={mainRef}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="brand-hero">
        <div className="brand-hero-bg" />
        <div className="brand-hero-content">
          <div className="brand-hero-eyebrow">Portal de marca · Caudal</div>
          <h1 className="brand-hero-title">
            Nacida de la claridad,<br />construida para las personas
          </h1>
          <p className="brand-hero-sub">
            En esta guía encontrarás todos los elementos que componen la marca Caudal: propósito,
            identidad visual, color, tipografía y tono de voz. Juntos dan vida a una herramienta
            financiera honesta y accesible para todos.
          </p>
        </div>
        <div className="brand-hero-pills">
          <span className="brand-pill brand-pill--indigo">Finanzas personales</span>
          <span className="brand-pill brand-pill--green">Patrimonio</span>
          <span className="brand-pill brand-pill--purple">Diseñada en España</span>
        </div>
      </div>

      {/* ── Sticky section nav ────────────────────────────── */}
      <nav className="brand-nav">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`brand-nav-btn${active === s.id ? ' active' : ''}`}
            onClick={() => scrollTo(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* ── Identidad ─────────────────────────────────────── */}
      <section id="identidad" className="brand-section">
        <div className="brand-section-label">01 — Identidad</div>
        <h2 className="brand-section-title">¿Qué es Caudal?</h2>
        <p className="brand-lead">
          Para algunos, un simulador de inversiones. Para otros, el primer paso hacia la libertad financiera.
          Para nosotros, una plataforma que devuelve a las personas el control sobre su dinero y su futuro.
        </p>
        <p className="brand-body">
          Caudal nació de una convicción simple: demasiada gente toma decisiones financieras sin información,
          sin proyección, sin confianza. La planificación del patrimonio estaba reservada para quienes ya
          tenían asesores, tiempo y dinero suficiente para preocuparse por él. Cambiamos eso.
        </p>
        <div className="brand-stats">
          <div className="brand-stat">
            <span className="brand-stat-num">2025</span>
            <span className="brand-stat-label">Fundada</span>
          </div>
          <div className="brand-stat-sep" />
          <div className="brand-stat">
            <span className="brand-stat-num">España</span>
            <span className="brand-stat-label">Origen</span>
          </div>
          <div className="brand-stat-sep" />
          <div className="brand-stat">
            <span className="brand-stat-num">100%</span>
            <span className="brand-stat-label">Independiente</span>
          </div>
          <div className="brand-stat-sep" />
          <div className="brand-stat">
            <span className="brand-stat-num">0€</span>
            <span className="brand-stat-label">Para empezar</span>
          </div>
        </div>
        <div className="brand-name-origin">
          <div className="brand-name-word">
            <span className="brand-name-es">caudal</span>
            <span className="brand-name-def">
              1. m. Cantidad de agua que lleva una corriente.<br />
              2. m. Hacienda, bienes de cualquier especie, y más comúnmente dinero.<br />
              3. m. Abundancia de cosas no materiales.
            </span>
            <span className="brand-name-src">— RAE, Diccionario de la lengua española</span>
          </div>
        </div>
      </section>

      {/* ── Propósito ─────────────────────────────────────── */}
      <section id="proposito" className="brand-section brand-section--alt">
        <div className="brand-section-label">02 — Propósito</div>
        <h2 className="brand-section-title">El Caudal Way</h2>

        <div className="brand-pmv">
          <div className="brand-pmv-card">
            <div className="brand-pmv-icon">🎯</div>
            <div className="brand-pmv-type">Propósito</div>
            <p>Hacer fluir el patrimonio de las personas, guiándolo con claridad hacia donde quieren llegar.</p>
          </div>
          <div className="brand-pmv-card">
            <div className="brand-pmv-icon">⚙️</div>
            <div className="brand-pmv-type">Misión</div>
            <p>Dar a cada persona las herramientas para entender, visualizar y hacer crecer su dinero, sin importar desde dónde empieza.</p>
          </div>
          <div className="brand-pmv-card">
            <div className="brand-pmv-icon">🔭</div>
            <div className="brand-pmv-type">Visión</div>
            <p>Un mundo donde la planificación financiera sea tan natural y accesible como cualquier otra decisión cotidiana.</p>
          </div>
        </div>

        <div className="brand-positioning">
          <blockquote className="brand-quote">
            "El dinero que no se mueve no crece."
          </blockquote>
          <p className="brand-body" style={{ maxWidth: 640 }}>
            Caudal es el nombre del río que fluye constante. También es la abundancia que se construye
            con paciencia y dirección. Eso somos: flujo con propósito. Ayudamos a las personas a tomar
            el control de su patrimonio a través de herramientas claras, honestas y diseñadas para durar.
          </p>
        </div>

        <h3 className="brand-sub-title">Principios de marca</h3>
        <div className="brand-principles">
          {PRINCIPLES.map(p => (
            <div key={p.name} className="brand-principle-card">
              <span className="brand-principle-icon">{p.icon}</span>
              <h4 className="brand-principle-name">{p.name}</h4>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Logotipo ──────────────────────────────────────── */}
      <section id="logotipo" className="brand-section">
        <div className="brand-section-label">03 — Logotipo</div>
        <h2 className="brand-section-title">Logotipo</h2>
        <p className="brand-lead">
          El logotipo es el elemento de marca más reconocible de Caudal. Combina un símbolo universal
          —la bolsa de dinero— con el wordmark "Caudal" en peso semibold. Juntos comunican riqueza,
          claridad y movimiento hacia adelante.
        </p>

        <div className="brand-logo-showcase">
          <div className="brand-logo-variant brand-logo-variant--dark">
            <span className="brand-logo-symbol">💰</span>
            <span className="brand-logo-wordmark">Caudal</span>
          </div>
          <div className="brand-logo-variant brand-logo-variant--light">
            <span className="brand-logo-symbol">💰</span>
            <span className="brand-logo-wordmark brand-logo-wordmark--dark">Caudal</span>
          </div>
          <div className="brand-logo-variant brand-logo-variant--indigo">
            <span className="brand-logo-symbol">💰</span>
            <span className="brand-logo-wordmark">Caudal</span>
          </div>
        </div>

        <div className="brand-logo-rules">
          <div className="brand-rule-card">
            <div className="brand-rule-title">Zona de seguridad</div>
            <p>El espacio mínimo alrededor del logotipo es igual a la altura del símbolo (1x). No puede haber ningún elemento en esta zona.</p>
          </div>
          <div className="brand-rule-card">
            <div className="brand-rule-title">Tamaño mínimo</div>
            <p>El ancho mínimo del logotipo completo es de 80px en digital. Por debajo de este tamaño, usar solo el símbolo.</p>
          </div>
          <div className="brand-rule-card">
            <div className="brand-rule-title">Versiones permitidas</div>
            <p>Símbolo + wordmark (uso principal), símbolo solo (avatar, favicon), wordmark solo (contextos donde el símbolo no encaja).</p>
          </div>
        </div>

        <div className="brand-donts-grid">
          <div className="brand-dont-card brand-dont-card--dont">
            <div className="brand-dont-label">❌ No hacer</div>
            <ul>
              <li>Cambiar los colores del logotipo arbitrariamente</li>
              <li>Distorsionar o estirar el símbolo</li>
              <li>Usar sobre fondos con contraste insuficiente</li>
              <li>Añadir efectos: sombras, degradados, contornos</li>
              <li>Modificar el espaciado entre símbolo y wordmark</li>
            </ul>
          </div>
          <div className="brand-dont-card brand-dont-card--do">
            <div className="brand-dont-label">✅ Hacer</div>
            <ul>
              <li>Respetar siempre la zona de seguridad</li>
              <li>Usar las versiones aprobadas (oscuro, claro, índigo)</li>
              <li>Asegurar contraste mínimo 4.5:1 sobre el fondo</li>
              <li>Escalar de forma proporcional manteniendo el ratio</li>
              <li>Dar al logotipo un lugar destacado y reconocible</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Color ─────────────────────────────────────────── */}
      <section id="color" className="brand-section brand-section--alt">
        <div className="brand-section-label">04 — Color</div>
        <h2 className="brand-section-title">Color</h2>
        <p className="brand-lead">
          La paleta de Caudal está diseñada para comunicar con precisión. Cada color tiene una función
          semántica específica: no decoramos con color, informamos. El índigo es el corazón de la marca;
          el verde y el rojo hablan el lenguaje universal de las finanzas.
        </p>

        <h3 className="brand-sub-title">Principios de color</h3>
        <div className="brand-color-principles">
          {[
            { icon: '🎯', name: 'Intencional', desc: 'Cada color tiene una función semántica. Usamos color para comunicar, no para decorar.' },
            { icon: '♿', name: 'Accesible', desc: 'Contraste mínimo WCAG AA (4.5:1) para texto. El diseño no sacrifica legibilidad por estética.' },
            { icon: '🔁', name: 'Consistente', desc: 'El mismo color siempre significa lo mismo en toda la app: verde es ganancia, rojo es pérdida.' },
            { icon: '⚖️', name: 'Equilibrado', desc: 'El índigo domina. Los colores secundarios se usan como acento, nunca como protagonistas.' },
          ].map(p => (
            <div key={p.name} className="brand-cp-card">
              <span>{p.icon}</span>
              <strong>{p.name}</strong>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="brand-sub-title">Color primario</h3>
        <div className="brand-primary-color">
          <div className="brand-primary-swatch" style={{ background: '#6366f1' }} />
          <div className="brand-primary-info">
            <div className="brand-color-name">Índigo</div>
            <div className="brand-color-meta">HEX #6366f1 · RGB 99, 102, 241 · HSL 239° 84% 67%</div>
            <p>El índigo es el color principal de Caudal. Representa la profundidad del conocimiento financiero y la confianza que generamos. Aparece en botones primarios, gráficas principales, acentos de navegación y elementos de foco.</p>
          </div>
        </div>

        <h3 className="brand-sub-title">Colores secundarios</h3>
        <div className="brand-swatches">
          {PALETTE.slice(1).map(c => (
            <div key={c.hex} className="brand-swatch-card">
              <div className="brand-swatch" style={{ background: c.hex, color: c.text }}>
                <span className="brand-swatch-hex">{c.hex}</span>
              </div>
              <div className="brand-swatch-name">{c.name}</div>
              <div className="brand-swatch-role">{c.role}</div>
              <p className="brand-swatch-desc">{c.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="brand-sub-title">Neutros</h3>
        <div className="brand-neutrals">
          {NEUTRALS.map(c => (
            <div key={c.hex} className="brand-neutral-chip" style={{ background: c.hex, color: c.text }}>
              <span className="brand-neutral-name">{c.name}</span>
              <span className="brand-neutral-hex">{c.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tipografía ────────────────────────────────────── */}
      <section id="tipografia" className="brand-section">
        <div className="brand-section-label">05 — Tipografía</div>
        <h2 className="brand-section-title">Tipografía</h2>
        <p className="brand-lead">
          Caudal usa la tipografía del sistema operativo: Inter en entornos que la soportan y el stack
          nativo en el resto. Esta decisión garantiza la máxima legibilidad en cualquier dispositivo,
          velocidad de carga óptima y coherencia con el entorno del usuario.
        </p>
        <div className="brand-font-family">
          <code className="brand-font-stack">-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif</code>
        </div>

        <h3 className="brand-sub-title">Escala tipográfica</h3>
        <div className="brand-type-scale">
          {TYPE_SCALE.map(t => (
            <div key={t.name} className="brand-type-row">
              <div className="brand-type-meta">
                <span className="brand-type-name">{t.name}</span>
                <span className="brand-type-spec">{t.size} · {t.weight}</span>
              </div>
              <div
                className="brand-type-sample"
                style={{
                  fontSize: t.size,
                  fontWeight: t.weight,
                  fontFamily: t.mono ? 'monospace' : 'inherit',
                }}
              >
                {t.sample}
              </div>
            </div>
          ))}
        </div>

        <div className="brand-donts-grid" style={{ marginTop: '2rem' }}>
          <div className="brand-dont-card brand-dont-card--dont">
            <div className="brand-dont-label">❌ No hacer</div>
            <ul>
              <li>Usar más de 3 tamaños distintos en una misma pantalla</li>
              <li>Reducir el interlineado por debajo de 1.4 en cuerpo de texto</li>
              <li>Usar cursiva para mostrar cifras o datos numéricos</li>
              <li>Mezclar pesos sin jerarquía clara</li>
            </ul>
          </div>
          <div className="brand-dont-card brand-dont-card--do">
            <div className="brand-dont-label">✅ Hacer</div>
            <ul>
              <li>Establecer jerarquía clara con tamaño y peso</li>
              <li>Interlineado mínimo 1.5 en párrafos de cuerpo</li>
              <li>Usar peso 600–700 para valores clave (cifras, porcentajes)</li>
              <li>Reservar el display solo para momentos de impacto</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Iconografía ───────────────────────────────────── */}
      <section id="iconografia" className="brand-section brand-section--alt">
        <div className="brand-section-label">06 — Iconografía</div>
        <h2 className="brand-section-title">Iconografía</h2>
        <p className="brand-lead">
          Caudal utiliza el sistema de iconos Lucide. Son coherentes con la identidad visual de la marca:
          trazo limpio, formas redondeadas y semántica precisa. Los iconos identifican acciones y estados,
          no decoran.
        </p>

        <div className="brand-icon-principles">
          {[
            { icon: '✦', name: 'Simples', desc: 'Trazo único, sin relleno. La simplicidad reduce la carga cognitiva y ayuda a la comprensión inmediata.' },
            { icon: '⬡', name: 'Consistentes', desc: 'Grosor de trazo uniforme (1.5px). Todos los iconos comparten el mismo lenguaje visual.' },
            { icon: '↔', name: 'Escalables', desc: 'Diseñados en rejilla de 24px, escalan limpiamente a cualquier tamaño sin perder definición.' },
            { icon: '◎', name: 'Significativos', desc: 'Cada icono tiene un propósito concreto. No añadimos iconos decorativos ni ambiguos.' },
          ].map(p => (
            <div key={p.name} className="brand-cp-card">
              <span className="brand-icon-symbol">{p.icon}</span>
              <strong>{p.name}</strong>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="brand-sub-title">Tamaños</h3>
        <div className="brand-icon-sizes">
          {[
            { size: 16, label: 'Inline / Texto', use: 'Dentro de párrafos, etiquetas, pills' },
            { size: 20, label: 'UI estándar', use: 'Botones, inputs, elementos de navegación' },
            { size: 24, label: 'Acciones', use: 'CTAs, iconos de herramientas, controles principales' },
            { size: 32, label: 'Features', use: 'Cards de características, secciones de onboarding' },
          ].map(s => (
            <div key={s.size} className="brand-icon-size-card">
              <div className="brand-icon-demo" style={{ width: s.size, height: s.size }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={s.size} height={s.size}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="brand-icon-size-num">{s.size}px</span>
              <span className="brand-icon-size-label">{s.label}</span>
              <span className="brand-icon-size-use">{s.use}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tono de voz ───────────────────────────────────── */}
      <section id="tono" className="brand-section">
        <div className="brand-section-label">07 — Tono de voz</div>
        <h2 className="brand-section-title">Tono de voz</h2>
        <div className="brand-quote-block">
          <blockquote className="brand-quote brand-quote--lg">
            "Tan claro como mirar tus propios números."
          </blockquote>
        </div>
        <p className="brand-lead">
          La voz de Caudal es honesta. Nacimos para dar claridad financiera a las personas, no para
          impresionarlas con vocabulario técnico. Hablamos como alguien que domina el tema pero no
          lo esconde detrás de tecnicismos. Directo, cercano, siempre en español.
        </p>

        <h3 className="brand-sub-title">Cuando hablamos, somos</h3>
        <div className="brand-voice-traits">
          {[
            { a: 'Más claros', b: 'que técnicos' },
            { a: 'Más concretos', b: 'que abstractos' },
            { a: 'Más empáticos', b: 'que neutros' },
            { a: 'Más optimistas', b: 'que alarmistas' },
          ].map(t => (
            <div key={t.a} className="brand-voice-trait">
              <span className="brand-voice-a">{t.a}</span>
              <span className="brand-voice-sep">que</span>
              <span className="brand-voice-b">{t.b}</span>
            </div>
          ))}
        </div>

        <h3 className="brand-sub-title">Cómo componemos las frases</h3>
        <div className="brand-formula">
          <div className="brand-formula-part brand-formula-part--cause">CAUSA</div>
          <div className="brand-formula-arrow">→</div>
          <div className="brand-formula-part brand-formula-part--nexo">NEXO</div>
          <div className="brand-formula-arrow">→</div>
          <div className="brand-formula-part brand-formula-part--effect">EFECTO</div>
        </div>
        <div className="brand-formula-example">
          <span className="brand-fe-cause">Tu cartera creció un 7% este año,</span>
          {' '}
          <span className="brand-fe-nexo">por eso</span>
          {' '}
          <span className="brand-fe-effect">tu objetivo llega antes de lo que crees.</span>
        </div>

        <h3 className="brand-sub-title">Lo que pensamos vs. lo que decimos</h3>
        <div className="brand-examples">
          {TONE_EXAMPLES.map((ex, i) => (
            <div key={i} className="brand-example-card">
              <div className="brand-example-think">
                <div className="brand-example-label">Lo que pensamos</div>
                <p>{ex.think}</p>
              </div>
              <div className="brand-example-arrow">→</div>
              <div className="brand-example-say">
                <div className="brand-example-label brand-example-label--say">Lo que decimos</div>
                <p>"{ex.say}"</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="brand-sub-title">Do's y Don'ts</h3>
        {DONTS.map((d, i) => (
          <div key={i} className="brand-donts-grid" style={{ marginBottom: '1rem' }}>
            <div className="brand-dont-card brand-dont-card--dont">
              <div className="brand-dont-label">❌ No decimos</div>
              <p className="brand-dont-text">{d.dont}</p>
            </div>
            <div className="brand-dont-card brand-dont-card--do">
              <div className="brand-dont-label">✅ Decimos</div>
              <p className="brand-dont-text">{d.do}</p>
            </div>
          </div>
        ))}

        <div className="brand-voice-guide">
          <h3 className="brand-sub-title">Guía práctica para escribir con claridad</h3>
          <div className="brand-guide-grid">
            {[
              { icon: '1️⃣', title: 'Un solo mensaje', body: 'Cada comunicación tiene un único propósito. Si tienes varios mensajes, usa varios momentos.' },
              { icon: '🧠', title: 'Un razonamiento', body: 'Todo lo que decimos tiene un por qué. No afirmamos sin explicar la causa o la consecuencia.' },
              { icon: '🎯', title: 'Algo relevante', body: 'Hablamos de lo que importa al usuario, no de lo que queremos vender.' },
              { icon: '💬', title: 'Sencillez y claridad', body: 'Si tienes que elegir entre la palabra corta y la larga, elige la corta. Si tienes que elegir entre el concepto técnico y el cotidiano, elige el cotidiano.' },
            ].map(g => (
              <div key={g.title} className="brand-guide-card">
                <span className="brand-guide-icon">{g.icon}</span>
                <strong>{g.title}</strong>
                <p>{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="brand-footer">
        <div className="brand-footer-logo">💰 Caudal</div>
        <p>Portal de marca · {new Date().getFullYear()} · Todos los derechos reservados</p>
      </div>

    </div>
  );
}
