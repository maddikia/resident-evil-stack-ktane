// Game state
const gameState = {
    timer: 30 * 60, // 30 minutes in seconds
    gameActive: true,
    
    // Module 1 state
    colorSequence: [],
    correctColorSequence: ['blue', 'yellow', 'lpink', 'orange'],
    colorSequenceCorrect: false,
    morseCode: '',
    correctMorseCode: '...---...', // SOS
    
    // Module 2 state
    selectedSilhouettes: [],
    correctSilhouetteSequence: ['lamp', 'lion', 'plaga', 'cure'],
    currentWordIndex: 0,
    wordList: ['PUT', 'ALL', 'YOUR', 'WORDS', 'HERE', 'RESIDENT', 'EVIL', 'STACK', 'SENIOR'],
    correctWord: 'EVIL',
    
    // Module 3 state
    clockTime: { hours: 12, minutes: 0 },
    correctClockTime: { hours: 3, minutes: 45 },
    selectedKnob: null,
    
    // Module completion state
    moduleStatus: [false, false, false],
    moduleSubmissions: [false, false, false]
};

// DOM Elements
const timerElement = document.querySelector('.timer');
const mainSubmitButton = document.getElementById('main-submit');
const gameOverElement = document.getElementById('game-over');
const gameOverTextElement = document.getElementById('game-over-text');
const restartButton = document.getElementById('restart-button');

// Module Lights
const module1Light = document.getElementById('module1-light');
const module2Light = document.getElementById('module2-light');
const module3Light = document.getElementById('module3-light');
const module1SubmitLight = document.getElementById('module1-submit-light');
const module2SubmitLight = document.getElementById('module2-submit-light');
const module3SubmitLight = document.getElementById('module3-submit-light');

// Initialize Clock Numbers
function initializeClockNumbers() {
    const clockNumbers = document.querySelector('.clock-numbers');
    for (let i = 1; i <= 12; i++) {
        const angle = (i - 3) * 30 * Math.PI / 180;
        const x = 75 + 60 * Math.cos(angle);
        const y = 75 + 60 * Math.sin(angle);
        
        const number = document.createElement('div');
        number.className = 'clock-number';
        number.textContent = i;
        number.style.left = `${x}px`;
        number.style.top = `${y}px`;
        
        clockNumbers.appendChild(number);
    }
}

// Update Clock Hands
function updateClockHands() {
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    
    const hourAngle = (gameState.clockTime.hours % 12 + gameState.clockTime.minutes / 60) * 30;
    const minuteAngle = gameState.clockTime.minutes * 6;
    
    hourHand.style.transform = `translate(-50%, -100%) rotate(${hourAngle}deg)`;
    minuteHand.style.transform = `translate(-50%, -100%) rotate(${minuteAngle}deg)`;
}

// Timer Function
function startTimer() {
    const timerInterval = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(timerInterval);
            return;
        }
        
        gameState.timer -= 0.01;
        if (gameState.timer <= 0) {
            gameState.timer = 0;
            gameOver(false);
            clearInterval(timerInterval);
        }
        
        // Format the timer display
        const minutes = Math.floor(gameState.timer / 60);
        const seconds = Math.floor(gameState.timer % 60);
        
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 10);
}

// Game Over Function
function gameOver(success) {
    gameState.gameActive = false;
    gameOverElement.style.display = 'flex';
    
    if (success) {
        gameOverElement.classList.add('success');
        gameOverTextElement.textContent = 'DEFUSED!';
    } else {
        gameOverTextElement.textContent = 'BOOM!';
    }
}

