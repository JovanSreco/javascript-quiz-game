"use strict";
const APIURL = "https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple";
const MAX_QUESTIONS = 10;
const MAX_SCORE = 5;

const containerQuiz = document.getElementById("container__quiz")
const headingParagraph = document.querySelector("[data-heading-p]")
const questionNumberElement = document.querySelector("[data-question-number]")
const scoreElement = document.querySelector("[data-score-number]")
const questionElement = document.querySelector("[data-quiz-question]")
const answersParent = document.querySelector("[data-quiz-answers-buttons]")
const buttonAnswers = document.querySelectorAll("[data-button-answers]")
const quizWlMessage = document.querySelector("[data-quiz-wl-message]")
const btnNewGame = document.querySelector("[data-btn-new-game]")
const btnNext = document.querySelector("[data-btn-next]")
const questionsSet = new Set()
// Setting up a iterator for the Set()
let iteratorSet = questionsSet.values()
let questionNumber = 0
let finalScore = 0
let correctAnswer

//Flexible heading paragraph, max questions and scores.
//If you want to change the MAX_QUESTIONS variable you must fetch another URL from https://opentdb.com/api_config.php
//The current API URL takes just 10 objects (10 questions)
headingParagraph.textContent = `Answer ${MAX_SCORE} questions to win the Quiz`
questionNumberElement.textContent = `${questionNumber}/${MAX_QUESTIONS}`
scoreElement.textContent = `${finalScore}/${MAX_SCORE}`

btnNewGame.addEventListener("click", (e) => {
    resetAllForNewGame(e.target)
    newGame()
})

function btnNextFunc() {
    //Start iteration if questionNumber is not 0
    if(questionNumber) nextIteration()
}
// Everytime the new game starts a JSON filled is fetched and processed
function getRandomQuestions() {
    return fetch(APIURL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json()})
        .then(data => data.results) 
        .catch(error => alert(`Could not get questions: ${error}`));
}

async function newGame() {
    const questionsObj = await getRandomQuestions()
    // Apend object in the new set() for later use
    questionsObj.forEach( obj => {
        //Creating an object with no prototype to imitate key value pairs structure (new Map() can do this better)
        const objectTemp = Object.create(null)
        objectTemp.question = obj.question
        objectTemp.correct = obj.correct_answer
        objectTemp.incorrect = obj.incorrect_answers
        questionsSet.add(objectTemp)
    })
    // Need to do the first iteration after the data has been colected
    nextIteration()
    btnNext.addEventListener("click", btnNextFunc)
}

function nextIteration() {
    removeClases()
    //If questions have exeded the MAX_QUESTIONS then end game else do the next question
    if(questionNumber + 1 > MAX_QUESTIONS) {
        endGame();
    }  else {
        proceedWithIteration() 
        answersParent.addEventListener("click", answerParentListensButtons, {once:true})
    }
}

function proceedWithIteration() {
    questionNumber++;
    questionNumberElement.innerHTML = `${questionNumber}/${MAX_QUESTIONS}`
    //Use the iterator to access the next object, on first iterations it's the first object in set
    const initQuestion = iteratorSet.next().value
    //Store the correct answer to a global variable
    correctAnswer = initQuestion.correct
    questionElement.innerHTML = initQuestion.question
    //Randomize order of the correct answer
    const answersForAppending = initQuestion.incorrect
    answersForAppending.splice(Math.floor(Math.random() * 5), 0, initQuestion.correct)
    //Take all answers elements and append answers
    Array.from(buttonAnswers).forEach( (element, index) => {
        element.innerHTML = answersForAppending[index]
        element.dataset.value = answersForAppending[index]
    })
}

function answerParentListensButtons(e) {
    let answer;
    // Because the event delegation was used and the listener fires only once we have to asign
    // a new listener every time the user clicks whitespace between the buttons or the letters for the answers
    if(e.target.tagName === "BUTTON"){
        answer = e.target.dataset.value
    } else {
        answersParent.addEventListener("click", answerParentListensButtons, {once:true})
        return;
    }

    if (answer === correctAnswer){
        //If answer is correct
        finalScore++
        scoreElement.innerHTML = `${finalScore}/${MAX_SCORE}`
        if(questionNumber < MAX_QUESTIONS && finalScore < MAX_SCORE){
            containerQuiz.classList.add("success")
            quizWlMessage.classList.add("success")
            quizWlMessage.innerHTML = "Correct!"
        } else {
            endGame()
        }
    } else {
        //If answer is incorrect
        if(questionNumber < MAX_QUESTIONS && finalScore < MAX_SCORE){
            containerQuiz.classList.add("faliure")
            quizWlMessage.classList.add("faliure")
            quizWlMessage.innerHTML = "Incorrect!"
        } else {
            endGame()
        }
    }
}

function endGame() {
    //End game, either the player won or lost and remove event listener on next button to avoid eventListener duplication
    if(finalScore === MAX_SCORE) {
        containerQuiz.classList.add("success")
        quizWlMessage.classList.add("success")
        quizWlMessage.innerHTML = "Congratulations you have won!"
    } else {
        containerQuiz.classList.add("faliure")
        quizWlMessage.classList.add("faliure")
        quizWlMessage.innerHTML = "You have lost, try again!"
    }
    btnNext.removeEventListener("click", btnNextFunc) 
    btnNewGame.classList.remove("hide")
}


function resetAllForNewGame(newGameBtnElement) {
    removeClases()
    // Hide the start button so the user does not start new games until he finishes the first one
    newGameBtnElement.classList.add("hide")
    //Do all of the resets
    questionNumber = 0
    finalScore = 0
    correctAnswer = ""
    questionNumberElement.textContent = `${questionNumber}/${MAX_QUESTIONS}`
    scoreElement.textContent = `${finalScore}/${MAX_SCORE}`
    //Clear our set for next use
    questionsSet.clear()
}

function removeClases() {
//Remove all classes for the next question
    containerQuiz.classList.remove("faliure")
    containerQuiz.classList.remove("success")
    quizWlMessage.classList.remove("faliure")
    quizWlMessage.classList.remove("success")
}