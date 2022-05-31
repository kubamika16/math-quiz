// Przydałoby się zrobić w odejmowaniu tak, żeby różnica pomiędzy dwoma liczbami była większa niż 5
// Pracuje w pliku test.js i equationsMedium.js

// userResult: userResult.question,
// questionInWords: userResult.questionInWords,
// result: userResult.result,

// Wyszukiwanie randomowych liczb z tablicy
const randomFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

//Liczba całkowita (albo dziesiętna)
const decimalNumber = (num) => !!(num % 1);

// Liczby danego przedziału (np. od 20 do 50)
const fromXtoY = (from, length) =>
  randomFromArray(Array.from({ length: length }, (_, i) => i + from));

// Liczby na których wykonywane są obliczenia (od 14 do 119, nie licząc liczb 'numbersToDelete')
let numbers2count = Array.from({ length: 106 }, (_, i) => i + 14);

// Liczby które powinno się usunąć, tak żeby działania nie były za proste
const numbersToDelete = [11, 20, 21, 30, 31, 40, 41, 50, 60, 70, 80, 90, 100];
numbersToDelete.forEach((numberDelete) => {
  numbers2count = numbers2count.filter((number) => number !== numberDelete);
});
//////////////////////////////Times////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
// Funkcja dotycząca mnożenia
const timesFunction = () => {
  const twoTimes = `2 * ${fromXtoY(1, 9)}${fromXtoY(6, 4)}`;
  const threeTimes = `3 * ${fromXtoY(1, 9)}${fromXtoY(2, 5)}`;
  const fourTimes = `4 * 1${fromXtoY(2, 5)}`;
  const fiveSixTimes = `${randomFromArray([5, 6])} * 1${fromXtoY(2, 4)}`;
  const sevenEightTimes = `${randomFromArray([7, 8])} * 1${fromXtoY(2, 4)}`;
  const nineTimes = `9 * 1${fromXtoY(2, 3)}`;

  // Randomowe działanie ze zmniennych wyżej
  let dataTimes = randomFromArray([
    twoTimes,
    threeTimes,
    fourTimes,
    fiveSixTimes,
    sevenEightTimes,
    nineTimes,
  ]);

  // Zwrócenie wartości mnożenia w obiekcie 'times'
  return (times = {
    userResult: dataTimes,
    questionInWords: dataTimes,
    result: eval(dataTimes),
  });
};

////////////////////Plus////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

// Funkcja dotycząca dodawania
const plusFunction = () => {
  // Zmienna dodająca do siebie 2 liczby. Od 14 do 100
  const equationPlus = `${randomFromArray(numbers2count)} + ${randomFromArray(
    numbers2count
  )}`;
  // Zwrócenie obiektu dodawania
  return (plus = {
    userResult: equationPlus,
    questionInWords: equationPlus,
    result: eval(equationPlus),
  });
};

///////////////////Minus////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

// Funkcja dotycząca odejmowania
const minusFunction = () => {
  let equationMinus, minusFirst, minusSecond, difference;

  // Pętla do jest wykonywana do momentu aż różnica pomiędzy pierwszą a drugą liczbą będzie większa niż 11 (5 = NIE, 25 = TAK)
  do {
    // Zmienna minusFirst to zwykłe liczby
    minusFirst = randomFromArray(numbers2count);
    // Zmienna minusSecond to liczba mniejsza niż liczba pierwsza i nierówna tej liczbie
    do {
      minusSecond = randomFromArray(numbers2count);
    } while (minusFirst < minusSecond || minusFirst === minusSecond);

    equationMinus = `${minusFirst} - ${minusSecond}`;

    difference = Math.abs(minusFirst - minusSecond);
  } while (Math.abs(difference < 11));

  // Zwracany obiekt odejmowania
  return (minus = {
    userResult: equationMinus,
    questionInWords: `${minusFirst} minus ${minusSecond}`,
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
  // Wykonywana jest praca dopóki działanie dzielenie jest liczbą całkowitą
  do {
    //Pierwsza liczba to iczba od 10 do 100
    dividedFirst = randomFromArray(
      Array.from({ length: 91 }, (_, i) => i + 10)
    );
    // Druga liczba to tablica liczb
    dividedSecond = randomFromArray([3, 4, 5, 6, 7]);
    equationDivided = `${dividedFirst} / ${dividedSecond}`;
    divided = {
      userResult: equationDivided,
      questionInWords: `${dividedFirst} divided by ${dividedSecond}`,
      result: eval(equationDivided),
    };
  } while (decimalNumber(eval(equationDivided)));
  return divided;
};

////////////////////Calculation/////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
const equations = [];
const createQuestions = () => {
  // const equations = [];
  const calculations = [];

  // Pętla która ma się wykonywać, aż ilość działań w tablicy wyniesie 5
  do {
    // Zmienna 'newQuestion' tworzy nowe pytanie, randomowo wybierając działanie dodawawnia, odejmowania, mnożenia albo dzielenia
    let newQuestion = randomFromArray([
      dividedFunction(),
      plusFunction(),
      minusFunction(),
      timesFunction(),
    ]);
    // Jeśli tablica pięciu pytań nie zawiera pytania, albo gdy jest pusta
    if (
      !calculations.includes(newQuestion.userResult) ||
      calculations.length === 0
    ) {
      // Dodawane zostaje nowe pytanie do tablicy
      equations.push(newQuestion);
      calculations.push(newQuestion.userResult);
    } else {
      console.log("zawiera");
    }
  } while (calculations.length < 5);

  // console.log("equations, po", equations);
  // console.log("userResult, po", calculations);
  return equations;
};

// console.log(createQuestions());

module.exports = { createQuestions, equations };