// Reset Game Function
function resetGame() {
    gameState.timer = 30 * 60; // 30 minutes in seconds
    gameState.gameActive = true;
    gameState.colorSequence = [];
    gameState.colorSequenceCorrect = false;
    gameState.morseCode = '';
    gameState.selectedSilhouettes = [];
    gameState.currentWordIndex = 0;
    gameState.clockTime = { hours: 12, minutes: 0 };
    gameState.selectedKnob = null;
    gameState.moduleStatus = [false, false, false];
    gameState.moduleSubmissions = [false, false, false];
    
    // Reset UI elements
    timerElement.textContent = '30:00.00';
    document.getElementById('morse-display').textContent = '';
    document.getElementById('selected-word').textContent = gameState.wordList[0];
    
    // Reset module lights
    module1Light.style.backgroundColor = 'var(--light-off)';
    module2Light.style.backgroundColor = 'var(--light-off)';
    module3Light.style.backgroundColor = 'var(--light-off)';
    module1SubmitLight.style.backgroundColor = 'var(--light-red)';
    module2SubmitLight.style.backgroundColor = 'var(--light-red)';
    module3SubmitLight.style.backgroundColor = 'var(--light-red)';
    
    // Reset silhouette buttons
    document.querySelectorAll('.silhouette-button').forEach(button => {
        button.classList.remove('selected');
    });
    
    // Reset clock
    updateClockHands();
    
    // Reset knobs
    document.querySelectorAll('.knob').forEach(knob => {
        knob.classList.remove('selected');
        knob.querySelector('.knob-indicator').style.transform = 'rotate(0deg)';
    });
    
    // Hide game over screen
    gameOverElement.style.display = 'none';
    gameOverElement.classList.remove('success');
    
    // Disable main submit button
    mainSubmitButton.disabled = true;
    
    // Start timer again
    startTimer();
}

// Check if all modules are solved
function checkAllModulesSolved() {
    if (gameState.moduleSubmissions.every(status => status === true)) {
        mainSubmitButton.disabled = false;
    }
}

// MODULE 1: Color Buttons & Morse Code
function initializeModule1() {
    // Color buttons
    const colorButtons = document.querySelectorAll('.color-button');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!gameState.gameActive) return;

            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                // gameState.selectedSilhouettes = gameState.selectedSilhouettes.filter(i => i !== silhouette);
            } else {
                // Only allow selecting 4 buttons
                if (gameState.selectedSilhouettes.length < 4) {
                    button.classList.add('selected');
                    // gameState.selectedSilhouettes.push(silhouette);
                }
            }
            
            const color = button.getAttribute('data-color');
            gameState.colorSequence.push(color);
            
            // Flash the button to indicate it was pressed
            button.style.opacity = '0.5';
            setTimeout(() => { button.style.opacity = '1'; }, 200);
            
            // Check if the sequence is correct so far
            const enteredLength = gameState.colorSequence.length;
            const correctSoFar = gameState.colorSequence.every((color, index) => 
                color === gameState.correctColorSequence[index]
            );
            
            if (!correctSoFar) {
                // Incorrect sequence - flash the module light red
                module1Light.style.backgroundColor = 'var(--light-red)';
                colorButtons.forEach(btn => btn.classList.remove('selected'));
                
                // Visual feedback for error
                setTimeout(() => {
                    if (!gameState.colorSequenceCorrect) {
                        module1Light.style.backgroundColor = 'var(--light-off)';
                    }
                }, 500);
                
                // Reset the sequence
                gameState.colorSequence = [];
                return;
            }
            
            // If complete and correct sequence
            if (enteredLength === gameState.correctColorSequence.length) {
                module1Light.style.backgroundColor = 'var(--light-green)';
                gameState.colorSequenceCorrect = true;
                gameState.moduleStatus[0] = true;
            }
        });
    });
    
    // Morse code input
    const morseDisplay = document.getElementById('morse-display');
    const dotButton = document.getElementById('dot-button');
    const dashButton = document.getElementById('dash-button');
    const clearMorseButton = document.getElementById('clear-morse');
    const submitMorseButton = document.getElementById('submit-morse');
    
    dotButton.addEventListener('click', () => {
        if (!gameState.gameActive || !gameState.colorSequenceCorrect) return;
        gameState.morseCode += '.';
        morseDisplay.textContent = gameState.morseCode;
    });
    
    dashButton.addEventListener('click', () => {
        if (!gameState.gameActive || !gameState.colorSequenceCorrect) return;
        gameState.morseCode += '-';
        morseDisplay.textContent = gameState.morseCode;
    });
    
    clearMorseButton.addEventListener('click', () => {
        if (!gameState.gameActive) return;
        gameState.morseCode = '';
        morseDisplay.textContent = '';
    });
    
    submitMorseButton.addEventListener('click', () => {
        if (!gameState.gameActive || !gameState.colorSequenceCorrect) return;
        
        // Check if morse code is correct
        if (gameState.morseCode === gameState.correctMorseCode) {
            module1SubmitLight.style.backgroundColor = 'var(--light-green)';
            gameState.moduleSubmissions[0] = true;
            checkAllModulesSolved();
        } else {
            module1SubmitLight.style.backgroundColor = 'var(--light-red)';
            gameState.morseCode = '';
            morseDisplay.textContent = '';
        }
    });
}

