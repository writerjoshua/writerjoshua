// The Cadence - Volume One Data
// Theme: "The Answers"

const volumeOne = {
  id: "vol-1",
  theme: "The Answers",
  description: "Solve yourself, again - Volume One",
  
  games: {
    game1: {
      type: "wordle",
      answer: "CLOUD",
      maxAttempts: 6,
      description: "Guess the word in 6 attempts or less."
    },
    
    game2: {
      type: "wordChain",
      start: "CLOUD",
      end: "PROTECT",
      chain: ["SERVICE", "PROVIDER", "NETWORK", "ADMINISTRATOR", "PASSWORD"],
      alternatives: {
        "ADMINISTRATOR": ["ADMIN"],
        "PASSWORD": ["PASSWORDS"],
        "PROTECT": ["PROTECTION", "PROTECTED"]
      },
      description: "Complete the word chain. Each wrong guess reveals the next letter."
    },
    
    game3: {
      type: "cryptogram",
      plaintext: "DON'T BE INTIMIDATED BY AI AGENTS",
      startLetters: 3,
      description: "Follow the cryptography to fill in the missing letters."
    },
    
    game4: {
      type: "sudoku",
      extractRule: "topRowSection1",
      description: "Complete the puzzle. Gather the top row of section one.",
      
      // Easy Sudoku puzzle (numbers to fill in)
      puzzle: [
        [5, 3, 0,  0, 7, 0,  0, 0, 0],
        [6, 0, 0,  1, 9, 5,  0, 0, 0],
        [0, 9, 8,  0, 0, 0,  0, 6, 0],
        
        [8, 0, 0,  0, 6, 0,  0, 0, 3],
        [4, 0, 0,  8, 0, 3,  0, 0, 1],
        [7, 0, 0,  0, 2, 0,  0, 0, 6],
        
        [0, 6, 0,  0, 0, 0,  2, 8, 0],
        [0, 0, 0,  4, 1, 9,  0, 0, 5],
        [0, 0, 0,  0, 8, 0,  0, 7, 9]
      ],
      
      // Complete solution
      solution: [
        [5, 3, 4,  6, 7, 8,  9, 1, 2],
        [6, 7, 2,  1, 9, 5,  3, 4, 8],
        [1, 9, 8,  3, 4, 2,  5, 6, 7],
        
        [8, 5, 9,  7, 6, 1,  4, 2, 3],
        [4, 2, 6,  8, 5, 3,  7, 9, 1],
        [7, 1, 3,  9, 2, 4,  8, 5, 6],
        
        [9, 6, 1,  5, 3, 7,  2, 8, 4],
        [2, 8, 7,  4, 1, 9,  6, 3, 5],
        [3, 4, 5,  2, 8, 6,  1, 7, 9]
      ]
    }
  }
};

// Archive volumes (previous suites)
const archives = [];

// Current active volume
const currentVolume = volumeOne;