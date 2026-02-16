// ===== MAIN PAGE LOGIC =====

// Load markdown page
function loadMarkdown(page) {
  const cacheKey = `cache_${page}`;
  const cachedHtml = getCachedHTML(cacheKey);
  
  if (cachedHtml) {
    document.getElementById('content').innerHTML = cachedHtml;
    return;
  }

  fetch(`./assets/pages/${page}.md`)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      return response.text();
    })
    .then(content => {
      const metaMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let metadata = { title: page, description: '' };
      
      if (metaMatch) {
        const yaml = metaMatch[1];
        const titleMatch = yaml.match(/title:\s*(.+)/);
        const descMatch = yaml.match(/description:\s*(.+)/);
        if (titleMatch) metadata.title = titleMatch[1].trim();
        if (descMatch) metadata.description = descMatch[1].trim();
      }
      
      currentPageMetadata = metadata;
      window.currentPageMetadata = metadata;
      
      const contentWithoutMeta = content.replace(/^---\n[\s\S]*?\n---\n/, '');
      let html = window.md.render(contentWithoutMeta);
      html += renderLikesAndComments(page, 'blog-posts');
      
      document.getElementById('content').innerHTML = html;
      setCachedHTML(cacheKey, html, 24);
      
      updateLikeDisplay(page, 'blog-posts');
      loadComments(page, 'blog-posts');
    })
    .catch(error => showError(`Error loading page: ${error.message}`));
}

// Load JSON (jots, archive, projects)
function loadJSON(filename, type) {
  const cacheKey = `cache_${filename}`;
  const expiryHours = (type === 'jots') ? 24 : 720;
  
  const cachedHtml = getCachedHTML(cacheKey);
  if (cachedHtml) {
    document.getElementById('content').innerHTML = cachedHtml;
    return;
  }

  fetch(`./ assets/pages/${filename}.json`)
    .then(response => {
      if (!response.ok) throw new Error('Data not found');
      return response.json();
    })
    .then(data => renderJSON(data, filename, type, cacheKey, expiryHours))
    .catch(error => showError(`Error loading ${filename}: ${error.message}`));
}

// Render JSON content
function renderJSON(data, filename, type, cacheKey, expiryHours) {
  let html = '';
  
  if (data.intro) {
    const intro = data.intro.replace(/\\n/g, '\n');
    html += window.md.render(intro);
  }

  const sorted = (data.items || []).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateB - dateA;
  });

  sorted.forEach(item => {
    const itemId = item.id || item.title;
    html += `
      <div class="${type.slice(0, -1)}">
        <h2>${escapeHtml(item.title)}</h2>
        <p class="item-meta">${formatDateTime(item.date, item.time)}</p>
        ${window.md.render(item.content)}
        ${item.image ? `<img src="${getImagePath(item.image)}" alt="${escapeHtml(item.title)}" class="item-image">` : ''}
        ${renderLikesAndComments(itemId, type)}
      </div>
    `;
  });

  if (data.outro) {
    const outro = data.outro.replace(/\\n/g, '\n');
    html += window.md.render(outro);
  }

  document.getElementById('content').innerHTML = html;
  setCachedHTML(cacheKey, html, expiryHours);
  
  sorted.forEach(item => {
    const itemId = item.id || item.title;
    updateLikeDisplay(itemId, type);
    loadComments(itemId, type);
  });
}

// Route handler
function handleRoute() {
  const page = getPageParam();

  if (page.startsWith('profile_')) {
    const username = page.replace('profile_', '');
    loadPublicProfile(username);
    return;
  }

  if (page === 'jots') {
    loadJSON('jots', 'jots');
  } else if (page === 'archive') {
    loadJSON('archive', 'archive');
  } else if (page === 'projects') {
    loadJSON('projects', 'projects');
  } else if (page.match(/^\d{4}-\d{2}-\d{2}-/)) {
    // Blog post: YYYY-MM-DD-slug format
    const year = page.substring(0, 4);
    const month = page.substring(5, 7);
    const slug = page.substring(11); // Skip "YYYY-MM-DD-"
    loadMarkdown(`../../../blog/${year}/${month}-${page.substring(5)}`);
  } else {
    // Regular page
    loadMarkdown(page);
  }

  highlightActiveNav();
  window.scrollTo(0, 0);
}

// Highlight active navigation link
function highlightActiveNav() {
  const page = getPageParam();
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.href.includes(`page=${page}`)) {
      link.classList.add('active');
    }
  });
}

// Load public profile
function loadPublicProfile(username) {
  const { ref, onValue } = window.firebase;
  
  onValue(ref(window.firebase.database, 'users'), (snapshot) => {
    const users = snapshot.val() || {};
    let foundUser = null;
    
    for (let uid in users) {
      if (users[uid].username === username) {
        foundUser = users[uid];
        break;
      }
    }
    
    if (foundUser) {
      const html = `
        <div class="public-profile">
          <div class="profile-header">
            <div class="profile-avatar" style="font-size: 4em;">${foundUser.avatar ? `<img src="${foundUser.avatar}" style="width:200px; height:200px; border-radius: 50%; object-fit: cover;">` : '👤'}</div>
            <h1>${escapeHtml(foundUser.username)}</h1>
            <p class="profile-bio">${escapeHtml(foundUser.bio)}</p>
          </div>
        </div>
      `;
      
      document.getElementById('content').innerHTML = html;
      highlightActiveNav();
    } else {
      showError(`User not found: ${username}`);
    }
  });
}

// Show error
function showError(message) {
  document.getElementById('content').innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

// Initialize
detectPageRefresh();
document.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('popstate', handleRoute);
window.addEventListener('hashchange', handleRoute);