// MODULE 2: Silhouettes
function initializeModule2() {
    const silhouetteButtons = document.querySelectorAll('.silhouette-button');
    const selectedWordElement = document.getElementById('selected-word');
    const wordPrevButton = document.getElementById('word-prev');
    const wordNextButton = document.getElementById('word-next');
    const submitWordButton = document.getElementById('submit-word');
    
    silhouetteButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!gameState.gameActive) return;
            
            const silhouette = button.getAttribute('data-silhouette');
            
            // Toggle selection
            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                gameState.selectedSilhouettes = gameState.selectedSilhouettes.filter(i => i !== silhouette);
            } else {
                // Only allow selecting 4 buttons
                if (gameState.selectedSilhouettes.length < 4) {
                    button.classList.add('selected');
                    gameState.selectedSilhouettes.push(silhouette);
                }
            }
            
            // Check if the silhouette sequence is correct
            if (gameState.selectedSilhouettes.length === 4) {
                const correctSequence = gameState.selectedSilhouettes.sort().join(',') === 
                                        gameState.correctSilhouetteSequence.sort().join(',');
                
                if (correctSequence) {
                    module2Light.style.backgroundColor = 'var(--light-green)';
                    gameState.moduleStatus[1] = true;
                } else {
                    module2Light.style.backgroundColor = 'var(--light-red)';
                    // Reset selections
                    gameState.selectedSilhouettes = [];
                    silhouetteButtons.forEach(btn => btn.classList.remove('selected'));
                }
            } else {
                module2Light.style.backgroundColor = 'var(--light-off)';
            }
        });
    });
    
    // Word selection
    wordPrevButton.addEventListener('click', () => {
        if (!gameState.gameActive || !gameState.moduleStatus[1]) return;
        
        gameState.currentWordIndex = (gameState.currentWordIndex - 1 + gameState.wordList.length) % gameState.wordList.length;
        selectedWordElement.textContent = gameState.wordList[gameState.currentWordIndex];
    });
    
    wordNextButton.addEventListener('click', () => {
        if (!gameState.gameActive || !gameState.moduleStatus[1]) return;
        
        gameState.currentWordIndex = (gameState.currentWordIndex + 1) % gameState.wordList.length;
        selectedWordElement.textContent = gameState.wordList[gameState.currentWordIndex];
    });
    
    submitWordButton.addEventListener('click', () => {
        if (!gameState.gameActive || !gameState.moduleStatus[1]) return;
        
        const selectedWord = gameState.wordList[gameState.currentWordIndex];
        if (selectedWord === gameState.correctWord) {
            module2SubmitLight.style.backgroundColor = 'var(--light-green)';
            gameState.moduleSubmissions[1] = true;
            checkAllModulesSolved();
        } else {
            module2SubmitLight.style.backgroundColor = 'var(--light-red)';
            gameState.currentWordIndex = 0;
            selectedWordElement.textContent = gameState.wordList[0];
        }
    });
}

