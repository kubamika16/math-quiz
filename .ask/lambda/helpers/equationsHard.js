const randomFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

const decimalNumber = (num) => !!(num % 1);

const numbers = {
  firstNumberArray: Array.from({ length: 51 }, (_, i) => i + 50),
  secondNumberArray: Array.from({ length: 42 }, (_, i) => i + 9),
  firstNumber: undefined,
  secondNumber: undefined,
  secondNumberTimesDivided: randomFromArray([2, 3, 4, 5, 6, 7, 8, 9]),
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
  console.log((numbers.firstNumber + "").indexOf("0") > -1);

  operands.index = operands.types.indexOf(randomFromArray(operands.types));
  operands.choosen = operands.types[operands.index];
  operands.choosenInWords = operands.inWords[operands.index];

  if (operands.choosen === "*" || operands.choosen === "/") {
    userResult.question = `${numbers.firstNumber} ${operands.choosen} ${numbers.secondNumberTimesDivided}`;
    userResult.questionInWords = `${numbers.firstNumber} ${operands.choosenInWords} ${numbers.secondNumberTimesDivided}`;
    userResult.result = eval(userResult.question);
  } else {
    userResult.question = `${numbers.firstNumber} ${operands.choosen} ${numbers.secondNumber}`;
    userResult.questionInWords = `${numbers.firstNumber} ${operands.choosenInWords} ${numbers.secondNumber}`;
    userResult.result = eval(userResult.question);
  }
};

const newQuestion = function () {
  creatingResponse();

  if (
    !decimalNumber(userResult.result) &&
    !equations.some((el) => el === userResult.question) &&
    !(
      (numbers.firstNumber + "").indexOf("0") > -1 ||
      (numbers.secondNumber + "").indexOf("0") > -1
    )
  ) {
    console.log((numbers.firstNumber + "").indexOf("0") > -1);
    equations.push({
      userResult: userResult.question,
      questionInWords: userResult.questionInWords,
      result: userResult.result,
    });
  }

  while (
    decimalNumber(userResult.result) &&
    ((numbers.firstNumber + "").indexOf("0") > -1 ||
      (numbers.secondNumber + "").indexOf("0") > -1)
  ) {
    creatingResponse();

    if (
      !decimalNumber(userResult.result) &&
      !equations.some((el) => el === userResult.question)
    ) {
      console.log((numbers.firstNumber + "").indexOf("0") > -1);
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
