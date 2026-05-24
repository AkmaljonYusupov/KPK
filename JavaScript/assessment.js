const questionBox =
document.getElementById("questionBox");

const nextBtn =
document.getElementById("nextBtn");

const prevBtn =
document.getElementById("prevBtn");

const timer =
document.getElementById("timer");

const questionNumber =
document.getElementById("questionNumber");

const scoreText =
document.getElementById("score");

const percentText =
document.getElementById("percent");

const progressBar =
document.getElementById("progressBar");

let questions = [];

let currentQuestion = 0;

let selectedAnswers = [];

let totalTime = 300;

let timerInterval;

async function loadQuestions(){

    try{

        const response =
        await fetch("./json/questions.json");

        const data =
        await response.json();

        questions = data
        .sort(() => Math.random() - 0.5)
        .slice(0,10);

        showQuestion();

        startTimer();

    }

    catch(error){

        questionBox.innerHTML = `
        
            <div class="result-box">

                <h2>Xatolik</h2>

                <p>
                    Savollar yuklanmadi
                </p>

            </div>

        `;

    }

}

function showQuestion(){

    const question =
    questions[currentQuestion];

    questionNumber.innerText =
    `${currentQuestion + 1} / ${questions.length}`;

    updateProgress();

    questionBox.innerHTML = `
    
        <h2 class="question-title">

            ${currentQuestion + 1}.
            ${question.question}

        </h2>
    
    `;

    question.options.forEach(option => {

        const button =
        document.createElement("button");

        button.classList.add("option-btn");

        button.innerText = option;

        if(
            selectedAnswers[currentQuestion]
            === option
        ){
            button.classList.add("active");
        }

        button.onclick = () => {

            document
            .querySelectorAll(".option-btn")
            .forEach(btn => {

                btn.classList.remove("active");

            });

            button.classList.add("active");

            selectedAnswers[currentQuestion]
            = option;

            updateScore();

        };

        questionBox.appendChild(button);

    });

}

function updateProgress(){

    const percent =
    ((currentQuestion + 1)
    / questions.length) * 100;

    progressBar.style.width =
    `${percent}%`;

}

function updateScore(){

    let score = 0;

    questions.forEach((question,index)=>{

        if(
            selectedAnswers[index]
            === question.answer
        ){
            score++;
        }

    });

    scoreText.innerText = score;

    const percent =
    Math.round(
        (score / questions.length) * 100
    );

    percentText.innerText =
    `${percent}%`;

}

function startTimer(){

    timerInterval = setInterval(()=>{

        totalTime--;

        const minutes =
        Math.floor(totalTime / 60);

        const seconds =
        totalTime % 60;

        timer.innerText =
        `${String(minutes)
        .padStart(2,"0")}:${String(seconds)
        .padStart(2,"0")}`;

        if(totalTime <= 0){

            finishAssessment();

        }

    },1000);

}

nextBtn.onclick = ()=>{

    if(
        currentQuestion
        < questions.length - 1
    ){

        currentQuestion++;

        showQuestion();

    }

    else{

        finishAssessment();

    }

};

prevBtn.onclick = ()=>{

    if(currentQuestion > 0){

        currentQuestion--;

        showQuestion();

    }

};

function finishAssessment(){

    clearInterval(timerInterval);

    let score = 0;

    questions.forEach((question,index)=>{

        if(
            selectedAnswers[index]
            === question.answer
        ){
            score++;
        }

    });

    const finalPercent =
    Math.round(
        (score / questions.length) * 100
    );

    questionBox.innerHTML = `
    
        <div class="result-box">

            <div class="result-circle">

                ${finalPercent}%

            </div>

            <h2>
                Test Yakunlandi
            </h2>

            <p>

                To'g'ri javoblar:
                ${score} / ${questions.length}

            </p>

            <button
                class="btn next-btn"

                onclick="
                window.location.href=
                'dashboard.html'
                ">

                Dashboardga o'tish

            </button>

        </div>

    `;

    nextBtn.style.display = "none";

    prevBtn.style.display = "none";

}

loadQuestions();
