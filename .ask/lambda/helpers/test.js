let count = 2;
let level = "medium";

let unanswered = { level: null, questions: [] };

const allQuestions = [
  { userResult: "38 + 87", questionInWords: "38 + 87", result: 125 },
  { userResult: "8 * 15", questionInWords: "8 * 15", result: 120 },
  { userResult: "3 * 32", questionInWords: "3 * 32", result: 96 },
  { userResult: "8 * 13", questionInWords: "8 * 13", result: 104 },
  {
    userResult: "77 / 7",
    questionInWords: "77 divided by 7",
    result: 11,
  },
];

for (let i = count; i >= 0; i--) {
  unanswered.questions.push(allQuestions[count]);

  count--;
}

console.log(unanswered.questions);
