const randomFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

const decimalNumber = (num) => !!(num % 1);

const fromXtoY = (from, length) =>
  randomFromArray(Array.from({ length: length }, (_, i) => i + from));

let numbers2count = Array.from({ length: 86 }, (_, i) => i + 14);

const numbersToDelete = [11, 20, 21, 30, 31, 40, 41, 50, 60, 70, 80, 90];
numbersToDelete.forEach((numberDelete) => {
  numbers2count = numbers2count.filter((number) => number !== numberDelete);
});
//////////////////////////////Times////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
const timesFunction = () => {
  const twoTimes = `2 * ${fromXtoY(1, 9)}${fromXtoY(6, 4)}`;
  const threeTimes = `3 * ${fromXtoY(1, 9)}${fromXtoY(2, 5)}`;
  const fourTimes = `4 * 1${fromXtoY(2, 5)}`;
  const fiveSixTimes = `${randomFromArray([5, 6])} * 1${fromXtoY(2, 4)}`;
  const sevenEightTimes = `${randomFromArray([7, 8])} * 1${fromXtoY(2, 4)}`;
  const nineTimes = `9 * 1${fromXtoY(2, 3)}`;

  let dataTimes = randomFromArray([
    twoTimes,
    threeTimes,
    fourTimes,
    fiveSixTimes,
    sevenEightTimes,
    nineTimes,
  ]);

  return (times = {
    calculation: dataTimes,
    calculationWords: dataTimes,
    result: eval(dataTimes),
  });
};

////////////////////Plus////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

const plusFunction = () => {
  const equationPlus = `${randomFromArray(numbers2count)} + ${randomFromArray(
    numbers2count
  )}`;
  return (plus = {
    calculation: equationPlus,
    calculationWords: equationPlus,
    result: eval(equationPlus),
  });
};

///////////////////Minus////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

const minusFunction = () => {
  let minusFirst = randomFromArray(numbers2count);
  let minusSecond;
  do {
    minusSecond = randomFromArray(numbers2count);
  } while (minusFirst < minusSecond || minusFirst === minusSecond);
  const equationMinus = `${minusFirst} - ${minusSecond}`;

  return (minus = {
    calculation: equationMinus,
    calculationWords: `${minusFirst} minus ${minusSecond}`,
    result: eval(equationMinus),
  });
};

////////////////////Divided/////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

const dividedFunction = () => {
  let dividedFirst;
  let dividedSecond;
  let equationDivided;
  let divided;
  do {
    dividedFirst = randomFromArray(
      Array.from({ length: 91 }, (_, i) => i + 10)
    );
    dividedSecond = randomFromArray([3, 4, 5]);
    equationDivided = `${dividedFirst} / ${dividedSecond}`;
    divided = {
      calculation: equationDivided,
      calculationWords: `${dividedFirst} divided by ${dividedSecond}`,
      result: eval(equationDivided),
    };
  } while (decimalNumber(eval(equationDivided)));
  return divided;
};

////////////////////Calculation/////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

const createQuestions = () => {
  const equations = [];
  const calculations = [];

  do {
    let newQuestion = randomFromArray([
      dividedFunction(),
      plusFunction(),
      minusFunction(),
      timesFunction(),
    ]);
    if (
      !calculations.includes(newQuestion.calculation) ||
      calculations.length === 0
    ) {
      equations.push(newQuestion);
      calculations.push(newQuestion.calculation);
    } else {
      console.log("zawiera");
    }
  } while (calculations.length < 5);

  console.log("equations, po", equations);
  console.log("calculation, po", calculations);
  return equations;
};

console.log(createQuestions());
