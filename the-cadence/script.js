// The Cadence - Main Application Script

let cadenceGame = null;

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  cadenceGame = new CadenceGame(currentVolume);
  
  // Set up event listeners
  setupEventListeners();
  
  // Show landing page
  showLanding();
}

function setupEventListeners() {
  // Game 1: Wordle
  const wordleInput = document.getElementById('wordle-input');
  const wordleSubmit = document.getElementById('wordle-submit');
  if (wordleSubmit) {
    wordleSubmit.addEventListener('click', handleWordleGuess);
    if (wordleInput) {
      wordleInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleWordleGuess();
      });
    }
  }

  // Game 2: Word Chain
  const chainInput = document.getElementById('chain-input');
  const chainSubmit = document.getElementById('chain-submit');
  if (chainSubmit) {
    chainSubmit.addEventListener('click', handleChainGuess);
    if (chainInput) {
      chainInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleChainGuess();
      });
    }
  }

  // Game 3: Cryptogram
  const cryptoInput = document.getElementById('crypto-input');
  const cryptoNumberInput = document.getElementById('crypto-number');
  const cryptoSubmit = document.getElementById('crypto-submit');
  if (cryptoSubmit) {
    cryptoSubmit.addEventListener('click', handleCryptoGuess);
    if (cryptoInput) {
      cryptoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleCryptoGuess();
      });
    }
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
  
  feedback.textContent = 'Guess the word!';
  attemptsLeft.textContent = `Attempts left: ${game.maxAttempts - game.attempts}`;
  
  document.getElementById('wordle-input').value = '';
  document.getElementById('wordle-input').focus();
}

function handleWordleGuess() {
  const input = document.getElementById('wordle-input').value;
  const game = cadenceGame.games[0];
  const feedback = document.getElementById('wordle-feedback');
  const attemptsLeft = document.getElementById('wordle-attempts');
  
  const result = game.validateGuess(input);
  
  if (!result.valid) {
    feedback.textContent = result.message;
    return;
  }
  
  attemptsLeft.textContent = `Attempts left: ${game.maxAttempts - game.attempts}`;
  
  if (result.correct) {
    feedback.textContent = `✓ Correct! The word is ${input}`;
    document.getElementById('wordle-submit').disabled = true;
    document.getElementById('wordle-input').disabled = true;
    
    setTimeout(() => {
      if (cadenceGame.advanceGame()) {
        alert('Game 1 Complete! Moving to Game 2...');
        updateGameList();
        showGame(1);
      }
    }, 2000);
  } else {
    const matched = result.feedback.map((f, i) => {
      if (f === 'correct') return '🟩';
      if (f === 'wrong-position') return '🟨';
      return '⬜';
    }).join('');
    feedback.textContent = `Guess: ${input} ${matched}`;
  }
  
  document.getElementById('wordle-input').value = '';
}

// ===== GAME 2: WORD CHAIN =====
function initChainGame() {
  const game = cadenceGame.games[1];
  const display = document.getElementById('chain-display');
  const progress = document.getElementById('chain-progress');
  
  display.textContent = game.getCurrentDisplay();
  progress.textContent = `Word ${game.chainIndex + 1} of ${game.chain.length}`;
  
  document.getElementById('chain-input').value = '';
  document.getElementById('chain-input').focus();
}

function handleChainGuess() {
  const input = document.getElementById('chain-input').value;
  const game = cadenceGame.games[1];
  const display = document.getElementById('chain-display');
  const progress = document.getElementById('chain-progress');
  const feedback = document.getElementById('chain-feedback');
  
  const result = game.validateGuess(input);
  
  display.textContent = result.nextDisplay;
  progress.textContent = `Word ${game.chainIndex + 1} of ${game.chain.length}`;
  
  if (result.error) {
    feedback.textContent = '✗ Incorrect. Letter revealed.';
  } else {
    feedback.textContent = '✓ Correct!';
  }
  
  document.getElementById('chain-input').value = '';
  
  if (game.isComplete()) {
    document.getElementById('chain-submit').disabled = true;
    document.getElementById('chain-input').disabled = true;
    feedback.textContent = '✓ Word chain complete!';
    
    setTimeout(() => {
      if (cadenceGame.advanceGame()) {
        alert('Game 2 Complete! Moving to Game 3...');
        updateGameList();
        showGame(2);
      }
    }, 2000);
  }
}

