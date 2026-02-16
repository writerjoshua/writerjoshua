// ===== AUTHENTICATION MODULE =====
// Firebase auth functions for Google, X (Twitter), and Anonymous sign-in

function signInWithGoogle() {
  const provider = new window.firebase.GoogleAuthProvider();
  window.firebase.signInWithPopup(window.firebase.auth, provider)
    .then(userCredential => {
      currentUser = userCredential.user;
      createOrLoadUserProfile(currentUser);
    })
    .catch(error => {
      document.getElementById('authError').textContent = error.message;
    });
}

function signInWithTwitter() {
  const provider = new window.firebase.TwitterAuthProvider();
  window.firebase.signInWithPopup(window.firebase.auth, provider)
    .then(userCredential => {
      currentUser = userCredential.user;
      createOrLoadUserProfile(currentUser);
    })
    .catch(error => {
      document.getElementById('authError').textContent = error.message;
    });
}

function signInAnon() {
  window.firebase.signInAnonymously(window.firebase.auth)
    .then(userCredential => {
      currentUser = userCredential.user;
      currentUserProfile = {
        username: 'Anonymous',
        avatar: `https://www.gravatar.com/avatar/anonymous?d=retro`,
        avatar_style: 'retro',
        bio: '',
        email: 'anonymous@writerjoshua.local',
        role: 'User',
        is_anonymous: true,
        created_at: Date.now()
      };
      closeAuthModal();
      updateUserUI();
    })
    .catch(error => {
      document.getElementById('authError').textContent = error.message;
    });
}

function createOrLoadUserProfile(user) {
  const { ref, onValue } = window.firebase;
  onValue(ref(window.firebase.database, `users/${user.uid}`), (snapshot) => {
    if (snapshot.exists()) {
      currentUserProfile = snapshot.val();
    } else {
      const gravatarUrl = `https://www.gravatar.com/avatar/${md5(user.email.toLowerCase())}?d=retro`;
      currentUserProfile = {
        username: user.displayName || user.email.split('@')[0],
        avatar: gravatarUrl,
        avatar_style: 'retro',
        bio: '',
        email: user.email,
        role: isAdmin(user.email) ? 'Admin' : 'User',
        created_at: Date.now()
      };
      saveUserProfile(user.uid, currentUserProfile);
    }
    closeAuthModal();
    updateUserUI();
  }, { onlyOnce: true });
}

function signOutUser() {
  window.firebase.signOut(window.firebase.auth)
    .then(() => {
      currentUser = null;
      currentUserProfile = null;
      closeProfileModal();
      updateUserUI();
    })
    .catch(error => {
      console.error('Sign out error:', error);
    });
}

function loadUserProfile(uid) {
  const { ref, onValue } = window.firebase;
  onValue(ref(window.firebase.database, `users/${uid}`), (snapshot) => {
    if (snapshot.exists()) {
      currentUserProfile = snapshot.val();
      updateUserUI();
    }
  });
}

function saveUserProfile(uid, profile) {
  const { ref, set } = window.firebase;
  set(ref(window.firebase.database, `users/${uid}`), profile);
}

function updateProfile() {
  if (!currentUser) return;
  
  const username = document.getElementById('editUsername').value || currentUserProfile.username;
  const avatarStyle = document.getElementById('avatarStyle').value;
  const bio = document.getElementById('editBio').value;
  const gravatarUrl = `https://www.gravatar.com/avatar/${md5(currentUser.email.toLowerCase())}?d=${avatarStyle}`;

  currentUserProfile = { 
    ...currentUserProfile, 
    username, 
    avatar_style: avatarStyle,
    avatar: gravatarUrl,
    bio 
  };
  
  saveUserProfile(currentUser.uid, currentUserProfile);
  closeProfileModal();
  updateUserUI();
}

function updateUserUI() {
  const authBtn = document.getElementById('authBtn');
  const userMenu = document.getElementById('userMenu');
  const userInfo = document.getElementById('userInfo');
  const adminBtn = document.getElementById('adminBtn');

  if (currentUser && currentUserProfile) {
    authBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    userInfo.innerHTML = `<div class="user-avatar">${currentUserProfile.avatar ? `<img src="${currentUserProfile.avatar}" style="width:32px; height:32px; border-radius: 50%;">` : '👤'}</div><div class="user-name">${currentUserProfile.username}</div>`;
    
    if (isAdmin(currentUser.email)) {
      adminBtn.style.display = 'block';
    } else {
      adminBtn.style.display = 'none';
    }
  } else {
    authBtn.style.display = 'block';
    userMenu.style.display = 'none';
  }
}