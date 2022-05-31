const randomFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

const decimalNumber = (num) => !!(num % 1);

const numbers = {
  firstNumberArray: [10, 9, 8, 7, 6],
  secondNumberArray: [5, 4, 3, 2],
  firstNumber: undefined,
  secondNumber: undefined,
};

const operands = {
  // types: ["/"],
  // inWords: ["divided by"],
  types: ["+", "-", "*", "/"],
  inWords: ["plus", "minus", "times", "divided by"],
  index: undefined,
  choosen: undefined,
  choosenInWords: undefined,
};

const userResult = {
  question: undefined,
  questionInWords: undefined,
  result: undefined,
};

const equations = [];

const creatingResponse = function () {
  numbers.firstNumber = randomFromArray(numbers.firstNumberArray);
  numbers.secondNumber = randomFromArray(numbers.secondNumberArray);

  operands.index = operands.types.indexOf(randomFromArray(operands.types));
  operands.choosen = operands.types[operands.index];
  operands.choosenInWords = operands.inWords[operands.index];

  userResult.question = `${numbers.firstNumber} ${operands.choosen} ${numbers.secondNumber}`;
  userResult.questionInWords = `${numbers.firstNumber} ${operands.choosenInWords} ${numbers.secondNumber}`;
  userResult.result = eval(userResult.question);
};

const newQuestion = function () {
  creatingResponse();

  if (
    !decimalNumber(userResult.result) &&
    !equations.some((el) => el === userResult.question)
  ) {
    equations.push({
      userResult: userResult.question,
      questionInWords: userResult.questionInWords,
      result: userResult.result,
    });
  }

  while (decimalNumber(userResult.result)) {
    creatingResponse();

    if (
      !decimalNumber(userResult.result) &&
      !equations.some((el) => el === userResult.question)
    ) {
      equations.push({
        userResult: userResult.question,
        questionInWords: userResult.questionInWords,
        result: userResult.result,
      });
    }
  }
};

const createQuestions = function () {
  while (equations.length != 5) {
    newQuestion();
  }
};
// createQuestions();

module.exports = { equations, createQuestions };
