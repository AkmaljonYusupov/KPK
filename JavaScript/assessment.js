
const questionBox =
document.getElementById("questionBox");

const nextBtn =
document.getElementById("nextBtn");

const prevBtn =
document.getElementById("prevBtn");

const progressBar =
document.getElementById("progressBar");

const timerElement =
document.getElementById("timer");

const questionTimerElement =
document.getElementById("questionTimer");

let questions = [];

let currentIndex = 0;

let score = 0;

let userAnswers = [];

let totalTime = 300;

let questionTime = 20;

let totalTimer;
let questionTimer;

const currentLang =
localStorage.getItem("kpk-lang")
|| "uz";

async function loadLanguage(){

  const response =
  await fetch(`./json/${currentLang}.json`);

  const data =
  await response.json();

  document.documentElement.lang =
  currentLang;

  document.querySelectorAll("[data-lang]")
  .forEach(element => {

    const key =
    element.getAttribute("data-lang");

    if(data[key]){

      element.textContent =
      data[key];

    }

  });

}

async function loadQuestions(){

  const response =
  await fetch("./json/questions.json");

  const data =
  await response.json();

  questions =
  [...data]
  .sort(() => Math.random() - 0.5)
  .slice(0,15);

  showQuestion();

  startTotalTimer();

  startQuestionTimer();

}

function showQuestion(){

  clearInterval(questionTimer);

  questionTime = 20;

  questionTimerElement.textContent =
  questionTime;

  startQuestionTimer();

  updateProgress();

  const current =
  questions[currentIndex];

  questionBox.innerHTML = "";

  const title =
  document.createElement("h2");

  title.className =
  "question-title";

  title.textContent =
  `${currentIndex + 1}. ${current.question}`;

  questionBox.appendChild(title);

  const shuffledOptions =
  [...current.options]
  .sort(() => Math.random() - 0.5);

  shuffledOptions.forEach(option => {

    const button =
    document.createElement("button");

    button.className =
    "option-btn";

    button.textContent =
    option;

    if(userAnswers[currentIndex] === option){

      button.classList.add("active");

    }

    button.onclick = () => {

      document
      .querySelectorAll(".option-btn")
      .forEach(btn => {

        btn.classList.remove("active");

      });

      button.classList.add("active");

      userAnswers[currentIndex] =
      option;

    };

    questionBox.appendChild(button);

  });

}

function updateProgress(){

  const percent =

  ((currentIndex + 1)
  / questions.length) * 100;

  progressBar.style.width =
  `${percent}%`;

}

function startTotalTimer(){

  totalTimer = setInterval(() => {

    totalTime--;

    const minutes =
    Math.floor(totalTime / 60);

    const seconds =
    totalTime % 60;

    timerElement.textContent =

    `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

    if(totalTime <= 0){

      finishTest();

    }

  },1000);

}

function startQuestionTimer(){

  questionTimer = setInterval(() => {

    questionTime--;

    questionTimerElement.textContent =
    questionTime;

    if(questionTime <= 0){

      nextQuestion();

    }

  },1000);

}

function nextQuestion(){

  clearInterval(questionTimer);

  const current =
  questions[currentIndex];

  const correctAnswer =
  current.options[current.correct];

  if(
    userAnswers[currentIndex] ===
    correctAnswer
  ){

    if(
      !questions[currentIndex].counted
    ){

      score++;

      questions[currentIndex].counted =
      true;

    }

  }

  currentIndex++;

  if(currentIndex >= questions.length){

    finishTest();

    return;

  }

  showQuestion();

}

nextBtn.onclick = () => {

  nextQuestion();

};

prevBtn.onclick = () => {

  if(currentIndex > 0){

    currentIndex--;

    showQuestion();

  }

};

function finishTest(){

  clearInterval(totalTimer);

  clearInterval(questionTimer);

  const percent =
  Math.floor((score / 15) * 100);

  let unlockedModule = 1;

  let grade = 2;

  let resultText = "";

  if(percent >= 56 && percent <= 70){

    unlockedModule = 2;

    grade = 3;

    resultText = "3 baho";

  }

  else if(percent >= 71 && percent <= 89){

    unlockedModule = 3;

    grade = 4;

    resultText = "4 baho";

  }

  else if(percent >= 90){

    unlockedModule = 4;

    grade = 5;

    resultText = "5 baho";

  }

  else{

    resultText = "2 baho";

  }

  const progress = {

    percent,

    grade,

    unlockedModule,

    currentModule:
    unlockedModule,

    completedModules: [],

    modules: {

      1:{
        unlocked:true,
        completed:false
      },

      2:{
        unlocked:
        unlockedModule >= 2,

        completed:false
      },

      3:{
        unlocked:
        unlockedModule >= 3,

        completed:false
      },

      4:{
        unlocked:
        unlockedModule >= 4,

        completed:false
      }

    }

  };

  localStorage.setItem(
    "kpk-progress",
    JSON.stringify(progress)
  );

  questionBox.innerHTML =

  `
  <div class="result-box">

    <div class="result-icon">
      🏆
    </div>

    <h2>
      Test yakunlandi
    </h2>

    <p>
      Sizning natijangiz
    </p>

    <div class="result-percent">
      ${percent}%
    </div>

    <div class="result-grade">
      ${resultText}
    </div>

    <button
      class="finish-btn"
      onclick="goDashboard()"
    >

      Dashboardga o‘tish

    </button>

  </div>
  `;

  nextBtn.style.display =
  "none";

  prevBtn.style.display =
  "none";

}

window.goDashboard = function(){

  window.location.href =
  "./dashboard.html";

};

loadLanguage();

loadQuestions();

