
let words = [];
let meanings = [];
let shuffledIndices = [];
let currentWordIndex = 0;
let customContent = "";
let caretPosition = 0;
let currentFileName = "";
let isKoreanMode = false;

const fileStatus = document.getElementById("fileStatus");
const fileInputContainer = document.getElementById("fileInputContainer");
const csvFileInput = document.getElementById("csvFileInput");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const customInput = document.getElementById("customInput");
const meaningInput = document.getElementById("meaningInput");
const controlButton = document.getElementById("controlButton");
const feedback = document.getElementById("feedback");

csvFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        currentFileName = file.name;
        const reader = new FileReader();
        reader.onload = function (e) {
            parseCSV(e.target.result);
            fileStatus.textContent = `Loaded file: ${currentFileName}`;
            fileStatus.style.display = "block";
        };
        reader.readAsText(file);
    }
});

controlButton.addEventListener("click", () => {
    if (words.length > 0) {
    if (controlButton.textContent === "Start Game") {
        fileInputContainer.style.display = "none";
        startGame();
    } else if (controlButton.textContent === "Skip") {
        skipWord();
    }
    } else {
        alert("Please upload a valid CSV file.");
    }
    });
    // 커스텀 입력 필드에서의 키 입력을 처리하는 이벤트 리스너
    customInput.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
    // 백스페이스 처리
    if (caretPosition > 0) {
        customContent =
            customContent.substring(0, caretPosition - 1) +
            customContent.substring(caretPosition);
        caretPosition--;
        updateCustomInput(); // 커서와 내용을 업데이트
    }
    } else if (event.key === "ArrowLeft") {
    // 왼쪽 화살표 처리
    if (caretPosition > 0) {
        caretPosition--;
        updateCustomInput();
    }
    } else if (event.key === "ArrowRight") {
    // 오른쪽 화살표 처리
    if (caretPosition < customContent.length) {
        caretPosition++;
        updateCustomInput();
    }
    } else if (event.key === " ") {
    // 스페이스바 처리
    customContent =
        customContent.substring(0, caretPosition) +
        " " +  // 스페이스 문자 추가
        customContent.substring(caretPosition);
    caretPosition++;  // 커서 위치 업데이트
    updateCustomInput();
    } else if (event.key.length === 1) {
    // 일반 문자 처리
    const character = isKoreanMode ? inko.en2ko(event.key) : event.key;
    customContent =
        customContent.substring(0, caretPosition) +
        character +
        customContent.substring(caretPosition);
    caretPosition++;
    updateCustomInput();
    } else if (event.key === "Enter") {
    // 엔터키 처리
    event.preventDefault();
    checkInput();  // 입력 확인
    }
    });

    // 커스텀 입력 필드의 텍스트와 커서를 화면에 반영
    function updateCustomInput() {
    customInput.innerHTML = "";  // 기존 내용을 지우고
    // customContent 텍스트를 표시
    for (let i = 0; i < customContent.length; i++) {
    const span = document.createElement("span");
    span.textContent = customContent[i];
    customInput.appendChild(span);
    }

    // 커서 표시
    const caretElement = document.createElement("div");
    caretElement.className = "caret";
    customInput.insertBefore(caretElement, customInput.childNodes[caretPosition] || null);
}

meaningInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();  // 기본 엔터키 동작 방지
        checkInput();  // 입력 확인
    }
});



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
                words.push(english.trim());
                meanings.push(meaning.trim());
            }
        }
    });

    if (words.length === 0) {
        alert("CSV is empty or incorrectly formatted.");
    }
}

function startGame() {
    shuffledIndices = Array.from({ length: words.length }, (_, i) => i).sort(() => Math.random() - 0.5);
    currentWordIndex = 0;
    updateProgress();
    nextWord();
    controlButton.textContent = "Skip"; // 게임 시작 시 "Skip" 버튼으로 변경
}

function nextWord() {
    if (currentWordIndex >= shuffledIndices.length) {
        endGame();
        return;
    }

    const wordIndex = shuffledIndices[currentWordIndex];
    document.getElementById("word").textContent = words[wordIndex];
    document.getElementById("meaning").textContent = meanings[wordIndex];

    customContent = ""; // 사용자 입력 초기화
    caretPosition = 0;
    meaningInput.value = ""; // 뜻 입력 필드 초기화
    updateCustomInput(); // 커스텀 입력 필드 업데이트
    updateProgress(); // 진행 상황 업데이트

    // "meaningInput"에 포커스를 자동으로 주어 사용자가 입력할 수 있도록 함
    customInput.focus();
}

function updateProgress() {
    const progress = currentWordIndex;
    const total = shuffledIndices.length;
    progressFill.style.width = `${(progress / total) * 100}%`;
}

function checkInput() {
    const wordIndex = shuffledIndices[currentWordIndex];
    const correctWord = words[wordIndex];
    const correctMeaning = meanings[wordIndex];
    const userMeaning = meaningInput.value.trim();

    if (customContent.trim() === correctWord && userMeaning === correctMeaning) {
        currentWordIndex++;
        nextWord();
    } else {
        feedback.style.visibility = "visible";
        setTimeout(() => {
            feedback.style.visibility = "hidden";
        }, 1500);
    }
}

function skipWord() {
currentWordIndex++;
    if (currentWordIndex >= shuffledIndices.length) {
        ndGame();
    } else {
        nextWord();
    }
}


function endGame() {
    controlButton.textContent = "Start Game"; // 게임 종료 시 "Start Game" 버튼으로 변경
}
