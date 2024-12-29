const inko = new Inko();
let words = [];
let meanings = [];
let shuffledIndices = [];
let currentWordIndex = 0;
let customContent = "";
let caretPosition = 0;
let isKoreanMode = false;

const customInput = document.getElementById("customInput");
const caret = document.getElementById("caret");
const meaningInput = document.getElementById("meaningInput");
const wordDisplay = document.getElementById("word");
const meaningDisplay = document.getElementById("meaning");
const feedback = document.getElementById("feedback");
const controlButton = document.getElementById("controlButton");

document.getElementById("csvFileInput").addEventListener("change", handleFileUpload);
controlButton.addEventListener("click", handleControlButton);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            try {
                parseCSV(text);
            } catch (error) {
                console.error("Error parsing CSV:", error);
                alert("Failed to load CSV file. Please check the format.");
            }
        };
        reader.readAsText(file);
    } else {
        alert("No file selected!");
    }
}

function parseCSV(data) {
    const rows = data.split(/[\r\n]+/);
    const regex = /(?:\"([^\"]*)\"|([^,]+))/g;
    words = [];
    meanings = [];

    rows.forEach((row) => {
        const matches = [...row.matchAll(regex)];
        if (matches.length >= 2) {
            const english = matches[0][1] || matches[0][2];
            const meaning = matches[1][1] || matches[1][2];
            if (english && meaning) {
                words.push(normalizeText(english.trim()));
                meanings.push(normalizeText(meaning.trim()));
                console.log(`단어: ${english.trim()} / 뜻: ${meaning.trim()}`);
            }
        }
    });

    if (words.length > 0) {
        wordDisplay.textContent = "CSV loaded successfully. Press \"Start Game\"!";
    } else {
        alert("CSV is empty or not properly formatted.");
    }
}

function handleControlButton() {
    if (controlButton.textContent === "Start Game") {
        startGame();
        controlButton.textContent = "Skip";
    } else if (controlButton.textContent === "Skip") {
        skipWord();
    }
}

function startGame() {
    if (words.length === 0) {
        wordDisplay.textContent = "No words loaded!";
        return;
    }

    shuffledIndices = Array.from({ length: words.length }, (_, i) => i);
    shuffledIndices.sort(() => Math.random() - 0.5);
    currentWordIndex = 0;

    showNextWord();
}

function skipWord() {
    currentWordIndex++;
    if (currentWordIndex >= shuffledIndices.length) {
        endGame();
    } else {
        showNextWord();
    }
}

function showNextWord() {
    if (currentWordIndex >= shuffledIndices.length) {
        endGame(); // 게임 종료
        return;
    }

    const wordIndex = shuffledIndices[currentWordIndex]; // 현재 단어 인덱스
    wordDisplay.textContent = words[wordIndex]; // 단어 표시
    meaningDisplay.textContent = meanings[wordIndex]; // 뜻 표시

    customContent = ""; // 사용자 입력 초기화
    caretPosition = 0;
    updateCustomInput(); // 커스텀 입력 필드 업데이트
    meaningInput.value = ""; // 뜻 입력 필드 초기화
    feedback.style.visibility = "hidden"; // 피드백 숨김
    customInput.focus(); // 커스텀 입력 필드에 포커스
}


function endGame() {
    wordDisplay.textContent = "Game Over!";
    meaningDisplay.textContent = "";
    controlButton.textContent = "Start Game"; // Reset button to Start Game
}

function normalizeText(text) {
    return text
        .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ") // Normalize all non-breaking spaces to U+0020
        .replace(/‐|‑|–|—/g, "-") // Normalize all dash types to "-"
        .replace(/\s+/g, " ")     // Replace multiple spaces with a single space
        .trim();                  // Remove leading and trailing spaces
}

function checkInput() { 
    const wordIndex = shuffledIndices[currentWordIndex]; // 현재 단어의 인덱스 가져오기
    const currentWord = words[wordIndex]; // 정답 단어
    const currentMeaning = meanings[wordIndex]; // 정답 뜻
    const userWord = customContent.trim(); // 사용자 입력 단어
    const userMeaning = meaningInput.value.trim(); // 사용자 입력 뜻

    // 단어와 뜻 비교
    const isWordIdentical = currentWord === userWord;
    const isMeaningIdentical = currentMeaning === userMeaning;

    if (isWordIdentical && isMeaningIdentical) {
        currentWordIndex++; // 다음 단어로 이동
        showNextWord(); // 다음 단어 표시
    } else {
        feedback.style.visibility = "visible"; // 틀린 경우 피드백 표시
        setTimeout(() => {
            feedback.style.visibility = "hidden"; // 1.5초 후 피드백 숨김
        }, 1500);
    }
}




function updateCustomInput() {
    customInput.innerHTML = "";
    for (let i = 0; i < customContent.length; i++) {
        const span = document.createElement("span");
        span.textContent = customContent[i];
        customInput.appendChild(span);
    }

    const caretElement = document.createElement("div");
    caretElement.className = "caret";
    customInput.insertBefore(caretElement, customInput.childNodes[caretPosition] || null);
}

function updateInputModeDisplay() {
    // Do nothing, as the mode is now hidden from the user
}

customInput.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
        if (caretPosition > 0) {
            customContent =
                customContent.substring(0, caretPosition - 1) +
                customContent.substring(caretPosition);
            caretPosition--;
            updateCustomInput();
        }
    } else if (event.key === "ArrowLeft") {
        if (caretPosition > 0) {
            caretPosition--;
            updateCustomInput();
        }
    } else if (event.key === "ArrowRight") {
        if (caretPosition < customContent.length) {
            caretPosition++;
            updateCustomInput();
        }
    } else if (event.key.length === 1) {
        const character = isKoreanMode ? inko.en2ko(event.key) : event.key;
        customContent =
            customContent.substring(0, caretPosition) +
            character +
            customContent.substring(caretPosition);
        caretPosition++;
        updateCustomInput();
    } else if (event.key === "Enter") {
        event.preventDefault();
        checkInput();
    } else if (event.getModifierState && event.getModifierState("CapsLock")) {
        isKoreanMode = !isKoreanMode;
        // Internal toggle, no user display
    }
});

meaningInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        checkInput();
    }
});

function compareStrings(expected, userInput) {
    expected = expected || ""; // undefined 값을 빈 문자열로 대체
    userInput = userInput || "";

    const maxLength = Math.max(expected.length, userInput.length);
    let differences = [];
    let isIdentical = true;

    for (let i = 0; i < maxLength; i++) {
        const expectedChar = expected.charAt(i) || "N/A"; // 정답 문자
        const userChar = userInput.charAt(i) || "N/A";   // 사용자 입력 문자

        const expectedCode = expected.charCodeAt(i) || "N/A";
        const userCode = userInput.charCodeAt(i) || "N/A";

        if (expectedChar !== userChar) {
            differences.push(
                `Difference at index ${i}: '${expectedChar}' (${expectedCode}) vs '${userChar}' (${userCode})`
            );
            isIdentical = false;
        }
    }

    if (isIdentical) {
        console.log("The strings are identical.");
    } else {
        console.log("Differences found:\n" + differences.join("\n"));
    }

    return isIdentical;
}


