const dateFunction = () => {
  const date = {};
  const newDate = new Date();
  // miesiąc (od zera do 11 ale dodałem 1)
  date.month = newDate.getMonth() + 1;
  // Dzień (od 1 do 31)
  date.day = newDate.getDate();
  date.year = newDate.getFullYear();
  return `${date.day}/${date.month}/${date.year}`;

  // // TESTY
  // // miesiąc (od zera do 11 ale dodałem 1)
  // date.month = 5;
  // // Dzień (od 1 do 31)
  // date.day = 18;
  // date.year = 2022;
  // return `${date.day - minusDays}/${date.month}/${date.year}`;
};

const callendarDate = {
  today: dateFunction(),
  yesterday: getYesterdayDate(),
};

console.log(callendarDate);

function getYesterdayDate() {
  const date = {};
  const fullDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  date.month = fullDate.getMonth() + 1;
  date.day = fullDate.getDate();
  date.year = fullDate.getFullYear();
  return `${date.day}/${date.month}/${date.year}`;
}
console.log(getYesterdayDate());
