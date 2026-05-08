// Basic web bundle for Khoj Browser
window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="height: 60px; background: #f0f0f0; border-bottom: 1px solid #ccc; display: flex; align-items: center; padding: 0 16px;">
          <button id="homeBtn" style="margin-right: 8px; padding: 8px 12px; border: 1px solid #ccc; background: white; cursor: pointer;">🏠 Home</button>
          <input id="urlInput" type="text" placeholder="Search or type URL" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
          <button id="goBtn" style="margin-left: 8px; padding: 8px 16px; border: 1px solid #ccc; background: white; cursor: pointer;">Go</button>
        </div>
        <div style="flex: 1; background: white;">
          <iframe id="contentFrame" style="width: 100%; height: 100%; border: none;" src="about:blank"></iframe>
        </div>
      </div>
    `;

    // Basic functionality
    const homeBtn = document.getElementById('homeBtn');
    const urlInput = document.getElementById('urlInput');
    const goBtn = document.getElementById('goBtn');
    const contentFrame = document.getElementById('contentFrame');

    const homeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Khoj Browser</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa; }
            .container { text-align: center; max-width: 600px; padding: 40px; }
            .logo { font-size: 48px; font-weight: 700; color: #1a73e8; margin-bottom: 16px; }
            .subtitle { color: #5f6368; font-size: 18px; margin-bottom: 32px; }
            .search-box { width: 100%; padding: 12px 16px; font-size: 16px; border: 1px solid #dadce0; border-radius: 24px; outline: none; }
            .search-box:focus { border-color: #1a73e8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Khoj</div>
            <div class="subtitle">Search or type a URL to get started</div>
            <input type="text" class="search-box" placeholder="Search Google or type a URL" />
          </div>
        </body>
      </html>
    `;

    function loadContent(url) {
      if (!url || url === 'home') {
        contentFrame.srcdoc = homeContent;
        urlInput.value = '';
      } else if (url.startsWith('http://') || url.startsWith('https://')) {
        contentFrame.src = url;
        urlInput.value = url;
      } else {
        // Treat as search query
        contentFrame.src = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        urlInput.value = url;
      }
    }

    homeBtn.addEventListener('click', () => loadContent('home'));
    goBtn.addEventListener('click', () => loadContent(urlInput.value));
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') loadContent(urlInput.value);
    });

    // Load home page initially
    loadContent('home');
  }
});
