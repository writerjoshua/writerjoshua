// ===== UTILITY FUNCTIONS =====

// MD5 hash for Gravatar
function md5(str) {
  let x = [], s = str.toLowerCase().trim(), i = 0;
  while (i < s.length) x[i >> 2] |= s.charCodeAt(i) << ((i++ & 3) << 3);
  x[s.length >> 2] |= 0x80 << (((s.length) & 3) << 3);
  x[(((s.length + 8) >> 6) << 4) + 14] = s.length << 3;
  
  for (i = 1, s = 0; i < x.length; i += 16) {
    let a = x[i - 1], b = -271733879, c = -1732584194, d = 271733878;
    for (let j = 0; j < 64; j++) {
      let f, g;
      if (j < 16) f = (b & c) | (~b & d), g = j;
      else if (j < 32) f = (d & b) | (~d & c), g = 5 * j + 1;
      else if (j < 48) f = b ^ c ^ d, g = 3 * j + 5;
      else f = c ^ (b | ~d), g = 7 * j;
      let t = d;
      d = c;
      c = b;
      b = b + ((a << 5 | a >> 27) + f + 0x67452301 + [0,0,0,0,271733879,1732584193,0,0,1732584194,0,0,0,271733878,0,0,0][g >> 4] + x[i + (g & 15)]) | 0;
      a = t;
    }
    x[i - 1] = a + x[i - 1] | 0;
  }
  return [x[1], x[2], x[3], x[4]].map(x => ((x >> 24) & 255).toString(16).padStart(2, '0') + ((x >> 16) & 255).toString(16).padStart(2, '0') + ((x >> 8) & 255).toString(16).padStart(2, '0') + (x & 255).toString(16).padStart(2, '0')).join('');
}

// HTML escape
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Format date and time (PST)
function formatDateTime(date, time) {
  const dateObj = new Date(`${date}T${time || '00:00'}`);
  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles'
  });
}

// Get image path (handle relative paths)
function getImagePath(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `./assets/media/${imagePath}`;
}

// Get page parameter from URL
function getPageParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('page') || 'home';
}

// Admin check
function isAdmin(email) {
  const ADMIN_EMAILS = ['connect@writerjoshua.com', 'artscience84@icloud.com'];
  return ADMIN_EMAILS.includes(email);
}

// Detect page refresh
function detectPageRefresh() {
  if (performance.navigation.type === 1) {
    clearCache();
  }
}

// Clear cache
function clearCache() {
  localStorage.removeItem('cache_jots');
  localStorage.removeItem('cache_archive');
  localStorage.removeItem('cache_projects');
}

// Cache helpers
function getCachedHTML(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  const { html, timestamp, expiryHours } = JSON.parse(cached);
  const age = (Date.now() - timestamp) / (1000 * 60 * 60);
  
  if (age > expiryHours) {
    localStorage.removeItem(key);
    return null;
  }
  return html;
}

function setCachedHTML(key, html, expiryHours = 24) {
  localStorage.setItem(key, JSON.stringify({
    html,
    timestamp: Date.now(),
    expiryHours
  }));
}

function isCacheExpired(key, expiryHours) {
  const cached = localStorage.getItem(key);
  if (!cached) return true;
  
  const { timestamp } = JSON.parse(cached);
  const age = (Date.now() - timestamp) / (1000 * 60 * 60);
  return age > expiryHours;
}