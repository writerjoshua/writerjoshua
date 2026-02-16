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

// Load Jots (JSON items as cards)
function loadJSON(filename, type) {
  const cacheKey = `cache_${filename}`;
  const expiryHours = 24;
  
  const cachedHtml = getCachedHTML(cacheKey);
  if (cachedHtml) {
    document.getElementById('content').innerHTML = cachedHtml;
    return;
  }

  fetch(`./assets/pages/${filename}.json`)
    .then(response => {
      if (!response.ok) throw new Error('Data not found');
      return response.json();
    })
    .then(data => renderJotsCards(data, type, cacheKey, expiryHours))
    .catch(error => showError(`Error loading ${filename}: ${error.message}`));
}

// Render Jots as cards
function renderJotsCards(data, type, cacheKey, expiryHours) {
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
      <div class="jot">
        <h2>${escapeHtml(item.title)}</h2>
        <p class="item-meta">${formatDateTime(item.date, item.time)}</p>
        ${window.md.render(item.content)}
        ${item.image ? `<img src="${getImagePath(item.image)}" alt="${escapeHtml(item.title)}" class="item-image">` : ''}
        ${renderLikesAndComments(itemId, 'jots')}
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
    updateLikeDisplay(itemId, 'jots');
    loadComments(itemId, 'jots');
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
    // Jots: display cards from jots.json
    loadJSON('jots', 'jots');
  } else if (page === 'archive') {
    // Blog: display recent blog post md files from ./blog/
    loadBlogArchive();
  } else if (page === 'projects') {
    // Projects: display project md files
    loadProjectsArchive();
  } else {
    // Regular pages from ./assets/pages/
    loadMarkdown(page);
  }

  highlightActiveNav();
  window.scrollTo(0, 0);
}

// Load blog archive - reads blog post MD files
function loadBlogArchive() {
  // For now, fetch the archive.json that lists blog posts
  const cacheKey = 'cache_archive';
  const cachedHtml = getCachedHTML(cacheKey);
  
  if (cachedHtml) {
    document.getElementById('content').innerHTML = cachedHtml;
    return;
  }

  fetch(`./assets/pages/archive.json`)
    .then(response => {
      if (!response.ok) throw new Error('Blog archive not found');
      return response.json();
    })
    .then(data => renderBlogArchive(data, cacheKey))
    .catch(error => showError(`Error loading blog archive: ${error.message}`));
}

// Render blog archive by fetching MD files from ./blog/
function renderBlogArchive(data, cacheKey) {
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

  let contentHtml = html;
  let loadedCount = 0;

  sorted.forEach(item => {
    const itemId = item.id || item.title;
    const year = item.date.substring(0, 4);
    const monthDay = item.date.substring(5);
    const mdFile = `./blog/${year}/${monthDay}-${item.slug || item.id}.md`;
    
    // Fetch the MD file
    fetch(mdFile)
      .then(response => {
        if (!response.ok) throw new Error('File not found');
        return response.text();
      })
      .then(content => {
        contentHtml += `
          <div class="blog-post">
            <h2>${escapeHtml(item.title)}</h2>
            <p class="item-meta">${formatDateTime(item.date, item.time)}</p>
            ${window.md.render(content)}
            ${item.image ? `<img src="${getImagePath(item.image)}" alt="${escapeHtml(item.title)}" class="item-image">` : ''}
            ${renderLikesAndComments(itemId, 'blog-posts')}
          </div>
        `;
        loadedCount++;
        if (loadedCount === sorted.length) {
          finishBlogRender(contentHtml, data, cacheKey);
        }
        updateLikeDisplay(itemId, 'blog-posts');
        loadComments(itemId, 'blog-posts');
      })
      .catch(err => {
        console.error(`Error loading ${mdFile}:`, err);
        loadedCount++;
        if (loadedCount === sorted.length) {
          finishBlogRender(contentHtml, data, cacheKey);
        }
      });
  });
  
  if (sorted.length === 0) {
    finishBlogRender(contentHtml, data, cacheKey);
  }
}

function finishBlogRender(html, data, cacheKey) {
  if (data.outro) {
    const outro = data.outro.replace(/\\n/g, '\n');
    html += window.md.render(outro);
  }

  document.getElementById('content').innerHTML = html;
  setCachedHTML(cacheKey, html, 720);
}

// Load projects - display 4 specific project MD files
function loadProjectsArchive() {
  const cacheKey = 'cache_projects';
  const cachedHtml = getCachedHTML(cacheKey);
  
  if (cachedHtml) {
    document.getElementById('content').innerHTML = cachedHtml;
    return;
  }

  const projectFiles = [
    'seejoshsphotos',
    'ai-architecture-lab',
    'soulseesbest',
    'the-inkwell'
  ];

  renderProjectsArchive(projectFiles, cacheKey);
}

// Render projects by fetching 4 specific MD files
function renderProjectsArchive(projectFiles, cacheKey) {
  let html = '';
  let loadedCount = 0;

  projectFiles.forEach(projectFile => {
    const mdFile = `./assets/pages/${projectFile}.md`;
    
    // Fetch the MD file
    fetch(mdFile)
      .then(response => {
        if (!response.ok) throw new Error('File not found');
        return response.text();
      })
      .then(content => {
        const itemId = projectFile;
        html += `
          <div class="project">
            <h2>${escapeHtml(projectFile.replace(/-/g, ' '))}</h2>
            ${window.md.render(content)}
            ${renderLikesAndComments(itemId, 'projects')}
          </div>
        `;
        loadedCount++;
        if (loadedCount === projectFiles.length) {
          finishProjectsRender(html, cacheKey);
        }
        updateLikeDisplay(itemId, 'projects');
        loadComments(itemId, 'projects');
      })
      .catch(err => {
        console.error(`Error loading ${mdFile}:`, err);
        loadedCount++;
        if (loadedCount === projectFiles.length) {
          finishProjectsRender(html, cacheKey);
        }
      });
  });
}

function finishProjectsRender(html, cacheKey) {
  document.getElementById('content').innerHTML = html;
  setCachedHTML(cacheKey, html, 720);
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