const questionBox = document.getElementById("questionBox");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const timerEl = document.getElementById("timer");
const progressBar = document.getElementById("progressBar");
const questionTimerEl = document.getElementById("questionTimer");

let questions = [];
let currentQuestion = 0;
let selectedAnswers = [];
let totalTime = 1200; // 20 daqiqa
let questionTimeLeft = 30;
let timerInterval, questionTimerInterval;

// ==================== TEST BIR MARTA ISHLASH HIMOYASI ====================
const savedProgress = JSON.parse(localStorage.getItem("kpk-progress") || "{}");
if (savedProgress.initialTest && savedProgress.initialTest.completed === true) {
    window.location.href = "dashboard.html";
}

async function loadQuestions() {
    try {
        const response = await fetch("./json/questions.json");

        if (!response.ok) {
            throw new Error("Savollar topilmadi");
        }

        const data = await response.json();

        questions = data;
        showQuestion();

    } catch (error) {
        console.error(error);

        document.getElementById("question-container").innerHTML = `
            <div class="error">
                Savollar yuklanmadi
            </div>
        `;
    }
}
function showQuestion() {
    const q = questions[currentQuestion];
    questionBox.innerHTML = `
        <h2 class="question-title">${currentQuestion + 1}. ${q.question}</h2>
    `;

    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.textContent = option;
        if (selectedAnswers[currentQuestion] === index) btn.classList.add("active");

        btn.onclick = () => {
            document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedAnswers[currentQuestion] = index;
        };
        questionBox.appendChild(btn);
    });

    updateProgress();
    resetQuestionTimer();
}

function updateProgress() {
    const percent = ((currentQuestion + 1) / questions.length) * 100;
    progressBar.style.width = `${percent}%`;
}

function startMainTimer() {
    timerInterval = setInterval(() => {
        totalTime--;
        const min = Math.floor(totalTime / 60);
        const sec = totalTime % 60;
        timerEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        if (totalTime <= 0) finishAssessment();
    }, 1000);
}

function startQuestionTimer() {
    questionTimerInterval = setInterval(() => {
        questionTimeLeft--;
        questionTimerEl.textContent = questionTimeLeft;
        if (questionTimeLeft <= 0) nextQuestion();
    }, 1000);
}

function resetQuestionTimer() {
    clearInterval(questionTimerInterval);
    questionTimeLeft = 30;
    questionTimerEl.textContent = questionTimeLeft;
    startQuestionTimer();
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        finishAssessment();
    }
}

nextBtn.onclick = () => nextQuestion();

prevBtn.onclick = () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
};

function finishAssessment() {
    clearInterval(timerInterval);
    clearInterval(questionTimerInterval);

    let score = 0;
    let reviewHTML = '';

    questions.forEach((q, i) => {
        const userAnswer = selectedAnswers[i];
        const isCorrect = userAnswer === q.correct;
        if (isCorrect) score++;

        const userText = userAnswer !== undefined ? q.options[userAnswer] : "Javob tanlanmadi";
        const correctText = q.options[q.correct];

        reviewHTML += `
            <div class="review-item ${isCorrect ? 'correct' : 'wrong'}">
                <div class="review-question">
                    <strong>${i + 1}.</strong> ${q.question}
                </div>
                <div class="review-answers">
                    <div class="user-answer">
                        Siz tanlagan: <strong>${userText}</strong>
                    </div>
                    ${!isCorrect ? `
                    <div class="correct-answer">
                        To'g'ri javob: <strong>${correctText}</strong>
                    </div>` : ''}
                </div>
            </div>
        `;
    });

    const percent = Math.round((score / questions.length) * 100);

    // Progress saqlash
    let progress = JSON.parse(localStorage.getItem("kpk-progress") || "{}");
    progress.initialTest = { 
        score, 
        percent, 
        total: questions.length, 
        completed: true 
    };

    if (percent >= 90) progress.maxLevel = 4;
    else if (percent >= 71) progress.maxLevel = 3;
    else if (percent >= 56) progress.maxLevel = 2;
    else progress.maxLevel = 1;

    if (!progress.modules) {
        progress.modules = {
            1: { unlocked: true, completed: false },
            2: { unlocked: percent >= 56, completed: false },
            3: { unlocked: percent >= 71, completed: false },
            4: { unlocked: percent >= 90, completed: false }
        };
    }

    localStorage.setItem("kpk-progress", JSON.stringify(progress));

    // Natija sahifasi
    questionBox.innerHTML = `
        <div class="result-box">
            <div class="result-circle ${percent >= 70 ? 'success' : 'warning'}">
                ${percent}%
            </div>
            
            <h2>Test Yakunlandi!</h2>
            <p class="summary">
                To'g'ri javoblar: <strong>${score} / ${questions.length}</strong>
            </p>

            <div class="review-container">
                ${reviewHTML}
            </div>

            <button class="btn btn-success btn-lg mt-4" onclick="window.location.href='dashboard.html'">
                Dashboardga o'tish →
            </button>
        </div>
    `;

    nextBtn.style.display = "none";
    prevBtn.style.display = "none";
}

loadQuestions();