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
let questionNumber = 0
let finalScore = 0
let correctAnswer
const questionsSet = new Set()
// Setting up a iterator for the Set()
let iteratorSet = questionsSet.values()

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

btnNext.addEventListener("click", () => {
    // Start another iteration if all conditions have been meet and if the first round started
    if(questionNumber && questionNumber < MAX_QUESTIONS && finalScore < MAX_SCORE) nextIteration()
})

// Everytime the new game starts a json filled is fetched and processed
function newGame() {
    fetch(APIURL)
        .then(response => response.json())
        .then(data => {
            // Apend object in the new set() for later use
            data.results.forEach( obj => {
                questionsSet.add({
                    question: obj.question,
                    correct: obj.correct_answer,
                    incorrect: obj.incorrect_answers
                })
            })
            nextIteration()
        })
}

function nextIteration() {
    removeClases()
    //Update the index of the current question
    questionNumber++;
    questionNumberElement.innerHTML = `${questionNumber}/${MAX_QUESTIONS}`
    //Use the iterator to access the next object, on first iterations it's the first object in set
    const initQuestion = iteratorSet.next().value
    //Store the correct answer to a global variable
    correctAnswer = initQuestion.correct
    questionElement.innerHTML = initQuestion.question
    //Randomize order of the correct answer
    const answersForAppending = [...initQuestion.incorrect]
    answersForAppending.splice(Math.floor(Math.random() * 5), 0, initQuestion.correct)
    //Take all answers elements and append answers
    const btnAnswers = [...buttonAnswers]
    btnAnswers.forEach( (element, index) => {
        element.innerHTML = answersForAppending[index]
        element.dataset.value = answersForAppending[index]
    })
    // Use event delegation so that the user has just one chance to answer the question
    parentListensButtons()
}

function parentListensButtons() {
    // Use event delegation so that the user has just one chance to answer the question
    answersParent.removeEventListener
    answersParent.addEventListener("click", (e) => {
        const answer = e.target.dataset.value
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
    }, {once:true})
}

function endGame() {
    if(finalScore === MAX_SCORE) {
        containerQuiz.classList.add("success")
        quizWlMessage.classList.add("success")
        quizWlMessage.innerHTML = "Congratulations you have won!"
    } else {
        containerQuiz.classList.add("faliure")
        quizWlMessage.classList.add("faliure")
        quizWlMessage.innerHTML = "You have lost, try again!"
    }

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
    if(questionsSet) {
        questionsSet.forEach(obj => {
            questionsSet.delete(obj)
        })
    }
}

function removeClases() {
//Remove all classes for the next question
    containerQuiz.classList.remove("faliure")
    containerQuiz.classList.remove("success")
    quizWlMessage.classList.remove("faliure")
    quizWlMessage.classList.remove("success")
}
