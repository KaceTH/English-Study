
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

const dictionaryInfo = document.getElementById("dictionaryInfo");
const definitionDiv = document.getElementById("definition");
const ukDiv = document.getElementById("uk");
const usDiv = document.getElementById("us");

async function fetchDefinition(word) {
    const LINK_PREFIX = "https://dictionary.cambridge.org";
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const url = `${LINK_PREFIX}/dictionary/english/${word}`;

    try {
        const response = await fetch(`${proxyUrl}${url}`);
        if (!response.ok) {
            definitionDiv.innerHTML = `<iframe src="https://cors-anywhere.herokuapp.com/corsdemo" min-width="100%" height="240px"></iframe>`;
            throw new Error(`Error fetching data for "${word}".`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Extract dictionary details
        const definitionBlock = doc.querySelector(".def.ddef_d");
        const definition = definitionBlock ? definitionBlock.textContent.trim() : "Definition not found.";

        const ukIpaBlock = doc.querySelector(".uk .pron.dpron");
        const ukIpa = ukIpaBlock ? ukIpaBlock.textContent.replaceAll("/","").trim() : "";

        const usIpaBlock = doc.querySelector(".us .pron.dpron");
        const usIpa = usIpaBlock ? usIpaBlock.textContent.replaceAll("/","").trim() : "";

        const ukAudioSource = doc.querySelector(".uk span.daud source");
        const ukAudioUrl = ukAudioSource ? `${LINK_PREFIX}${ukAudioSource.getAttribute("src")}` : null;

        const usAudioSource = doc.querySelector(".us span.daud source");
        const usAudioUrl = usAudioSource ? `${LINK_PREFIX}${usAudioSource.getAttribute("src")}` : null;

        // Update dictionary info section with play/pause buttons

        definitionDiv.innerHTML = `${definition}`;

        ukDiv.innerHTML = `${ukAudioUrl ? `<button class="audio-control-button" id="ukAudioBtn">🔈</button> <label for="ukAudioBtn">UK  [ ${ukIpa} ]</label>` : ""}`;
        usDiv.innerHTML = `${usAudioUrl ? `<button class="audio-control-button" id="usAudioBtn">🔈</button> <label for="usAudioBtn">US  [ ${usIpa} ]</label>` : ""}`;


        // Add event listeners for play/pause buttons
        const ukAudioElement = new Audio(ukAudioUrl);
        const usAudioElement = new Audio(usAudioUrl);

        document.getElementById("ukAudioBtn")?.addEventListener("click", () => {
            if (ukAudioElement.paused) {
                ukAudioElement.play();
                document.getElementById("ukAudioBtn").textContent = "🔊"; // 버튼 텍스트 변경
            } else {
                ukAudioElement.pause();
                document.getElementById("ukAudioBtn").textContent = "🔈"; // 버튼 텍스트 변경
            }
        });

        document.getElementById("usAudioBtn")?.addEventListener("click", () => {
            if (usAudioElement.paused) {
                usAudioElement.play();
                document.getElementById("usAudioBtn").textContent = "🔊"; // 버튼 텍스트 변경
            } else {
                usAudioElement.pause();
                document.getElementById("usAudioBtn").textContent = "🔈"; // 버튼 텍스트 변경
            }
        });

        // Add event listeners to reset button text when audio ends
        ukAudioElement.addEventListener("ended", () => {
            document.getElementById("ukAudioBtn").textContent = "🔈"; // 오디오 끝나면 버튼 텍스트 변경
        });

        usAudioElement.addEventListener("ended", () => {
            document.getElementById("usAudioBtn").textContent = "🔈"; // 오디오 끝나면 버튼 텍스트 변경
        });

        usAudioElement.addEventListener("loadeddata", () => {
            usAudioElement.play();
            document.getElementById("usAudioBtn").textContent = "🔊"; // 버튼 텍스트 변경
            setTimeout(function() {
                ukAudioElement.play()
                document.getElementById("ukAudioBtn").textContent = "🔊"; // 버튼 텍스트 변경
            }, 2000 + usAudioElement.duration)
        });
        dictionaryInfo.style.display = "block";

    } catch (error) {
        console.error(error);
    }
}



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
        document.querySelector(".dictionary-info h2").innerText = "Meaning";
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
                words.push(normalizeText(english).trim());
                meanings.push(meaning.trim());
            }
        }
    });

    if (words.length === 0) {
        alert("CSV is empty or incorrectly formatted.");
    }
}

function normalizeText(text) {
    // 모든 공백 문자를 단일 스페이스로 변환
    text = text.replace(/[\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/g, " ");

    // 다양한 하이픈 변종을 표준 하이픈(-)으로 변환
    text = text.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, "-");

    return text.trim(); // 앞뒤 공백 제거
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
    const word = words[wordIndex];
    document.getElementById("word").textContent = word;
    document.getElementById("meaning").textContent = meanings[wordIndex];

    customContent = ""; // 사용자 입력 초기화
    caretPosition = 0;
    meaningInput.value = ""; // 뜻 입력 필드 초기화
    updateCustomInput(); // 커스텀 입력 필드 업데이트
    updateProgress(); // 진행 상황 업데이트

    // "meaningInput"에 포커스를 자동으로 주어 사용자가 입력할 수 있도록 함
    customInput.focus();

    definitionDiv.innerHTML = "";
    ukDiv.innerHTML = "Loading...";
    usDiv.innerHTML = "";

    // 단어에 대한 정의와 오디오를 로딩
    fetchDefinition(word); 
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
        endGame();
    } else {
        nextWord();
    }
}


function endGame() {
    document.getElementById("word").textContent = "Game Over (" + words.length + " Words)" ;
    document.getElementById("meaning").textContent = "게임이 끝났습니다.";
    controlButton.textContent = "Start Game"; // 게임 종료 시 "Start Game" 버튼으로 변경
}
