// const randomFromArray = (array) =>
//   array[Math.floor(Math.random() * array.length)];

// const fromXtoY = (from, length) =>
//   randomFromArray(Array.from({ length: length }, (_, i) => i + from));

// // Liczby na których wykonywane są obliczenia
// let numbers2count = Array.from({ length: 106 }, (_, i) => i + 14);
// console.log(numbers2count);

// // Liczby które powinno się usunąć, tak żeby działania nie były za proste
// const numbersToDelete = [11, 20, 21, 30, 31, 40, 41, 50, 60, 70, 80, 90];
// numbersToDelete.forEach((numberDelete) => {
//   numbers2count = numbers2count.filter((number) => number !== numberDelete);
// });

// let firstNumber; // Liczby danego przedziału (np. od 20 do 50)
// let secondNumber;
// let differenceVariable;

// let difference = Math.abs(firstNumber - secondNumber);

// // do {
// //   firstNumber = fromXtoY(1, 6);
// //   console.log(firstNumber);
// //   secondNumber = fromXtoY(1, 6);
// //   console.log(secondNumber);
// //   console.log("--");
// //   difference = Math.abs(firstNumber - secondNumber);
// //   console.log("Difference:", difference);
// // } while (difference < 5);

// // Funkcja dotycząca odejmowania
// const minusFunction = () => {
//   let equationMinus, minusFirst, minusSecond, difference;

//   // Pętla do jest wykonywana do momentu aż różnica pomiędzy pierwszą a drugą liczbą będzie większa niż 11 (5 = NIE, 25 = TAK)
//   do {
//     // Zmienna minusFirst to zwykłe liczby
//     minusFirst = randomFromArray(numbers2count);
//     // Zmienna minusSecond to liczba mniejsza niż liczba pierwsza i nierówna tej liczbie
//     do {
//       minusSecond = randomFromArray(numbers2count);
//     } while (minusFirst < minusSecond || minusFirst === minusSecond);

//     equationMinus = `${minusFirst} - ${minusSecond}`;

//     difference = Math.abs(minusFirst - minusSecond);
//   } while (Math.abs(difference < 11));

//   // Zwracany obiekt odejmowania
//   return (minus = {
//     userResult: equationMinus,
//     questionInWords: `${minusFirst} minus ${minusSecond}`,
//     result: eval(equationMinus),
//   });
// };

// console.log(minusFunction());
