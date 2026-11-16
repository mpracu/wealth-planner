// Thin wrapper over the gtag snippet that Layout.astro already loads.
// The site used to initialise a second analytics client here with a
// placeholder ID (G-XXXXXXXXXX), so input events never reached the real
// property. Sending through the page's own gtag keeps one client, one ID.
const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag(...args);
};

const ReactGA = {
  event({ category, action, label, value }) {
    gtag('event', action, { event_category: category, event_label: label, value });
  },
  pageview(path, title) {
    gtag('event', 'page_view', { page_path: path, page_title: title, page_location: window.location.href });
  },
};

export default ReactGA;
