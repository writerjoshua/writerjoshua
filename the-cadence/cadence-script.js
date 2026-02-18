// The Cadence - Updated Main Application Script with Audio

/** @type {CadenceGame} */
let cadenceGame = null;

/** @type {AudioSystem} */
let audioSystem = null;

// ===== SHARE FUNCTION =====
function shareCurrentPage() {
  const title = 'The Cadence - Solve Yourself, Again';
  const text = 'Test your mind with The Cadence puzzle suite. Complete 4 games to unlock the leaderboard!';
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({ 
      title: title,
      text: text,
      url: url 
    }).catch(err => console.log('Share failed:', err));
  } else {
    alert('Share not supported on this device');
  }
}

// ===== HIGHLIGHT ACTIVE NAV =====
function highlightActiveNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href.includes('the-cadence')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ===== AUDIO SYSTEM =====
class AudioSystem {
  constructor() {
    this.currentTrack = null;
    this.volume = 0.2; // Start at 20%
    this.isMuted = false;
    this.audioFiles = {
      game1: './game1.mp3',
      game2: './game2.mp3',
      game3: './game3.mp3',
      game4: './game4.mp3',
      congratulations: './congratulations.mp3'
    };
    
    // Load saved volume preference
    const savedVolume = localStorage.getItem('cadence-volume');
    if (savedVolume) {
      this.volume = parseFloat(savedVolume);
    }
  }

  async playTrack(trackName) {
    try {
      // Fade out current track
      if (this.currentTrack) {
        await this.fadeOut(this.currentTrack, 500);
        this.currentTrack.pause();
      }

      const audioFile = this.audioFiles[trackName];
      if (!audioFile) return;

      // Create new audio element
      const audio = new Audio(audioFile);
      audio.loop = true;
      audio.volume = this.isMuted ? 0 : this.volume;

      this.currentTrack = audio;

      // Fade in
      audio.play().catch(err => {
        console.warn('Audio playback failed:', err);
      });

      await this.fadeIn(audio, 500);
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }

  async fadeOut(audio, duration = 500) {
    return new Promise(resolve => {
      const steps = 50;
      const stepDuration = duration / steps;
      const startVolume = audio.volume;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        audio.volume = startVolume * (1 - step / steps);
        if (step >= steps) {
          clearInterval(interval);
          audio.volume = 0;
          resolve();
        }
      }, stepDuration);
    });
  }

  async fadeIn(audio, duration = 500) {
    return new Promise(resolve => {
      const steps = 50;
      const stepDuration = duration / steps;
      const targetVolume = this.isMuted ? 0 : this.volume;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        audio.volume = (step / steps) * targetVolume;
        if (step >= steps) {
          clearInterval(interval);
          audio.volume = targetVolume;
          resolve();
        }
      }, stepDuration);
    });
  }

  setVolume(percent) {
    this.volume = Math.max(0, Math.min(1, percent / 100));
    localStorage.setItem('cadence-volume', this.volume.toString());
    
    if (this.currentTrack && !this.isMuted) {
      this.currentTrack.volume = this.volume;
    }

    // Update slider
    const slider = document.getElementById('volume-slider');
    if (slider) {
      slider.value = this.volume * 100;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.currentTrack) {
      this.currentTrack.volume = this.isMuted ? 0 : this.volume;
    }

    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
    }
  }

  stop() {
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  audioSystem = new AudioSystem();
  initializeApp();
  highlightActiveNav();
});

function initializeApp() {
  // @ts-ignore - currentVolume is defined in data.js
  cadenceGame = new CadenceGame(currentVolume);
  setupEventListeners();
  setupAudioControls();
  showLanding();
}

function setupAudioControls() {
  const volumeSlider = document.getElementById('volume-slider');
  const muteBtn = document.getElementById('mute-btn');

  if (volumeSlider) {
    volumeSlider.value = audioSystem.volume * 100;
    volumeSlider.addEventListener('input', function() {
      audioSystem.setVolume(this.value);
    });
  }

  if (muteBtn) {
    muteBtn.textContent = audioSystem.isMuted ? '🔇' : '🔊';
    muteBtn.addEventListener('click', function() {
      audioSystem.toggleMute();
    });
  }
}