// ===== GAME 3: CRYPTOGRAM =====
function initCryptoGame() {
  const game = cadenceGame.games[2];
  const plainDisplay = document.getElementById('crypto-plain');
  const numbersDisplay = document.getElementById('crypto-numbers');
  const guessedNumbers = document.getElementById('crypto-guessed');
  
  plainDisplay.textContent = game.getCurrentDisplay();
  numbersDisplay.textContent = game.getNumbersDisplay();
  
  const revealed = game.getRevealedNumbers();
  guessedNumbers.textContent = `Revealed numbers: ${revealed.join(', ')}`;
  
  document.getElementById('crypto-number').value = '';
  document.getElementById('crypto-input').value = '';
  document.getElementById('crypto-input').focus();
}

function handleCryptoGuess() {
  const letterGuess = document.getElementById('crypto-input').value;
  const numberInput = document.getElementById('crypto-number').value;
  const game = cadenceGame.games[2];
  const feedback = document.getElementById('crypto-feedback');
  const plainDisplay = document.getElementById('crypto-plain');
  const guessedNumbers = document.getElementById('crypto-guessed');
  
  if (!letterGuess || !numberInput) {
    feedback.textContent = 'Enter both letter and number';
    return;
  }
  
  const result = game.validateGuess(letterGuess, numberInput);
  
  if (!result.valid) {
    feedback.textContent = result.message;
    return;
  }
  
  plainDisplay.textContent = result.display;
  
  const revealed = game.getRevealedNumbers();
  guessedNumbers.textContent = `Revealed numbers: ${revealed.join(', ')}`;
  
  if (result.correct) {
    feedback.textContent = `✓ Correct! ${letterGuess} = ${numberInput}`;
  } else {
    feedback.textContent = `✗ Incorrect.`;
  }
  
  document.getElementById('crypto-input').value = '';
  document.getElementById('crypto-number').value = '';
  
  if (game.isComplete()) {
    document.getElementById('crypto-submit').disabled = true;
    document.getElementById('crypto-input').disabled = true;
    document.getElementById('crypto-number').disabled = true;
    feedback.textContent = '✓ Cryptogram solved!';
    plainDisplay.textContent = game.plaintext;
    
    setTimeout(() => {
      if (cadenceGame.advanceGame()) {
        alert('Game 3 Complete! Moving to Game 4...');
        updateGameList();
        showGame(3);
      }
    }, 2000);
  }
}

// ===== GAME 4: SUDOKU =====
function initSudokuGame() {
  const game = cadenceGame.games[3];
  renderSudokuGrid(game);
  document.getElementById('sudoku-feedback').textContent = 'Complete the Sudoku puzzle';
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
      
      // Add borders for 3x3 sections
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
  } else {
    event.target.classList.add('error');
    event.target.value = '';
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
        alert('Game 4 Complete! Moving to Final Answer...');
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
  
  document.getElementById('password-input').value = '';
  document.getElementById('password-input').focus();
}

function handlePasswordSubmit() {
  const input = document.getElementById('password-input').value;
  const isCorrect = cadenceGame.validateFinalPassword(input);
  const feedback = document.getElementById('password-feedback');
  
  if (isCorrect) {
    feedback.textContent = '✓ Correct! You have unlocked the leaderboard.';
    feedback.className = 'correct';
    document.getElementById('password-submit').disabled = true;
    document.getElementById('password-input').disabled = true;
    document.getElementById('leaderboard-submit').classList.remove('hidden');
  } else {
    feedback.textContent = '✗ Incorrect unlock code. Try again.';
    feedback.className = 'error';
  }
}

function submitToLeaderboard() {
  const stats = cadenceGame.getFinalStats();
  const googleFormURL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
  
  // Parameters for Google Form
  const params = new URLSearchParams({
    'entry.NAME_FIELD': prompt('Enter your name (or leave blank for anonymous):') || 'Anonymous',
    'entry.SCORE_FIELD': stats.totalScore,
    'entry.ERRORS_FIELD': stats.totalErrors,
    'entry.VOLUME_FIELD': currentVolume.id
  });
  
  // Open Google Form with pre-filled data
  window.open(googleFormURL + '?' + params.toString(), '_blank');
}

// ===== UTILITY FUNCTIONS =====
function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.add('hidden');
  });
}