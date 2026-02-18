// Game Logic Classes for The Cadence

class WordleGame {
  constructor(answer, maxAttempts = 6) {
    this.answer = answer.toUpperCase();
    this.maxAttempts = maxAttempts;
    this.attempts = 0;
    this.guesses = [];
    this.errors = 0;
  }

  validateGuess(guess) {
    guess = guess.toUpperCase().trim();
    
    if (guess.length !== this.answer.length) {
      return { valid: false, message: `Word must be ${this.answer.length} letters` };
    }
    
    if (!/^[A-Z]+$/.test(guess)) {
      return { valid: false, message: "Only letters allowed" };
    }
    
    if (this.guesses.includes(guess)) {
      return { valid: false, message: "Already guessed this word" };
    }
    
    this.guesses.push(guess);
    this.attempts++;
    
    if (guess === this.answer) {
      return { valid: true, correct: true };
    } else {
      this.errors++;
      return { valid: true, correct: false, feedback: this.getFeedback(guess) };
    }
  }

  getFeedback(guess) {
    const feedback = [];
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === this.answer[i]) {
        feedback.push('correct');
      } else if (this.answer.includes(guess[i])) {
        feedback.push('wrong-position');
      } else {
        feedback.push('wrong');
      }
    }
    return feedback;
  }

  isComplete() {
    return this.guesses.includes(this.answer) || this.attempts >= this.maxAttempts;
  }
}

class WordChainGame {
  constructor(startWord, endWord, chain, alternatives = {}) {
    this.startWord = startWord.toUpperCase();
    this.endWord = endWord.toUpperCase();
    this.chain = chain.map(w => w.toUpperCase());
    this.alternatives = alternatives;
    this.chainIndex = 0;
    this.currentWord = this.chain[0].toUpperCase();
    this.revealedLetters = 1;
    this.errors = 0;
    this.guesses = [];
  }

  getCurrentDisplay() {
    const revealed = this.currentWord.substring(0, this.revealedLetters);
    const hidden = "_".repeat(Math.max(0, this.currentWord.length - this.revealedLetters));
    return revealed + hidden;
  }

  validateGuess(guess) {
    guess = guess.toUpperCase().trim();
    this.guesses.push(guess);
    
    const isCorrect = guess === this.currentWord || 
                     (this.alternatives[this.currentWord] && 
                      this.alternatives[this.currentWord].includes(guess));
    
    if (isCorrect) {
      this.chainIndex++;
      if (this.chainIndex < this.chain.length) {
        this.currentWord = this.chain[this.chainIndex];
        this.revealedLetters = 1;
      }
      return { correct: true, nextDisplay: this.getCurrentDisplay() };
    } else {
      this.errors++;
      this.revealedLetters++;
      
      if (this.revealedLetters > this.currentWord.length) {
        // Word fully revealed, auto-advance
        this.chainIndex++;
        if (this.chainIndex < this.chain.length) {
          this.currentWord = this.chain[this.chainIndex];
          this.revealedLetters = 1;
        }
      }
      
      return { correct: false, nextDisplay: this.getCurrentDisplay(), error: true };
    }
  }

  isComplete() {
    return this.chainIndex >= this.chain.length;
  }
}

class CryptogramGame {
  constructor(plaintext, startLetters = 3) {
    this.plaintext = plaintext.toUpperCase();
    this.startLetters = startLetters;
    this.errors = 0;
    this.guesses = {};
    this.cipher = this.generateCipher(plaintext);
    this.letterToNumber = {};
    
    for (let [letter, number] of Object.entries(this.cipher)) {
      this.letterToNumber[number] = letter;
    }
    
    this.revealRandomLetters(startLetters);
  }

  generateCipher(plaintext) {
    const uniqueLetters = [...new Set(plaintext.split('').filter(c => /[A-Z]/.test(c)))];
    const numbers = Array.from({length: uniqueLetters.length}, (_, i) => i + 1);
    
    // Shuffle numbers
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    const cipher = {};
    uniqueLetters.forEach((letter, index) => {
      cipher[letter] = numbers[index];
    });
    
    return cipher;
  }

  revealRandomLetters(count) {
    const uniqueLetters = [...new Set(this.plaintext.split('').filter(c => /[A-Z]/.test(c)))];
    const shuffled = [...uniqueLetters].sort(() => 0.5 - Math.random());
    const toReveal = shuffled.slice(0, Math.min(count, uniqueLetters.length));
    
    toReveal.forEach(letter => {
      const number = this.cipher[letter];
      this.guesses[number] = letter;
    });
  }

