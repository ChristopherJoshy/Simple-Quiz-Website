const quizTopicSelect = document.getElementById('quiz-topic');
const startQuizBtn = document.getElementById('start-quiz');
const quizArea = document.getElementById('quiz-area');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextQuestionBtn = document.getElementById('next-question');
const timerElement = document.getElementById('time-left');
const scoreElement = document.getElementById('score-count');
const winAnimation = document.getElementById('win-animation');
const winnerNameElement = document.getElementById('winner-name');
const finalScoreElement = document.getElementById('final-score');
const viewLeaderboardBtn = document.getElementById('view-leaderboard');
const leaderboardSection = document.getElementById('leaderboard-section');
const leaderboardList = document.getElementById('leaderboard-list');
const restartQuizBtn = document.getElementById('restart-quiz');
const returnHomeBtn = document.getElementById('return-home');
const exitQuizBtn = document.getElementById('exit-quiz');
const userNameInput = document.getElementById('user-name');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let userName = '';
let totalQuestions = 10;
let totalTime = 100;

startQuizBtn.addEventListener('click', () => {
    userName = userNameInput.value.trim();
    if (!userName) return;

    score = 0;
    currentQuestionIndex = 0;
    totalTime = 100;

    document.getElementById('user-input-section').classList.add('hidden');
    quizArea.classList.remove('hidden');
    fetchQuestions(quizTopicSelect.value);
});

async function fetchQuestions(topicId) {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=${totalQuestions}&category=${topicId}&type=multiple`);
        const data = await response.json();
        questions = data.results;
        showQuestion(0);
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

function showQuestion(index) {
    if (index >= questions.length) {
        calculateFinalScore();
        return;
    }

    const currentQuestion = questions[index];
    questionElement.innerHTML = decodeHtml(currentQuestion.question);

    const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
    answers.sort(() => Math.random() - 0.5);

    optionsElement.innerHTML = answers
        .map(answer => `<button class="option-btn" onclick="checkAnswer('${encodeURIComponent(answer)}')">${decodeHtml(answer)}</button>`)
        .join('');

    startTimer();
}

function checkAnswer(selectedAnswer) {
    const decodedAnswer = decodeURIComponent(selectedAnswer);
    if (decodedAnswer === questions[currentQuestionIndex].correct_answer) {
        score += 10;
    }
    currentQuestionIndex++;
    showQuestion(currentQuestionIndex);
}

function startTimer() {
    clearInterval(timer);
    timerElement.innerText = totalTime;

    timer = setInterval(() => {
        totalTime--;
        timerElement.innerText = totalTime;

        if (totalTime <= 0) {
            clearInterval(timer);
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        }
    }, 1000);
}

function calculateFinalScore() {
    clearInterval(timer);
    quizArea.classList.add('hidden');
    winAnimation.classList.remove('hidden');
    winnerNameElement.innerText = userName;

    const finalScore = score + Math.max(totalTime, 0);
    finalScoreElement.innerText = finalScore;
    updateLeaderboard(finalScore);
}

function updateLeaderboard(finalScore) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: userName, score: finalScore });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function decodeHtml(html) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
}

viewLeaderboardBtn.addEventListener('click', displayLeaderboard);

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardList.innerHTML = leaderboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('');
    leaderboardSection.classList.remove('hidden');
    winAnimation.classList.add('hidden');
}

restartQuizBtn.addEventListener('click', () => {
    leaderboardSection.classList.add('hidden');
    document.getElementById('user-input-section').classList.remove('hidden');
    userNameInput.value = '';
});

returnHomeBtn.addEventListener('click', () => {
    winAnimation.classList.add('hidden');
    document.getElementById('user-input-section').classList.remove('hidden');
    userNameInput.value = '';
});

exitQuizBtn.addEventListener('click', () => {
    window.close();
});
