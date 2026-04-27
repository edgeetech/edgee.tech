// Import all styles
import './assets/css/style.css';
import './assets/css/tooplate-style.css';
import './assets/css/animate.css';
import './assets/css/owl.carousel.css';
import './assets/css/owl.theme.default.min.css';
import './assets/css/bootstrap.min.css';

// Import library styles
import './assets/lib/lightbox/css/lightbox.min.css';
import './assets/lib/slick/slick.css';

// Get the base path (handles both local and GitHub Pages)
const basePath = import.meta.env.BASE_URL || '/';

// Load scripts sequentially to ensure dependencies are loaded in order
function loadScriptSequential(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = basePath + src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Load scripts in order after DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load jQuery first
    await loadScriptSequential('js/jquery.js');
    
    // Load jQuery plugins (depend on jQuery)
    await loadScriptSequential('js/bootstrap.min.js');
    await loadScriptSequential('js/jquery.sticky.js');
    await loadScriptSequential('js/jquery.stellar.min.js');
    await loadScriptSequential('js/wow.min.js');
    await loadScriptSequential('js/smoothscroll.js');
    await loadScriptSequential('js/owl.carousel.min.js');
    
    // Load custom script (depends on all plugins above)
    await loadScriptSequential('js/custom.js');
    
    // Load additional libraries
    await loadScriptSequential('lib/lightbox/js/lightbox.min.js');
    await loadScriptSequential('lib/slick/slick.min.js');
  } catch (error) {
    console.error('Error loading scripts:', error);
  }
});

console.log('EdgeeTech website loaded');
