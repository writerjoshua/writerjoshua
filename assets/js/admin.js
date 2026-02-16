// ===== ADMIN PANEL =====

function openAdminPanel() {
  if (!currentUser || !isAdmin(currentUser.email)) return;
  document.getElementById('adminModal').style.display = 'flex';
  loadAllUsers();
  loadAllComments();
}

function closeAdminModal() {
  document.getElementById('adminModal').style.display = 'none';
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tab + 'Tab').style.display = 'block';
  event.target.classList.add('active');
}

function loadAllUsers() {
  const { ref, onValue } = window.firebase;
  onValue(ref(window.firebase.database, 'users'), (snapshot) => {
    const users = snapshot.val() || {};
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    Object.entries(users).forEach(([uid, user]) => {
      const userEl = document.createElement('div');
      userEl.className = 'user-item';
      userEl.innerHTML = `
        <div class="user-item-header">
          <span>${user.avatar ? `<img src="${user.avatar}" class="user-avatar-thumb">` : '👤'}</span>
          <span class="user-item-name">${escapeHtml(user.username)}</span>
          <span class="user-item-role">${user.role || 'User'}</span>
        </div>
        <p class="user-item-email">${user.email}</p>
        <div class="user-item-actions">
          <button onclick="changeUserRole('${uid}', 'Admin')" class="admin-action-btn">Make Admin</button>
          <button onclick="changeUserRole('${uid}', 'User')" class="admin-action-btn">Make User</button>
          <button onclick="deactivateUser('${uid}')" class="admin-action-btn danger">Deactivate</button>
        </div>
      `;
      usersList.appendChild(userEl);
    });
  });
}

function loadAllComments() {
  const { ref, onValue } = window.firebase;
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = '';
  
  ['jots', 'blog-posts'].forEach(type => {
    onValue(ref(window.firebase.database, type), (snapshot) => {
      const items = snapshot.val() || {};
      Object.entries(items).forEach(([itemId, item]) => {
        const comments = item.comments || {};
        Object.entries(comments).forEach(([commentId, comment]) => {
          const commentEl = document.createElement('div');
          commentEl.className = 'comment-item';
          commentEl.innerHTML = `
            <div class="comment-item-header">
              <span class="comment-item-user">${escapeHtml(comment.username)}</span>
              <span class="comment-item-type">${type}</span>
              <span class="comment-item-date">${new Date(comment.timestamp).toLocaleDateString()}</span>
            </div>
            <p class="comment-item-text">${escapeHtml(comment.text)}</p>
            <div class="comment-item-actions">
              <button onclick="flagComment('${type}', '${itemId}', '${commentId}')" class="admin-action-btn">Flag</button>
              <button onclick="deleteComment('${type}', '${itemId}', '${commentId}')" class="admin-action-btn danger">Delete</button>
            </div>
          `;
          commentsList.appendChild(commentEl);
        });
      });
    });
  });
}

function changeUserRole(uid, newRole) {
  const { ref, set } = window.firebase;
  set(ref(window.firebase.database, `users/${uid}/role`), newRole);
  alert(`User role changed to ${newRole}`);
}

function deactivateUser(uid) {
  if (confirm('Are you sure? This will deactivate the user.')) {
    const { ref, set } = window.firebase;
    set(ref(window.firebase.database, `users/${uid}/active`), false);
    alert('User deactivated');
  }
}

function deleteComment(type, itemId, commentId) {
  if (confirm('Delete this comment?')) {
    const { ref, set } = window.firebase;
    set(ref(window.firebase.database, `${type}/${itemId}/comments/${commentId}`), null);
    alert('Comment deleted');
  }
}

function flagComment(type, itemId, commentId) {
  const { ref, set } = window.firebase;
  set(ref(window.firebase.database, `${type}/${itemId}/comments/${commentId}/flagged`), true);
  alert('Comment flagged for review');
}