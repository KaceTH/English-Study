const inko = new Inko();
let words = [];
let meanings = [];
let shuffledIndices = [];
let currentWordIndex = 0;
let textContent = ''; // Store the current input
let caretPosition = 0; // Track the caret position
const inputContainer = document.getElementById('customInput');
const textSpan = document.getElementById('text');
const caret = document.getElementById('caret');
const meaningInput = document.getElementById('meaningInput');

// Focus on the custom input container
inputContainer.addEventListener('click', () => {
    inputContainer.focus();
    caret.style.display = 'inline-block';
});

inputContainer.addEventListener('blur', () => {
    caret.style.display = 'none';
});

// Handle keypress events in the custom input container
inputContainer.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        event.preventDefault(); // Prevent default tab behavior
        if (event.shiftKey) {
            // Shift+Tab focuses the previous element (if any)
            meaningInput.focus();
        } else {
            // Tab focuses the next element (meaningInput)
            meaningInput.focus();
        }
        return;
    }

    event.preventDefault(); // Prevent default behavior

    if (event.key === 'Backspace') {
        if (caretPosition > 0) {
            textContent =
                textContent.slice(0, caretPosition - 1) + textContent.slice(caretPosition);
            caretPosition--;
        }
    } else if (event.key === 'ArrowLeft') {
        if (caretPosition > 0) caretPosition--;
    } else if (event.key === 'ArrowRight') {
        if (caretPosition < textContent.length) caretPosition++;
    } else if (event.key.length === 1) {
        // Process normal character input
        const converted = inko.ko2en(event.key);
        textContent =
            textContent.slice(0, caretPosition) + converted + textContent.slice(caretPosition);
        caretPosition++;
    }

    updateDisplay();
});

// Update the custom input field display
function updateDisplay() {
    const beforeCaret = textContent.slice(0, caretPosition);
    const afterCaret = textContent.slice(caretPosition);
    textSpan.innerHTML = `${beforeCaret}<span style="visibility:hidden;">|</span>${afterCaret}`;
}

// Parse CSV and start the game logic
document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);
document.getElementById('startButton').addEventListener('click', startGame);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            parseCSV(text);
        };
        reader.readAsText(file);
    }
}

function parseCSV(data) {
    const rows = data.split('\n');
    const regex = /(?:"([^"]*)"|([^,]+))/g;
    words = [];
    meanings = [];

    rows.forEach(row => {
        const matches = [...row.matchAll(regex)];
        if (matches.length >= 2) {
            const english = matches[0][1] || matches[0][2];
            const meaning = matches[1][1] || matches[1][2];
            if (english && meaning) {
                words.push(english.trim());
                meanings.push(meaning.trim());
            }
        }
    });

    document.getElementById('word').innerText = 'CSV loaded. Press "Start Game"!';
}

function startGame() {
    if (words.length === 0) {
        document.getElementById('word').innerText = 'No words loaded!';
        return;
    }

    shuffledIndices = Array.from({ length: words.length }, (_, i) => i);
    shuffledIndices.sort(() => Math.random() - 0.5); // Shuffle indices
    currentWordIndex = 0;
    showNextWord();
}

function showNextWord() {
    if (currentWordIndex >= shuffledIndices.length) {
        document.getElementById('word').innerText = 'Game Over!';
        document.getElementById('meaning').innerText = '';
        return;
    }

    const word = words[shuffledIndices[currentWordIndex]];
    const meaning = meanings[shuffledIndices[currentWordIndex]];
    document.getElementById('word').innerText = word;
    document.getElementById('meaning').innerText = meaning;
    textContent = ''; // Clear input
    caretPosition = 0;
    document.getElementById('meaningInput').value = '';
    document.getElementById('feedback').style.visibility = 'hidden';
    updateDisplay();
    inputContainer.focus();
    caret.style.display = 'inline-block';
}

function checkInput() {
    const word = words[shuffledIndices[currentWordIndex]];
    const meaning = meanings[shuffledIndices[currentWordIndex]];
    const meaningInputValue = document.getElementById('meaningInput').value.trim();

    if (textContent === word && meaningInputValue === meaning) {
        currentWordIndex++;
        showNextWord();
    } else {
        const feedback = document.getElementById('feedback');
        feedback.style.visibility = 'visible';
        setTimeout(() => {
            feedback.style.visibility = 'hidden';
        }, 1500); // Hide feedback after 1.5 seconds
    }
}

// Handle Enter key for submission
inputContainer.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        checkInput();
    }
});
document.getElementById('meaningInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        checkInput();
    }
});
