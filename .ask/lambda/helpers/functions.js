const equationsEasy = require("./equationsEasy");
const equationsMedium = require("./equationsMedium");
const equationsHard = require("./equationsHard");
const equationsExtreme = require("./equationsExtreme");

const randomFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

const messages = {
  welcome: [
    // "Hi! Welcome in the math quiz! To begin, say the level you want to start: easy, medium, hard, or extreme",
    // "Hello! This is a math quiz game. I will ask you five questions, and you have some time to give me correct answer. Now, choose your level: easy, medium, hard, or extreme?",
    // "Holla! Happy to see you! This is a math quiz game. To start, pick a level: easy, medium, hard, or extreme?",
    // "How are you? If you want to play this math quiz game, pick a level: easy, medium, hard, or extreme?",
    // "Dzien Dobry! You opened a math quiz app. To start, choose a level: easy, medium, hard, or extreme",
    // "Hello! To start the game, pick the level: easy, medium, hard, extreme.",
    // "Holla Senior! Which level would you like? Easy, medium, hard, or extreme?",
    "Hi! Today this game is being changed by adding new functions by our programmers. Sorry for all inconveniences. Easy, medium or hard level? ",
  ],
  levelNotUnderstood: [
    "Sorry, could you say again which level you would like to choose?",
    "I'm afraid I didn't hear that. Could you say that lvel again?",
    "Hmm, I'm not sure. Level easy, medium, hard, or extreme?",
    "Sorry, I have small problem with hearing. Could you tell me a level once again?",
    "I am really sorry, but I didn't get that. Say the level again.",
    "I am still young assistant, and still learning to listen. Could you tell me once again what level would you like to choose?",
  ],
  choosenLevel: [
    "Alright! Let's begin with level",
    "Awesome, level",
    "Ok, I will give you questions for level",
    "Good choice! Level",
    "Ok! Good luck with level",
    "You have choosen level",
  ],
  nextQuestion: [
    "Next question:",
    "Next:",
    "Another one:",
    "Moving on:",
    "Upcoming question:",
    "Ok:",
    "This one is tricky:",
    "Be careful, next one:",
  ],
  result: [
    "That will be",
    "Result:",
    "The result is:",
    "Answer for that question is",
    "Solution for that question is",
    "It is",
  ],
  help: [
    ` This is a math quiz game. I will ask you five questions, and you will have to tell the correct answer. This game has three levels. Easy, medium and hard. For every easy question, you get one point. Medium, 3 points, and hard, five points. To begin, say the level you want to start.`,
  ],
};

// const additionalTime = (seconds) => `<break time="${seconds}s"/>`;

const audio = {
  repromptClock: `<audio src="soundbank://soundlibrary/alarms/beeps_and_bloops/clock_02"/>`,
  correctAnswer: `<audio src="soundbank://soundlibrary/alarms/beeps_and_bloops/bell_02"/>`,
  incorrectAnswer: `<audio src="soundbank://soundlibrary/alarms/beeps_and_bloops/buzz_04"/>`,
  answerTime: `<audio src="soundbank://soundlibrary/alarms/beeps_and_bloops/bell_04"/>`,

  additionalTime(seconds) {
    return `<break time="${seconds}s"/>`;
  },
};

const addingPoints = (level, correct) => {
  if (level === "easy") return correct;
  if (level === "medium") return correct * 3;
  if (level === "hard") return correct * 5;
  if (level === "extreme") return correct * 10;
};

const newEquations = function () {
  equationsEasy.equations.length = 0;
  equationsEasy.createQuestions();

  equationsMedium.equations.length = 0;

  equationsHard.equations.length = 0;
  equationsHard.createQuestions();

  equationsExtreme.equations.length = 0;
  equationsExtreme.createQuestions();
};

module.exports = {
  messages,
  randomFromArray,
  newEquations,
  addingPoints,
  audio,
};