function setupEventListeners() {
  // Game 1: Wordle
  const wordleSubmit = document.getElementById('wordle-submit');
  if (wordleSubmit) {
    wordleSubmit.addEventListener('click', handleWordleGuess);
    const wordleInput = document.getElementById('wordle-input');
    if (wordleInput) {
      wordleInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleWordleGuess();
      });
    }
  }

  // Game 2: Word Chain
  const chainSubmit = document.getElementById('chain-submit');
  if (chainSubmit) {
    chainSubmit.addEventListener('click', handleChainGuess);
    const chainInput = document.getElementById('chain-input');
    if (chainInput) {
      chainInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleChainGuess();
      });
    }
  }

  // Game 3: Cryptogram
  const cryptoSolveBtn = document.getElementById('crypto-solve-btn');
  if (cryptoSolveBtn) {
    cryptoSolveBtn.addEventListener('click', handleCryptoSolve);
  }

  // Game 4: Sudoku
  const sudokuSubmit = document.getElementById('sudoku-submit');
  if (sudokuSubmit) {
    sudokuSubmit.addEventListener('click', handleSudokuSubmit);
  }

  // Final password
  const passwordSubmit = document.getElementById('password-submit');
  if (passwordSubmit) {
    passwordSubmit.addEventListener('click', handlePasswordSubmit);
  }

  // Leaderboard submit
  const leaderboardBtn = document.getElementById('leaderboard-submit');
  if (leaderboardBtn) {
    leaderboardBtn.addEventListener('click', submitToLeaderboard);
  }
}

function showLanding() {
  hideAllScreens();
  document.getElementById('landing').classList.remove('hidden');
  updateGameList();
  audioSystem.playTrack('congratulations'); // Opening music
}

function updateGameList() {
  const gameList = document.getElementById('game-list');
  gameList.innerHTML = '';
  
  const games = [
    { name: '1. Wordle', id: 'game-1' },
    { name: '2. Word Chain', id: 'game-2' },
    { name: '3. Cryptogram', id: 'game-3' },
    { name: '4. Sudoku', id: 'game-4' }
  ];
  
  games.forEach((game, index) => {
    const button = document.createElement('button');
    button.className = 'game-button';
    
    if (index <= cadenceGame.currentGameIndex) {
      button.textContent = game.name + ' ✓';
      button.disabled = false;
      button.addEventListener('click', () => showGame(index));
    } else {
      button.textContent = game.name + ' 🔒';
      button.disabled = true;
    }
    
    gameList.appendChild(button);
  });
  
  // Show final screen button if all games complete
  if (cadenceGame.currentGameIndex >= 4) {
    const finalButton = document.createElement('button');
    finalButton.className = 'game-button';
    finalButton.textContent = '5. Final Answer';
    finalButton.addEventListener('click', showFinal);
    gameList.appendChild(finalButton);
  }
}

function showGame(gameIndex) {
  cadenceGame.currentGameIndex = gameIndex;
  hideAllScreens();
  
  const screenId = `game-${gameIndex + 1}`;
  document.getElementById(screenId).classList.remove('hidden');
  
  // Play appropriate audio
  const audioTracks = ['game1', 'game2', 'game3', 'game4'];
  audioSystem.playTrack(audioTracks[gameIndex]);
  
  if (gameIndex === 0) initWordleGame();
  else if (gameIndex === 1) initChainGame();
  else if (gameIndex === 2) initCryptoGame();
  else if (gameIndex === 3) initSudokuGame();
}

// ===== GAME 1: WORDLE =====
function initWordleGame() {
  const game = cadenceGame.games[0];
  const feedback = document.getElementById('wordle-feedback');
  const attemptsLeft = document.getElementById('wordle-attempts');
  const historyDiv = document.getElementById('wordle-history');
  
  feedback.textContent = 'Guess the word!';
  attemptsLeft.textContent = `Attempts left: ${game.maxAttempts - game.attempts}`;
  historyDiv.innerHTML = ''; // Clear history
  
  // Show previous guesses
  game.guesses.forEach(guess => {
    const feedback = game.getFeedback(guess);
    const matched = feedback.map((f, i) => {
      if (f === 'correct') return '🟩';
      if (f === 'wrong-position') return '🟨';
      return '⬜';
    }).join('');
    
    const div = document.createElement('div');
    div.textContent = `${guess} ${matched}`;
    div.style.marginBottom = '5px';
    historyDiv.appendChild(div);
  });
  
  document.getElementById('wordle-input').value = '';
  document.getElementById('wordle-input').focus();
  updateScoreDisplay();
}

