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
        await this.fadeOut(this.currentTrack, 700); // 500ms → 700ms (+40%)
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

      await this.fadeIn(audio, 700); // 500ms → 700ms (+40%)
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

function hardReset() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    localStorage.clear();
    // Reinitialize with fresh game objects
    cadenceGame = new CadenceGame(currentVolume);
    // Force reinit of all games
    cadenceGame.games = [
      new WordleGame(cadenceGame.puzzles.wordle.answer),
      new WordChainGame(cadenceGame.puzzles.wordChain.startWord, cadenceGame.puzzles.wordChain.chain, cadenceGame.puzzles.wordChain.endWord, cadenceGame.puzzles.wordChain.alternatives),
      new CryptogramGame(cadenceGame.puzzles.cryptogram.plaintext, 3),
      new SudokuGame(cadenceGame.puzzles.sudoku.puzzle, cadenceGame.puzzles.sudoku.solution)
    ];
    cadenceGame.currentGameIndex = -1;
    updateGameList();
    showLanding();
  }
}

function continueToNextGame() {
  if (cadenceGame.advanceGame()) {
    updateGameList();
    showGame(cadenceGame.currentGameIndex);
  }
}

function updateGameList() {
  const gameList = document.getElementById('game-list');
  gameList.innerHTML = '';
  
  const games = [
    { name: '1. Passkey', id: 'game-1' },
    { name: '2. Chained Lock', id: 'game-2' },
    { name: '3. Structural Integrity', id: 'game-3' },
    { name: '4. Digit Matrix', id: 'game-4' }
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
  historyDiv.innerHTML = '';
  
  // Show previous guesses
  game.guesses.forEach(guess => {
    const guessedFeedback = game.getFeedback(guess);
    const matched = guessedFeedback.map((f, i) => {
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
  document.getElementById('wordle-submit').disabled = false;
  document.getElementById('wordle-input').disabled = false;
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
  const feedbackItems = result.feedback ? result.feedback.map((f, i) => {
    if (f === 'correct') return '🟩';
    if (f === 'wrong-position') return '🟨';
    return '⬜';
  }).join('') : '';
  
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
    
    // Show continue button
    const continueBtn = document.createElement('button');
    continueBtn.className = 'game-button';
    continueBtn.textContent = 'Continue →';
    continueBtn.style.marginTop = '15px';
    continueBtn.onclick = continueToNextGame;
    document.getElementById('wordle-input').parentElement.appendChild(continueBtn);
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
  
  // Show all words in chain (PROTECT always complete at end)
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
    } else if (index === words.length - 1) {
      // PROTECT (final word) always shown as complete
      span.classList.add('chain-completed');
      span.textContent = word;
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
    
    // Show continue button
    if (!document.querySelector('.chain-continue-btn')) {
      const continueBtn = document.createElement('button');
      continueBtn.className = 'game-button chain-continue-btn';
      continueBtn.textContent = 'Continue →';
      continueBtn.style.marginTop = '15px';
      continueBtn.onclick = continueToNextGame;
      document.getElementById('chain-input').parentElement.appendChild(continueBtn);
    }
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
  messageDisplay.innerHTML = '';
  
  // Split plaintext into words
  const words = game.plaintext.split(' ');
  
  words.forEach(word => {
    const wordGroup = document.createElement('div');
    wordGroup.style.display = 'inline-flex';
    wordGroup.style.flexDirection = 'column';
    wordGroup.style.alignItems = 'center';
    wordGroup.style.marginRight = '20px';
    wordGroup.style.marginBottom = '20px';
    
    // Input boxes row
    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.gap = '6px';
    inputRow.style.marginBottom = '8px';
    
    // Numbers row
    const numberRow = document.createElement('div');
    numberRow.style.display = 'flex';
    numberRow.style.gap = '8px';
    numberRow.style.fontSize = '12px';
    numberRow.style.fontWeight = '600';
    numberRow.style.color = 'var(--text-light)';
    numberRow.style.letterSpacing = '2px';
    
    for (let char of word) {
      if (char === "'") {
        const apostrophe = document.createElement('span');
        apostrophe.textContent = "'";
        apostrophe.style.fontSize = '18px';
        inputRow.appendChild(apostrophe);
        numberRow.appendChild(document.createTextNode("'"));
      } else {
        const number = game.cipher[char];
        const guessedLetter = game.guesses[number];
        
        // Input box for this letter
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'crypto-letter-box';
        input.maxLength = '1';
        input.id = `crypto-input-${number}`;
        input.value = guessedLetter || '';
        input.disabled = game.guesses.hasOwnProperty(number);
        input.placeholder = '';
        
        if (game.guesses.hasOwnProperty(number)) {
          input.style.background = 'var(--bg-light)';
          input.style.cursor = 'default';
        }
        
        input.addEventListener('input', function(e) {
          const letter = e.target.value.toUpperCase();
          if (letter) {
            const result = game.inputLetter(number, letter);
            
            if (result.correct) {
              input.classList.add('correct');
              input.classList.remove('error');
              updateScoreDisplay();
              
              if (result.complete) {
                completeGame3();
              }
            } else {
              input.classList.add('error');
              input.value = '';
              setTimeout(() => input.classList.remove('error'), 300);
            }
          }
        });
        
        inputRow.appendChild(input);
        
        // Number below
        const numSpan = document.createElement('span');
        numSpan.style.display = 'inline-block';
        numSpan.style.minWidth = '24px';
        numSpan.style.textAlign = 'center';
        numSpan.textContent = number;
        numberRow.appendChild(numSpan);
      }
    }
    
    wordGroup.appendChild(inputRow);
    wordGroup.appendChild(numberRow);
    messageDisplay.appendChild(wordGroup);
  });
  
  // Solve section below
  const gridContainer = document.getElementById('crypto-grid');
  gridContainer.innerHTML = '';
  
  const solveSection = document.createElement('div');
  solveSection.className = 'crypto-solve-section';
  solveSection.innerHTML = '<p>Or type the full answer here:</p>';
  
  const solveInput = document.createElement('input');
  solveInput.type = 'text';
  solveInput.id = 'crypto-solve-input';
  solveInput.className = 'game-input';
  solveInput.placeholder = 'Type the full message...';
  solveSection.appendChild(solveInput);
  
  gridContainer.appendChild(solveSection);
  
  const feedback = document.createElement('div');
  feedback.id = 'crypto-feedback';
  feedback.className = 'feedback';
  gridContainer.appendChild(feedback);
  
  const solveBtn = document.createElement('button');
  solveBtn.id = 'crypto-solve-btn';
  solveBtn.className = 'game-button';
  solveBtn.textContent = '✓ Solve';
  solveBtn.onclick = handleCryptoSolve;
  gridContainer.appendChild(solveBtn);
  
  const skipLink = document.createElement('p');
  skipLink.style.textAlign = 'center';
  skipLink.style.marginTop = '10px';
  skipLink.innerHTML = '<a href="#" onclick="handleCryptoSkip(); return false;" style="color: var(--primary); font-size: 14px;">Skip (-200 pts)</a>';
  gridContainer.appendChild(skipLink);
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
    
    // Update all blocks
    document.querySelectorAll('[data-number]').forEach(block => {
      const number = block.getAttribute('data-number');
      block.textContent = game.letterToNumber[number];
      block.disabled = true;
    });
    
    document.getElementById('crypto-solve-btn').disabled = true;
    document.getElementById('crypto-solve-input').disabled = true;
    
    completeGame3();
  } else {
    feedback.textContent = '✗ Incorrect. Try again.';
    feedback.className = 'feedback error';
    game.errors++;
    updateScoreDisplay();
  }
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
  
  document.querySelectorAll('[id^="crypto-input-"]').forEach(inp => inp.disabled = true);
  
  const feedback = document.getElementById('crypto-feedback');
  feedback.textContent = '⏭️ Skipped. -200 points.';
  feedback.className = 'feedback';
  
  document.getElementById('crypto-solve-btn').disabled = true;
  document.getElementById('crypto-solve-input').disabled = true;
  
  updateScoreDisplay();
  
  // Show continue button
  if (!document.querySelector('.crypto-continue-btn')) {
    const continueBtn = document.createElement('button');
    continueBtn.className = 'game-button crypto-continue-btn';
    continueBtn.textContent = 'Continue →';
    continueBtn.style.marginTop = '15px';
    continueBtn.onclick = continueToNextGame;
    document.getElementById('crypto-solve-input').parentElement.appendChild(continueBtn);
  }
}

function completeGame3() {
  document.getElementById('crypto-solve-btn').disabled = true;
  document.getElementById('crypto-solve-input').disabled = true;
  
  // Show continue button
  const continueBtn = document.createElement('button');
  continueBtn.className = 'game-button';
  continueBtn.textContent = 'Continue →';
  continueBtn.style.marginTop = '15px';
  continueBtn.onclick = continueToNextGame;
  document.getElementById('crypto-solve-input').parentElement.appendChild(continueBtn);
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
  const playerEmail = prompt('Enter your email:') || '';
  const playerName = prompt('Enter your name (or leave blank for anonymous):') || 'Anonymous';
  
  const googleFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLScBt1JL312beLGEq1ToYAdOYNIXMyHNrfdSWyaH5A9EWidqBw/formResponse';
  
  const params = new URLSearchParams({
    'entry.468873582': playerName,                 // Player Name
    'entry.1095360262': stats.totalScore,          // Points Earned
    'entry.1976953641': stats.totalErrors,         // Errors
    'entry.1496219444': 'Intimidation',            // Challenge Name
    'entry.1964400523': stats.totalScore           // Total Score (defining metric)
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