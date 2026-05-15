export const HOME_ROUTE = 'khoj://home';

/** Data-URL new-tab page used inside Electron `<webview>` guests. */
export function getHomeDataUrl(): string {
  const html = [
    '<!doctype html><html><head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<title>New Tab</title>',
    '<style>',
    'html,body{height:100%;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fff}',
    '.wrap{height:100%;display:grid;place-items:center}',
    '.card{width:min(720px,calc(100vw - 48px));text-align:center}',
    '.logo{font-size:44px;font-weight:700;color:rgba(0,0,0,.82);margin-bottom:12px}',
    '.sub{color:rgba(0,0,0,.6);font-size:14px;margin-bottom:28px}',
    '.search-box{width:100%;max-width:584px;height:44px;border:1px solid #dfe1e5;border-radius:24px;padding:0 16px;font-size:16px;outline:none;box-shadow:0 1px 6px rgba(32,33,36,.28)}',
    '</style></head><body>',
    '<div class="wrap"><div class="card">',
    '<div class="logo">Khoj</div>',
    '<div class="sub">Search the web or enter a URL</div>',
    '<input type="text" class="search-box" id="searchInput" placeholder="Search or type a URL" autofocus />',
    '</div></div>',
    '<script>',
    'const searchInput=document.getElementById("searchInput");',
    'function isSearchQuery(input){const t=input.trim();',
    'if(t.startsWith("http://")||t.startsWith("https://"))return false;',
    'if(t.includes(" "))return true;',
    'if(/^[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}$/.test(t))return false;',
    'return !t.includes(".");}',
    'function handleSearch(){const q=searchInput.value.trim();if(!q)return;',
    'const targetUrl=isSearchQuery(q)?"https://www.google.com/search?q="+encodeURIComponent(q):(q.startsWith("http")?q:"https://"+q);',
    'window.parent.postMessage({type:"navigate",url:targetUrl},"*");}',
    'searchInput.addEventListener("keydown",function(e){if(e.key==="Enter")handleSearch();});',
    '</script></body></html>',
  ].join('');
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

export function toWebviewSrc(url: string): string {
  if (url === HOME_ROUTE) {
    return getHomeDataUrl();
  }
  return url;
}

export function isInternalRoute(url: string): boolean {
  return url.startsWith('khoj://');
}