function handleWordleGuess() {
  const input = document.getElementById('wordle-input').value;
  const game = cadenceGame.games[0];
  const feedback = document.getElementById('wordle-feedback');
  const attemptsLeft = document.getElementById('wordle-attempts');
  const historyDiv = document.getElementById('wordle-history');
  
  const result = game.validateGuess(input);
  
  if (!result.valid) {
    feedback.textContent = result.message;
    return;
  }
  
  // Update history
  const feedbackItems = result.feedback.map((f, i) => {
    if (f === 'correct') return '🟩';
    if (f === 'wrong-position') return '🟨';
    return '⬜';
  }).join('');
  
  const div = document.createElement('div');
  div.textContent = `${input} ${feedbackItems}`;
  div.style.marginBottom = '5px';
  historyDiv.appendChild(div);
  
  attemptsLeft.textContent = `Attempts left: ${game.maxAttempts - game.attempts}`;
  updateScoreDisplay();
  
  if (result.correct) {
    feedback.textContent = `✓ Correct! The word is ${input}`;
    document.getElementById('wordle-submit').disabled = true;
    document.getElementById('wordle-input').disabled = true;
    
    setTimeout(() => {
      if (cadenceGame.advanceGame()) {
        updateGameList();
        showGame(1);
      }
    }, 2000);
  } else {
    feedback.textContent = '';
  }
  
  document.getElementById('wordle-input').value = '';
}

// ===== GAME 2: WORD CHAIN =====
function initChainGame() {
  const game = cadenceGame.games[1];
  renderChainDisplay();
  updateScoreDisplay();
  document.getElementById('chain-input').value = '';
  document.getElementById('chain-input').focus();
}

function renderChainDisplay() {
  const game = cadenceGame.games[1];
  const chainContainer = document.getElementById('chain-display');
  chainContainer.innerHTML = '';
  
  // Show all words in chain
  const words = [game.startWord, ...game.chain, game.endWord];
  
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'chain-item';
    
    if (index < game.chainIndex + 1) {
      // Completed word
      span.classList.add('chain-completed');
      span.textContent = word;
    } else if (index === game.chainIndex + 1) {
      // Current word
      span.classList.add('chain-current');
      span.textContent = game.getCurrentDisplay();
    } else {
      // Future word
      span.classList.add('chain-future');
      span.textContent = '?'.repeat(word.length);
    }
    
    chainContainer.appendChild(span);
    
    if (index < words.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '→';
      chainContainer.appendChild(arrow);
    }
  });
}

function handleChainGuess() {
  const input = document.getElementById('chain-input').value;
  const game = cadenceGame.games[1];
  const feedback = document.getElementById('chain-feedback');
  
  const result = game.validateGuess(input);
  
  renderChainDisplay();
  updateScoreDisplay();
  
  if (result.error) {
    feedback.textContent = '✗ Incorrect. Letter revealed.';
  } else {
    feedback.textContent = '✓ Correct!';
  }
  
  document.getElementById('chain-input').value = '';
  
  // Game complete when we reach the second-to-last word (PROTECT is auto-complete)
  if (game.chainIndex >= game.chain.length - 1) {
    document.getElementById('chain-submit').disabled = true;
    document.getElementById('chain-input').disabled = true;
    feedback.textContent = '✓ Word chain complete!';
    
    setTimeout(() => {
      if (cadenceGame.advanceGame()) {
        updateGameList();
        showGame(2);
      }
    }, 2000);
  }
}

// ===== GAME 3: CRYPTOGRAM (UPDATED) =====
function initCryptoGame() {
  const game = cadenceGame.games[2];
  renderCryptogramGrid(game);
  updateScoreDisplay();
}

