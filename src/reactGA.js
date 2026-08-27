import * as ReactGAModule from 'react-ga4'

// Vite's CJS interop can wrap react-ga4's default export in an extra
// `.default` layer depending on the bundler pass; drill down until we find
// the actual instance (the one with an `initialize` method).
let ReactGA = ReactGAModule
while (ReactGA && typeof ReactGA.initialize !== 'function' && ReactGA.default) {
  ReactGA = ReactGA.default
}

export default ReactGA
