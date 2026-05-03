import { ShieldCheck, BookOpen, Eye, TrendingUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import './About.css';

function ContentES({ onNavigate }) {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-tag">Sobre Caudal</div>
          <h1>Construido por alguien<br /><span className="about-accent">como tú</span></h1>
          <p>Una herramienta de finanzas personales creada por un ahorrador que quería controlar su patrimonio sin conectar sus cuentas, sin pagar por lo básico y sin depender de nadie.</p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-section-inner">
          <div className="about-story-text">
            <h2>Por qué existe Caudal</h2>
            <p>
              Llevaba años intentando tener una visión clara de mi patrimonio. Probé hojas de cálculo que siempre quedaban desactualizadas, apps extranjeras que no entendían los fondos indexados del mercado español, y plataformas que exigían conectar mis cuentas bancarias para funcionar.
            </p>
            <p>
              No quería conectar mis cuentas. Quería privacidad total y control absoluto. Quería entender el interés compuesto de verdad. Quería saber cuándo podría ser financieramente independiente.
            </p>
            <p>
              Construí Caudal para mí mismo. Una herramienta que centraliza todo el patrimonio en un lugar, actualiza automáticamente el precio de los fondos con el ISIN, y ayuda a planificar el futuro a largo plazo. Cuando vi que funcionaba, decidí compartirla.
            </p>
            <blockquote className="about-quote">
              "Si puedes ver con claridad dónde estás hoy, puedes planificar dónde quieres estar mañana."
            </blockquote>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-section-inner">
          <h2>Lo que nos guía</h2>
          <p className="about-section-sub">Cuatro principios que definen cada decisión de producto.</p>
          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-icon about-value-icon--blue"><ShieldCheck size={20} strokeWidth={1.5} /></div>
              <h3>Privacidad ante todo</h3>
              <p>Nunca pediremos acceso a tus cuentas bancarias. Tus datos financieros son tuyos y solo tuyos. Sin integraciones bancarias, sin riesgos innecesarios.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon about-value-icon--green"><BookOpen size={20} strokeWidth={1.5} /></div>
              <h3>Educación, no consejo</h3>
              <p>Caudal no te dice qué hacer con tu dinero — te da las herramientas para entenderlo tú mismo. Simuladores, proyecciones, perfil de riesgo. La decisión final siempre es tuya.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon about-value-icon--amber"><Eye size={20} strokeWidth={1.5} /></div>
              <h3>Transparencia total</h3>
              <p>Sabemos dónde se guardan tus datos (AWS Irlanda), cómo se cifran y quién tiene acceso. Lo publicamos abiertamente porque creemos que te lo mereces saber.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon about-value-icon--purple"><TrendingUp size={20} strokeWidth={1.5} /></div>
              <h3>Largo plazo</h3>
              <p>No estamos aquí para ayudarte a especular. Estamos aquí para ayudarte a construir riqueza de forma sostenida — con aportaciones regulares, diversificación y tiempo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-tech">
        <div className="about-section-inner">
          <h2>Tecnología en la que puedes confiar</h2>
          <p className="about-section-sub">Construido sobre infraestructura de nivel empresarial, sin los costes ni la complejidad de una gran corporación.</p>
          <div className="about-tech-list">
            <div className="about-tech-item">
              <span className="about-tech-label">Autenticación</span>
              <span className="about-tech-value">Amazon Cognito · Contraseñas con hash seguro · Sin almacenamiento de credenciales en texto plano</span>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-label">Almacenamiento</span>
              <span className="about-tech-value">AWS DynamoDB · Región eu-west-1 (Irlanda) · Dentro del EEE bajo RGPD</span>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-label">Cifrado</span>
              <span className="about-tech-value">TLS 1.2+ en tránsito · AES-256 en reposo</span>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-label">Código abierto</span>
              <span className="about-tech-value">El código fuente está disponible en GitHub para que cualquiera pueda auditarlo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-section-inner">
          <h2>¿Compartes la visión?</h2>
          <p>Si quieres controlar tu dinero, construir riqueza a largo plazo y alcanzar tus objetivos financieros sin depender de nadie, Caudal es para ti.</p>
          <div className="about-cta-btns">
            <button className="btn-primary" onClick={() => onNavigate('login')}>Empezar gratis</button>
            <button className="btn-outline" onClick={() => onNavigate('simulator')}>Probar el simulador</button>
          </div>
        </div>
      </section>
    </>
  );
}

