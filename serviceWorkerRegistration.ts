
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      let swUrl = ''; 
      
      try {
        // Attempt 1: Resolve sw.js relative to window.location.href.
        // This usually overrides <base> tags.
        if (window.location.href) {
             swUrl = new URL('./sw.js', window.location.href).toString();
        }
      } catch (error) {
        console.warn('SW URL construction failed:', error);
      }

      // Attempt 2: Fallback manual construction if URL() failed or href was invalid.
      // This ensures we don't fall back to a bare './sw.js' which is susceptible to <base href="..."> 
      // pointing to a different domain (like ai.studio).
      if (!swUrl && window.location.origin && window.location.pathname) {
          const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
          swUrl = `${window.location.origin}${path}sw.js`;
      }

      // If we still don't have a URL (e.g. weird iframe state), default to relative but expect issues.
      if (!swUrl) swUrl = './sw.js';
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('New content is available; please refresh.');
                } else {
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          // Suppress specific origin mismatch errors common in cloud preview environments
          if (error.message && (error.message.includes('origin') || error.message.includes('scriptURL'))) {
              console.warn('Service Worker registration skipped due to environment mismatch (ignoring).');
          } else {
              console.error('Error during service worker registration:', error);
          }
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