function renderCryptogramGrid(game) {
  const messageDisplay = document.getElementById('crypto-message');
  const numbersDisplay = document.getElementById('crypto-numbers');
  const gridContainer = document.getElementById('crypto-grid');
  
  messageDisplay.innerHTML = '';
  numbersDisplay.innerHTML = '';
  gridContainer.innerHTML = '';
  
  // Render message with blocks and underlines (Wheel of Fortune style)
  let blockIndex = 0;
  for (let char of game.plaintext) {
    if (char === ' ' || char === "'") {
      const space = document.createElement('span');
      space.style.display = 'inline-block';
      space.style.width = '15px';
      messageDisplay.appendChild(space);
      
      numbersDisplay.appendChild(document.createElement('span'));
    } else {
      const number = game.cipher[char];
      const guessedLetter = game.guesses[number];
      
      // Message block
      const block = document.createElement('span');
      block.className = 'crypto-block';
      block.textContent = guessedLetter || '_';
      block.id = `crypto-msg-${blockIndex}`;
      messageDisplay.appendChild(block);
      
      // Number below
      const numSpan = document.createElement('span');
      numSpan.className = 'crypto-number-below';
      numSpan.textContent = number;
      numbersDisplay.appendChild(numSpan);
      
      blockIndex++;
    }
  }
  
  // Show input fields for each unique number (smaller, just for input)
  const positions = game.getPositions();
  gridContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); margin-bottom: 10px;">Click number below to guess letter:</p>';
  
  const inputGrid = document.createElement('div');
  inputGrid.style.display = 'grid';
  inputGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(45px, 1fr))';
  inputGrid.style.gap = '8px';
  inputGrid.style.marginTop = '15px';
  
  positions.forEach(pos => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'crypto-number-input';
    input.maxLength = '1';
    input.placeholder = '';
    input.id = `crypto-${pos.number}`;
    input.value = pos.playerGuess || '';
    input.disabled = pos.isRevealed;
    
    if (pos.isRevealed) {
      input.className += ' revealed';
    }
    
    const number = document.createElement('div');
    number.style.fontSize = '12px';
    number.style.color = 'var(--text-light)';
    number.style.marginTop = '4px';
    number.style.fontWeight = '600';
    number.textContent = pos.number;
    
    input.addEventListener('input', function(e) {
      const letter = e.target.value.toUpperCase();
      const result = game.inputLetter(pos.number, letter);
      
      if (letter !== '') {
        if (result.correct) {
          input.classList.add('correct');
          renderCryptogramGrid(game); // Re-render to update display
          updateScoreDisplay();
        } else {
          input.classList.add('error');
          setTimeout(() => {
            input.classList.remove('error');
          }, 500);
        }
      }
      
      // Check completion
      if (result.complete) {
        completeGame3();
      }
    });
    
    wrapper.appendChild(input);
    wrapper.appendChild(number);
    inputGrid.appendChild(wrapper);
  });
  
  gridContainer.appendChild(inputGrid);
}

function handleCryptoSolve() {
  const game = cadenceGame.games[2];
  const input = document.getElementById('crypto-solve-input').value.toUpperCase();
  const feedback = document.getElementById('crypto-feedback');
  
  if (input === game.plaintext) {
    feedback.textContent = '✓ Correct!';
    feedback.className = 'feedback correct';
    
    // Reveal all letters
    game.skip();
    document.getElementById('crypto-message').textContent = game.plaintext;
    
    // Disable all inputs
    document.querySelectorAll('.crypto-cell-input').forEach(inp => inp.disabled = true);
    document.getElementById('crypto-solve-btn').disabled = true;
    document.getElementById('crypto-skip-btn').disabled = true;
    
    setTimeout(() => {
      completeGame3();
    }, 2000);
  } else {
    feedback.textContent = '✗ Incorrect. Try again.';
    feedback.className = 'feedback error';
    game.errors++;
    updateScoreDisplay();
  }
}

function handleCryptoSkip() {
  const game = cadenceGame.games[2];
  game.errors += 4; // Major penalty
  game.skip();
  
  document.getElementById('crypto-message').textContent = game.plaintext;
  document.querySelectorAll('.crypto-cell-input').forEach(inp => inp.disabled = true);
  
  const feedback = document.getElementById('crypto-feedback');
  feedback.textContent = '⏭️ Skipped. -200 points.';
  feedback.className = 'feedback';
  
  updateScoreDisplay();
  
  setTimeout(() => {
    completeGame3();
  }, 2000);
}

function completeGame3() {
  document.getElementById('crypto-solve-btn').disabled = true;
  document.getElementById('crypto-skip-btn').disabled = true;
  document.getElementById('crypto-solve-input').disabled = true;
  
  if (cadenceGame.advanceGame()) {
    updateGameList();
    showGame(3);
  }
}

// ===== GAME 4: SUDOKU =====
function initSudokuGame() {
  const game = cadenceGame.games[3];
  renderSudokuGrid(game);
  updateScoreDisplay();
}

function renderSudokuGrid(game) {
  const container = document.getElementById('sudoku-grid');
  container.innerHTML = '';
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('input');
      cell.type = 'number';
      cell.min = '1';
      cell.max = '9';
      cell.className = 'sudoku-cell';
      cell.id = `sudoku-${i}-${j}`;
      cell.value = game.playerGrid[i][j] || '';
      cell.disabled = game.puzzle[i][j] !== 0;
      
      if (game.puzzle[i][j] !== 0) {
        cell.className += ' puzzle-cell';
      }
      
      if ((i + 1) % 3 === 0 && i < 8) cell.className += ' border-bottom';
      if ((j + 1) % 3 === 0 && j < 8) cell.className += ' border-right';
      
      cell.addEventListener('change', (e) => handleSudokuInput(e, i, j));
      container.appendChild(cell);
    }
  }
}

