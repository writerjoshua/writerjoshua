// ===== INTERACTIONS (LIKES & COMMENTS) =====

function addLike(contentId, contentType) {
  if (!currentUser) {
    alert('Please sign in to like');
    openAuthModal();
    return;
  }

  const { ref, set } = window.firebase;
  const likePath = `${contentType}/${contentId}/likes/${currentUser.uid}`;
  
  set(ref(window.firebase.database, likePath), {
    username: currentUserProfile.username,
    avatar: currentUserProfile.avatar,
    timestamp: Date.now()
  });
  
  updateLikeDisplay(contentId, contentType);
}

function updateLikeDisplay(contentId, contentType) {
  const { ref, onValue } = window.firebase;
  const likesPath = `${contentType}/${contentId}/likes`;
  
  onValue(ref(window.firebase.database, likesPath), (snapshot) => {
    const likes = snapshot.val() || {};
    const count = Object.keys(likes).length;
    const likeBtn = document.getElementById(`like-btn-${contentId}`);
    const likeCntDisplay = document.getElementById(`like-count-${contentId}`);
    
    if (likeBtn) {
      likeBtn.textContent = likes[currentUser?.uid] ? '❤️ Unlike' : '🤍 Like';
    }
    if (likeCntDisplay) {
      likeCntDisplay.textContent = `${count} ${count === 1 ? 'like' : 'likes'}`;
    }
  });
}

function addComment(contentId, contentType) {
  if (!currentUser) {
    alert('Please sign in to comment');
    openAuthModal();
    return;
  }

  const commentText = document.getElementById(`comment-input-${contentId}`).value.trim();
  if (!commentText) return;

  const { ref, push } = window.firebase;
  const commentsPath = `${contentType}/${contentId}/comments`;
  
  push(ref(window.firebase.database, commentsPath), {
    userId: currentUser.uid,
    username: currentUserProfile.username,
    avatar: currentUserProfile.avatar,
    text: commentText,
    timestamp: Date.now()
  });

  document.getElementById(`comment-input-${contentId}`).value = '';
  loadComments(contentId, contentType);
}

function loadComments(contentId, contentType) {
  const { ref, onValue } = window.firebase;
  const commentsPath = `${contentType}/${contentId}/comments`;
  
  onValue(ref(window.firebase.database, commentsPath), (snapshot) => {
    const comments = snapshot.val() || {};
    const commentsContainer = document.getElementById(`comments-${contentId}`);
    
    if (!commentsContainer) return;
    
    commentsContainer.innerHTML = '';
    
    Object.values(comments).sort((a, b) => b.timestamp - a.timestamp).forEach(comment => {
      const commentEl = document.createElement('div');
      commentEl.className = 'comment';
      commentEl.innerHTML = `
        <div class="comment-header">
          <span class="comment-avatar">${comment.avatar ? `<img src="${comment.avatar}" style="width:24px; height:24px; border-radius: 50%; object-fit: cover;">` : '👤'}</span>
          <span class="comment-username">${escapeHtml(comment.username)}</span>
          <span class="comment-time">${new Date(comment.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
      `;
      commentsContainer.appendChild(commentEl);
    });
  });
}

function renderLikesAndComments(contentId, contentType) {
  return `
    <div class="interactions">
      <div class="likes-section">
        <button id="like-btn-${contentId}" class="like-btn" onclick="addLike('${contentId}', '${contentType}')">🤍 Like</button>
        <span id="like-count-${contentId}" class="like-count">0 likes</span>
      </div>
      
      <div class="comments-section">
        <h4>Comments</h4>
        <div class="comment-input-group">
          <input type="text" id="comment-input-${contentId}" placeholder="Add a comment..." class="comment-input" maxlength="500">
          <button onclick="addComment('${contentId}', '${contentType}')" class="comment-btn">Post</button>
        </div>
        <div id="comments-${contentId}" class="comments-list"></div>
      </div>
    </div>
  `;
}