function ContentEN({ onNavigate }) {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-tag">About Caudal</div>
          <h1>Built by someone<br /><span className="about-accent">just like you</span></h1>
          <p>A personal finance tool created by a saver who wanted to track their wealth without connecting bank accounts, without paying for the basics, and without depending on anyone.</p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-section-inner">
          <div className="about-story-text">
            <h2>Why Caudal exists</h2>
            <p>
              I spent years trying to get a clear picture of my net worth. I tried spreadsheets that were always out of date, foreign apps that didn't understand Spanish index funds, and platforms that required linking my bank accounts to work.
            </p>
            <p>
              I didn't want to link my accounts. I wanted full privacy and complete control. I wanted to really understand compound interest. I wanted to know when I could be financially independent.
            </p>
            <p>
              I built Caudal for myself. A tool that centralises all your wealth in one place, automatically updates fund prices using ISINs, and helps you plan for the long term. When I saw it working, I decided to share it.
            </p>
            <blockquote className="about-quote">
              "If you can see clearly where you are today, you can plan where you want to be tomorrow."
            </blockquote>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-section-inner">
          <h2>What guides us</h2>
          <p className="about-section-sub">Four principles behind every product decision.</p>
          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-icon about-value-icon--blue"><ShieldCheck size={20} strokeWidth={1.5} /></div>
              <h3>Privacy first</h3>
              <p>We will never ask for access to your bank accounts. Your financial data is yours and yours alone. No banking integrations, no unnecessary risk.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon about-value-icon--green"><BookOpen size={20} strokeWidth={1.5} /></div>
              <h3>Education, not advice</h3>
              <p>Caudal doesn't tell you what to do with your money — it gives you the tools to understand it yourself. Simulators, projections, risk profiles. The final decision is always yours.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon about-value-icon--amber"><Eye size={20} strokeWidth={1.5} /></div>
              <h3>Full transparency</h3>
              <p>We tell you where your data is stored (AWS Ireland), how it's encrypted and who has access. We publish this openly because you deserve to know.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon about-value-icon--purple"><TrendingUp size={20} strokeWidth={1.5} /></div>
              <h3>Long-term thinking</h3>
              <p>We're not here to help you speculate. We're here to help you build wealth sustainably — with regular contributions, diversification, and time on your side.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-tech">
        <div className="about-section-inner">
          <h2>Technology you can trust</h2>
          <p className="about-section-sub">Built on enterprise-grade infrastructure, without the cost or complexity of a large corporation.</p>
          <div className="about-tech-list">
            <div className="about-tech-item">
              <span className="about-tech-label">Authentication</span>
              <span className="about-tech-value">Amazon Cognito · Securely hashed passwords · No plaintext credential storage</span>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-label">Storage</span>
              <span className="about-tech-value">AWS DynamoDB · eu-west-1 region (Ireland) · Within the EEA under GDPR</span>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-label">Encryption</span>
              <span className="about-tech-value">TLS 1.2+ in transit · AES-256 at rest</span>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-label">Open source</span>
              <span className="about-tech-value">Source code is available on GitHub for anyone to audit</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-section-inner">
          <h2>Share the vision?</h2>
          <p>If you want to control your money, build long-term wealth and reach your financial goals without relying on anyone, Caudal is for you.</p>
          <div className="about-cta-btns">
            <button className="btn-primary" onClick={() => onNavigate('login')}>Start for free</button>
            <button className="btn-outline" onClick={() => onNavigate('simulator')}>Try the simulator</button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function About({ onNavigate }) {
  const { lang, t } = useLanguage();

  return (
    <div className="about-page">
      <button className="about-back" onClick={() => onNavigate('landing')}>{t('about.nav')}</button>
      {lang === 'es' ? <ContentES onNavigate={onNavigate} /> : <ContentEN onNavigate={onNavigate} />}
    </div>
  );
}