function handleSudokuInput(event, row, col) {
  const value = event.target.value;
  const game = cadenceGame.games[3];
  
  if (value === '') {
    game.playerGrid[row][col] = 0;
    return;
  }
  
  const number = Number(value);
  const result = game.validateCell(row, col, number);
  
  if (result.correct) {
    event.target.classList.add('correct');
    updateScoreDisplay();
  } else {
    event.target.classList.add('error');
    event.target.value = '';
    updateScoreDisplay();
    setTimeout(() => {
      event.target.classList.remove('error');
    }, 500);
  }
}

function handleSudokuSubmit() {
  const game = cadenceGame.games[3];
  const feedback = document.getElementById('sudoku-feedback');
  
  if (game.isComplete()) {
    feedback.textContent = '✓ Sudoku complete!';
    document.getElementById('sudoku-submit').disabled = true;
    
    setTimeout(() => {
      if (cadenceGame.advanceGame()) {
        updateGameList();
        showFinal();
      }
    }, 2000);
  } else {
    feedback.textContent = '✗ Sudoku is not complete yet';
  }
}

// ===== FINAL SCREEN =====
function showFinal() {
  hideAllScreens();
  document.getElementById('final-screen').classList.remove('hidden');
  
  const stats = cadenceGame.getFinalStats();
  const expectedPassword = cadenceGame.generateFinalPassword();
  
  const statsDiv = document.getElementById('final-stats');
  statsDiv.innerHTML = `
    <h2>Performance Review</h2>
    <p><strong>Total Score:</strong> ${stats.totalScore}/${stats.maxScore}</p>
    <p><strong>Total Errors:</strong> ${stats.totalErrors}</p>
    <hr>
    <h3>Breakdown:</h3>
    ${Object.entries(stats.breakdown).map(([game, data]) => 
      `<p>${game}: ${data.score} pts (${data.errors} errors)</p>`
    ).join('')}
    <hr>
    <p style="font-size: 14px; color: #666;">
      <strong>Hint:</strong> Your unlock code combines the answer from Game 1 and 3 numbers from Game 4.
    </p>
  `;
  
  audioSystem.playTrack('congratulations');
  
  document.getElementById('password-input').value = '';
  document.getElementById('password-input').focus();
}

function handlePasswordSubmit() {
  const input = document.getElementById('password-input').value;
  const isCorrect = cadenceGame.validateFinalPassword(input);
  const feedback = document.getElementById('password-feedback');
  
  if (isCorrect) {
    feedback.textContent = '✓ Correct! You have unlocked the leaderboard.';
    feedback.className = 'feedback correct';
    document.getElementById('password-submit').disabled = true;
    document.getElementById('password-input').disabled = true;
    document.getElementById('leaderboard-section').style.display = 'block';
  } else {
    feedback.textContent = '✗ Incorrect unlock code. Try again.';
    feedback.className = 'feedback error';
  }
}

function submitToLeaderboard() {
  const stats = cadenceGame.getFinalStats();
  const playerName = prompt('Enter your name (or leave blank for anonymous):') || 'Anonymous';
  const googleFormURL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
  
  // @ts-ignore - currentVolume is defined in data.js
  const params = new URLSearchParams({
    'entry.NAME_FIELD': playerName,
    'entry.SCORE_FIELD': stats.totalScore,
    'entry.ERRORS_FIELD': stats.totalErrors,
    'entry.VOLUME_FIELD': currentVolume.id
  });
  
  window.open(googleFormURL + '?' + params.toString(), '_blank');
}

function updateScoreDisplay() {
  let totalScore = 0;
  let totalErrors = 0;
  
  for (let i = 0; i < cadenceGame.games.length; i++) {
    const score = cadenceGame.calculateScore(i);
    totalScore += score;
    totalErrors += cadenceGame.games[i].errors;
  }
  
  const scoreDisplay = document.getElementById('score-display');
  const errorDisplay = document.getElementById('error-display');
  
  if (scoreDisplay) scoreDisplay.textContent = `+${totalScore}`;
  if (errorDisplay) errorDisplay.textContent = `-${totalErrors}`;
}

// ===== UTILITY FUNCTIONS =====
function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.add('hidden');
  });
}