// MODULE 3: Clock and Knobs
function initializeModule3() {
    initializeClockNumbers();
    updateClockHands();
    
    const knobs = document.querySelectorAll('.knob');
    const submitClockButton = document.getElementById('submit-clock');
    
    // Select knob
    knobs.forEach(knob => {
        knob.addEventListener('click', () => {
            if (!gameState.gameActive) return;
            
            // Deselect all knobs first
            knobs.forEach(k => k.classList.remove('selected'));
            
            // Select clicked knob
            knob.classList.add('selected');
            gameState.selectedKnob = parseInt(knob.getAttribute('data-knob'));
        });
    });
    
    // Handle keyboard events for knob rotation
    document.addEventListener('keydown', (e) => {
        if (!gameState.gameActive || gameState.selectedKnob === null) return;
        
        const selectedKnob = document.querySelector(`.knob[data-knob="${gameState.selectedKnob}"]`);
        const knobIndicator = selectedKnob.querySelector('.knob-indicator');
        let currentRotation = knobIndicator.style.transform || 'rotate(0deg)';
        let rotationDegrees = parseInt(currentRotation.replace(/[^0-9-]/g, '')) || 0;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            // Rotate clockwise
            rotationDegrees = (rotationDegrees + 30) % 360;
            
            // Update time based on knob
            if (gameState.selectedKnob === 0) { // +1h
                gameState.clockTime.hours = (gameState.clockTime.hours + 1) > 12 ? 1 : gameState.clockTime.hours + 1;
            } else if (gameState.selectedKnob === 1) { // +10m
                gameState.clockTime.minutes = (gameState.clockTime.minutes + 10) % 60;
                if (gameState.clockTime.minutes === 0) {
                    gameState.clockTime.hours = (gameState.clockTime.hours + 1) > 12 ? 1 : gameState.clockTime.hours + 1;
                }
            } else if (gameState.selectedKnob === 2) { // +5m
                gameState.clockTime.minutes = (gameState.clockTime.minutes + 5) % 60;
                if (gameState.clockTime.minutes === 0) {
                    gameState.clockTime.hours = (gameState.clockTime.hours + 1) > 12 ? 1 : gameState.clockTime.hours + 1;
                }
            } else if (gameState.selectedKnob === 3) { // +1m
                gameState.clockTime.minutes = (gameState.clockTime.minutes + 1) % 60;
                if (gameState.clockTime.minutes === 0) {
                    gameState.clockTime.hours = (gameState.clockTime.hours + 1) > 12 ? 1 : gameState.clockTime.hours + 1;
                }
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            // Rotate counter-clockwise
            rotationDegrees = (rotationDegrees - 30) % 360;
            
            // Update time based on knob
            if (gameState.selectedKnob === 0) { // -1h
                gameState.clockTime.hours = (gameState.clockTime.hours - 1) < 1 ? 12 : gameState.clockTime.hours - 1;
            } else if (gameState.selectedKnob === 1) { // -10m
                if (gameState.clockTime.minutes < 10) {
                    gameState.clockTime.minutes = 60 - (10 - gameState.clockTime.minutes);
                    gameState.clockTime.hours = (gameState.clockTime.hours - 1) < 1 ? 12 : gameState.clockTime.hours - 1;
                } else {
                    gameState.clockTime.minutes -= 10;
                }
            } else if (gameState.selectedKnob === 2) { // -5m
                if (gameState.clockTime.minutes < 5) {
                    gameState.clockTime.minutes = 60 - (5 - gameState.clockTime.minutes);
                    gameState.clockTime.hours = (gameState.clockTime.hours - 1) < 1 ? 12 : gameState.clockTime.hours - 1;
                } else {
                    gameState.clockTime.minutes -= 5;
                }
            } else if (gameState.selectedKnob === 3) { // -1m
                if (gameState.clockTime.minutes < 1) {
                    gameState.clockTime.minutes = 59;
                    gameState.clockTime.hours = (gameState.clockTime.hours - 1) < 1 ? 12 : gameState.clockTime.hours - 1;
                } else {
                    gameState.clockTime.minutes -= 1;
                }
            }
        }
        
        knobIndicator.style.transform = `rotate(${rotationDegrees}deg)`;
        updateClockHands();
    });
    
    submitClockButton.addEventListener('click', () => {
        if (!gameState.gameActive) return;
        
        // Check if clock time is correct
        if (gameState.clockTime.hours === gameState.correctClockTime.hours && 
            gameState.clockTime.minutes === gameState.correctClockTime.minutes) {
            module3Light.style.backgroundColor = 'var(--light-green)';
            module3SubmitLight.style.backgroundColor = 'var(--light-green)';
            gameState.moduleStatus[2] = true;
            gameState.moduleSubmissions[2] = true;
            checkAllModulesSolved();
        } else {
            module3Light.style.backgroundColor = 'var(--light-red)';
            // Reset clock
            gameState.clockTime = { hours: 12, minutes: 0 };
            updateClockHands();
        }
    });
}

// Main Submit Button
function initializeMainSubmit() {
    mainSubmitButton.addEventListener('click', () => {
        if (!gameState.gameActive) return;
        
        if (gameState.moduleSubmissions.every(status => status === true)) {
            gameOver(true);
        }
    });
}

// Restart Button
restartButton.addEventListener('click', resetGame);

// Initialize Game
function initializeGame() {
    initializeModule1();
    initializeModule2();
    initializeModule3();
    initializeMainSubmit();
    startTimer();
}

// Start the game when the page loads
window.addEventListener('load', initializeGame);