  getCurrentDisplay() {
    let display = "";
    for (let char of this.plaintext) {
      if (char === ' ' || char === "'") {
        display += char;
      } else {
        const number = this.cipher[char];
        const guessedLetter = this.guesses[number];
        display += guessedLetter || "_";
      }
    }
    return display;
  }

  getNumbersDisplay() {
    let display = "";
    for (let char of this.plaintext) {
      if (char === ' ' || char === "'") {
        display += " ";
      } else {
        const number = this.cipher[char];
        display += number.toString().padStart(2, ' ');
      }
    }
    return display;
  }

  getRevealedNumbers() {
    return Object.keys(this.guesses).map(Number).sort((a, b) => a - b);
  }

  validateGuess(letterGuess, numberInput) {
    letterGuess = letterGuess.toUpperCase();
    numberInput = Number(numberInput);
    
    const correctLetter = this.letterToNumber[numberInput];
    
    if (!correctLetter) {
      return { valid: false, message: "Invalid number" };
    }
    
    if (letterGuess === correctLetter) {
      this.guesses[numberInput] = letterGuess;
      return { correct: true, display: this.getCurrentDisplay() };
    } else {
      this.errors++;
      return { correct: false, error: true };
    }
  }

  isComplete() {
    return this.getCurrentDisplay() === this.plaintext;
  }
}

class SudokuGame {
  constructor(puzzle, solution, extractRule = "topRowSection1") {
    this.puzzle = JSON.parse(JSON.stringify(puzzle));
    this.solution = solution;
    this.playerGrid = JSON.parse(JSON.stringify(puzzle));
    this.errors = 0;
    this.extractRule = extractRule;
  }

  validateCell(row, col, number) {
    number = Number(number);
    
    if (number < 1 || number > 9) {
      return { valid: false, message: "Number must be 1-9" };
    }
    
    if (this.solution[row][col] === number) {
      this.playerGrid[row][col] = number;
      return { correct: true };
    } else {
      this.errors++;
      return { correct: false, error: true };
    }
  }

  isComplete() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.playerGrid[i][j] !== this.solution[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  extractNumbers() {
    let numbers = [];
    
    if (this.extractRule === "topRowSection1") {
      // Top row of top-left section (row 0, cols 0-2)
      numbers = [this.solution[0][0], this.solution[0][1], this.solution[0][2]];
    }
    
    return numbers.join("");
  }
}

class CadenceGame {
  constructor(volume) {
    this.volume = volume;
    this.currentGameIndex = 0;
    this.games = [];
    this.totalErrors = 0;
    
    this.initializeGames();
    this.loadProgress();
  }

  initializeGames() {
    this.games[0] = new WordleGame(this.volume.games.game1.answer);
    this.games[1] = new WordChainGame(
      this.volume.games.game2.start,
      this.volume.games.game2.end,
      this.volume.games.game2.chain,
      this.volume.games.game2.alternatives
    );
    this.games[2] = new CryptogramGame(this.volume.games.game3.plaintext);
    this.games[3] = new SudokuGame(
      this.volume.games.game4.puzzle,
      this.volume.games.game4.solution
    );
  }

  getCurrentGame() {
    return this.games[this.currentGameIndex];
  }

  advanceGame() {
    if (this.currentGameIndex < 3) {
      this.currentGameIndex++;
      this.saveProgress();
      return true;
    }
    return false;
  }

  calculateScore(gameIndex) {
    const baseScore = 200;
    const game = this.games[gameIndex];
    const errorPenalty = game.errors * 50;
    return Math.max(0, baseScore - errorPenalty);
  }

  generateFinalPassword() {
    const game1Answer = this.volume.games.game1.answer;
    const game4Numbers = this.games[3].extractNumbers();
    return game1Answer + game4Numbers;
  }

  validateFinalPassword(input) {
    return input === this.generateFinalPassword();
  }

  getFinalStats() {
    let totalScore = 0;
    let totalErrors = 0;
    const breakdown = {};
    
    for (let i = 0; i < 4; i++) {
      const score = this.calculateScore(i);
      totalScore += score;
      totalErrors += this.games[i].errors;
      breakdown[`game${i + 1}`] = {
        score: score,
        errors: this.games[i].errors
      };
    }
    
    return {
      totalScore,
      maxScore: 800,
      totalErrors,
      breakdown
    };
  }

  saveProgress() {
    const state = {
      currentGameIndex: this.currentGameIndex
    };
    localStorage.setItem(`cadence-${this.volume.id}`, JSON.stringify(state));
  }

  loadProgress() {
    const saved = localStorage.getItem(`cadence-${this.volume.id}`);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.currentGameIndex = state.currentGameIndex;
      } catch (e) {
        console.error('Error loading progress', e);
      }
    }
  }
}