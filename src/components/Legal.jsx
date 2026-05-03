import { X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import './Legal.css';

function PrivacyES() {
  return (
    <>
      <p className="legal-updated">Última actualización: mayo 2026</p>

      <h3>1. Responsable del tratamiento</h3>
      <p>Caudal es una plataforma de planificación financiera personal operada de forma independiente. Para cualquier consulta relacionada con la privacidad puedes escribirnos a <strong>privacidad@caudal.app</strong>.</p>

      <h3>2. Datos que recogemos</h3>
      <ul>
        <li><strong>Datos de cuenta:</strong> dirección de correo electrónico, contraseña (almacenada con hash seguro).</li>
        <li><strong>Datos financieros:</strong> activos, pasivos, inversiones recurrentes e historial de patrimonio que tú introduces voluntariamente. En ningún caso accedemos a tus cuentas bancarias ni solicitamos credenciales bancarias.</li>
        <li><strong>Datos de uso:</strong> páginas visitadas y eventos de interacción, recogidos de forma anónima mediante Google Analytics.</li>
      </ul>

      <h3>3. Finalidad y base legal</h3>
      <p>Tratamos tus datos para prestarte el servicio de seguimiento y planificación patrimonial (ejecución del contrato). Los datos de uso se tratan con base en nuestro interés legítimo de mejorar la plataforma.</p>

      <h3>4. Almacenamiento y seguridad</h3>
      <p>Todos los datos se almacenan en servidores de Amazon Web Services (AWS) en la región <strong>EU-West-1 (Irlanda)</strong>, dentro del Espacio Económico Europeo. La autenticación se gestiona mediante Amazon Cognito. Los datos en tránsito van cifrados con TLS 1.2+.</p>

      <h3>5. Transferencias internacionales</h3>
      <p>No transferimos datos fuera del EEE salvo cuando AWS utiliza subencargados bajo las Cláusulas Contractuales Tipo de la Comisión Europea.</p>

      <h3>6. Plazo de conservación</h3>
      <p>Conservamos tus datos mientras mantengas una cuenta activa. Puedes solicitar la eliminación completa de tu cuenta y datos en cualquier momento escribiéndonos.</p>

      <h3>7. Tus derechos (RGPD)</h3>
      <p>Tienes derecho a acceder, rectificar, suprimir, portar, limitar y oponerte al tratamiento de tus datos. También puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (aepd.es)</strong>.</p>
      <p>Para ejercer tus derechos, escríbenos a <strong>privacidad@caudal.app</strong>.</p>

      <h3>8. Cookies</h3>
      <p>Usamos únicamente cookies de sesión necesarias para el funcionamiento del servicio y cookies analíticas anónimas (Google Analytics). No usamos cookies publicitarias ni de seguimiento de terceros.</p>
    </>
  );
}

function PrivacyEN() {
  return (
    <>
      <p className="legal-updated">Last updated: May 2026</p>

      <h3>1. Data Controller</h3>
      <p>Caudal is an independently operated personal finance platform. For any privacy-related queries, contact us at <strong>privacy@caudal.app</strong>.</p>

      <h3>2. Data We Collect</h3>
      <ul>
        <li><strong>Account data:</strong> email address, password (stored with secure hashing).</li>
        <li><strong>Financial data:</strong> assets, liabilities, recurring investments and net worth history that you voluntarily enter. We never access your bank accounts or request banking credentials.</li>
        <li><strong>Usage data:</strong> pages visited and interaction events, collected anonymously via Google Analytics.</li>
      </ul>

      <h3>3. Purpose and Legal Basis</h3>
      <p>We process your data to provide the wealth tracking and planning service (contract performance). Usage data is processed under our legitimate interest in improving the platform.</p>

      <h3>4. Storage and Security</h3>
      <p>All data is stored on Amazon Web Services (AWS) servers in the <strong>EU-West-1 (Ireland)</strong> region, within the European Economic Area. Authentication is managed by Amazon Cognito. Data in transit is encrypted with TLS 1.2+.</p>

      <h3>5. International Transfers</h3>
      <p>We do not transfer data outside the EEA except where AWS uses sub-processors under Standard Contractual Clauses approved by the European Commission.</p>

      <h3>6. Retention</h3>
      <p>We retain your data for as long as you maintain an active account. You can request complete deletion of your account and data at any time by contacting us.</p>

      <h3>7. Your Rights (GDPR)</h3>
      <p>You have the right to access, rectify, erase, port, restrict and object to the processing of your data. You may also lodge a complaint with your local data protection authority.</p>
      <p>To exercise your rights, write to <strong>privacy@caudal.app</strong>.</p>

      <h3>8. Cookies</h3>
      <p>We use only session cookies required for the service to function and anonymous analytics cookies (Google Analytics). We do not use advertising or third-party tracking cookies.</p>
    </>
  );
}

function TermsES() {
  return (
    <>
      <p className="legal-updated">Última actualización: mayo 2026</p>

      <h3>1. Aceptación</h3>
      <p>Al registrarte y usar Caudal aceptas estos términos en su totalidad. Si no estás de acuerdo, no uses el servicio.</p>

      <h3>2. Descripción del servicio</h3>
      <p>Caudal es una herramienta de seguimiento y planificación patrimonial personal. Permite registrar activos y pasivos, simular escenarios de inversión y visualizar la evolución del patrimonio en el tiempo.</p>

      <h3>3. No es asesoramiento financiero</h3>
      <p><strong>Caudal no proporciona asesoramiento financiero, fiscal ni de inversión.</strong> Toda la información y proyecciones mostradas tienen carácter exclusivamente informativo y educativo. Las simulaciones se basan en hipótesis que pueden no cumplirse. Consulta siempre a un profesional cualificado antes de tomar decisiones de inversión.</p>

      <h3>4. Exactitud de los datos</h3>
      <p>Los precios de fondos actualizados automáticamente proceden de fuentes de terceros y pueden no ser exactos o estar actualizados en tiempo real. Caudal no garantiza la exactitud de dicha información.</p>

      <h3>5. Responsabilidad del usuario</h3>
      <p>Eres responsable de la exactitud de los datos que introduces. Mantén la confidencialidad de tus credenciales de acceso. Notifícanos inmediatamente si sospechas de un uso no autorizado de tu cuenta.</p>

      <h3>6. Limitación de responsabilidad</h3>
      <p>En la máxima medida permitida por la ley, Caudal no será responsable de pérdidas o daños derivados del uso o la imposibilidad de uso del servicio, ni de decisiones financieras tomadas basándose en la información mostrada.</p>

      <h3>7. Modificaciones</h3>
      <p>Podemos modificar estos términos en cualquier momento. Te notificaremos los cambios relevantes por correo electrónico. El uso continuado del servicio tras la notificación implica la aceptación de los nuevos términos.</p>

      <h3>8. Ley aplicable</h3>
      <p>Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de España.</p>
    </>
  );
}

function TermsEN() {
  return (
    <>
      <p className="legal-updated">Last updated: May 2026</p>

      <h3>1. Acceptance</h3>
      <p>By registering and using Caudal you accept these terms in full. If you do not agree, do not use the service.</p>

      <h3>2. Service Description</h3>
      <p>Caudal is a personal wealth tracking and planning tool. It allows you to record assets and liabilities, simulate investment scenarios and visualise how your net worth evolves over time.</p>

      <h3>3. Not Financial Advice</h3>
      <p><strong>Caudal does not provide financial, tax or investment advice.</strong> All information and projections shown are purely informational and educational. Simulations are based on assumptions that may not materialise. Always consult a qualified professional before making investment decisions.</p>

      <h3>4. Data Accuracy</h3>
      <p>Automatically updated fund prices come from third-party sources and may not be accurate or real-time. Caudal does not guarantee the accuracy of such information.</p>

      <h3>5. User Responsibility</h3>
      <p>You are responsible for the accuracy of the data you enter. Keep your login credentials confidential and notify us immediately if you suspect unauthorised use of your account.</p>

      <h3>6. Limitation of Liability</h3>
      <p>To the maximum extent permitted by law, Caudal shall not be liable for any loss or damage arising from the use or inability to use the service, or from financial decisions made based on information shown.</p>

      <h3>7. Changes</h3>
      <p>We may update these terms at any time. We will notify you of material changes by email. Continued use of the service after notification constitutes acceptance of the new terms.</p>

      <h3>8. Governing Law</h3>
      <p>These terms are governed by Spanish law. Any disputes shall be submitted to the courts of Spain.</p>
    </>
  );
}

export default function Legal({ type, onClose }) {
  const { lang } = useLanguage();
  const isPrivacy = type === 'privacy';

  const title = isPrivacy
    ? (lang === 'es' ? 'Política de privacidad' : 'Privacy Policy')
    : (lang === 'es' ? 'Términos y condiciones' : 'Terms & Conditions');

  return (
    <div className="legal-backdrop" onClick={onClose}>
      <div className="legal-modal" onClick={e => e.stopPropagation()}>
        <div className="legal-header">
          <h2>{title}</h2>
          <button className="legal-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <div className="legal-body">
          {isPrivacy
            ? (lang === 'es' ? <PrivacyES /> : <PrivacyEN />)
            : (lang === 'es' ? <TermsES /> : <TermsEN />)
          }
        </div>
      </div>
    </div>
  );
}
