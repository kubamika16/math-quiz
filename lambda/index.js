//Problemy na które jeszcze nie znalazłem rozwiązania:
//Gdy Alexa rozpocznie program, a uzytkownik powie 'dificult', zamiast 'hard', Alexa przejdzie od razu do odpowiedzi na pytanie matematyczne. Dodać do Handlera ResultIntentHandler funkcję if(level===undefined)...

const Alexa = require("ask-sdk-core");
const functions = require("./helpers/functions");
const equationsEasy = require("./helpers/equationsEasy");
const equationsMedium = require("./helpers/equationsMedium");
const equationsHard = require("./helpers/equationsHard");
const equationsExtreme = require("./helpers/equationsExtreme");

// Zmienne pozwalające na zapisanie danych w bazie
const dbHelper = require("./helpers/dbHelper.js");
const Adapter = require("ask-sdk-dynamodb-persistence-adapter");
const dynamoDBTableName = "math-quiz-db";

let points = 0;
let count = 4;
let allQuestions;
let currentQuestion;
let additionalTime;
let speakOutput = "";
let repromptText = "";

let data; //Dane pobierane z bazy danych

// Dane o użykowniku zapisane w obiekcie
let currentUser = {
  currentRunStreak: 0,
  currentRunStreakText: null,
  userID: null,
  level: undefined,
};

// Obiekt daty
const callendarDate = {
  today: functions.dateFunction(),
  yesterday: functions.dateFunction(1),
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNKCJE LOKALNE

const numberOfQuestions = async function () {
  if (count >= 0) {
    currentQuestion = allQuestions[count];
    speakOutput += `${functions.randomFromArray(
      functions.messages.nextQuestion
    )} ${currentQuestion.questionInWords}?`;
    speakOutput += ` ${additionalTime} `;
    repromptText = functions.audio.repromptClock;
    // Przypadek, gdy liczba pytań jest równa 0
  } else {
    speakOutput += `Alright! You correctly answered ${points} out of 5 questions!`;
    // earning ${functions.addingPoints(
    //   currentUser.level,
    //   points
    // )} points. `;
    repromptText = "";
    // console.log(`Points: ${points}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Dodawanie 'runStreak'

    // Pobranie danych z 'runStreak' o danym ID użytkownika
    const data = await dbHelper.getData(currentUser.userID);
    // Zapisanie danych z 'runStreak' w tablicy
    const dates = data.runStreak;
    // Warunek który dodaje dzisiejszą datę, jeśli nie znajduje się ona w tablicy 'dates'
    if (!dates.includes(callendarDate.today))
      dates.push(functions.dateFunction());

    // Dodanie do bazy tablicy i ID użytkownika w której odpowiedziałem na 5 pytań,
    await dbHelper.addUser(currentUser.userID, dates);
  }
};

const reset = function () {
  points = 0;
  count = 4;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  async handle(handlerInput) {
    currentUser.userID =
      handlerInput.requestEnvelope.context.System.user.userId;
    console.log("User ID:", currentUser.userID, "[from file index.js]");

    try {
      // Pobranie danych z bazy w oparciu o użytkownika
      data = await dbHelper.getData(currentUser.userID);
      console.log(data);

      //Jeśli nie ma uzytkownika w bazie to tworzy się nowy
      if (data === undefined) {
        // Dodanie nowego użytkownika do bazy danych
        await dbHelper.addUser(currentUser.userID, []);
        data = await dbHelper.getData(currentUser.userID);
        console.log("User Data:", data);
        // A jeśli istnieje już użytkownik w bazie...
      } else {
        console.log("User Data:", data);
      }

      // Dodanie do bazy dzisiejszej daty w której odpowiedziałem na 5 pytań
      // await dbHelper.updateStreak(currentUser.userID, functions.dateFunction());

      currentUser.level = undefined;
      functions.newEquations();
      // const speakOutput = 'Welcome, you can say Hello or Help. Which would you like to try?';

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Początkowe ustawienie 'runStreak'
      const dates = data.runStreak;
      if (
        dates.includes(callendarDate.today) &&
        !dates.includes(callendarDate.yesterday)
      ) {
        currentUser.runStreak = 1;
      }

      // Jeśli nie ma wczorajszej daty i nie ma dzisiejszej daty, ustaw 'runStreaks' na 0
      if (
        !dates.includes(callendarDate.today) &&
        !dates.includes(callendarDate.yesterday)
      ) {
        currentUser.runStreak = 0;
        // Usunięcie wszystkich dat z bazy w kolumnie 'runStreak'
        await dbHelper.updateStreak(currentUser.userID, []);
      }

      // Jeśli znajduje się dzisiejsza data i wczorajsza data, wtedy ilość punktów === ilość elementów tablicy dat
      if (
        (dates.includes(callendarDate.today) &&
          dates.includes(callendarDate.yesterday)) ||
        (!dates.includes(callendarDate.today) &&
          dates.includes(callendarDate.yesterday))
      ) {
        currentUser.runStreak = dates.length;
      }

      currentUser.currentRunStreakText = functions.runStreakOutput(
        currentUser.runStreak
      );

      // Końcowa wypowiedź Alexy na powitanie
      speakOutput = `${functions.randomFromArray([
        // `Welcome in the math quiz! ${currentUser.currentRunStreakText}. To begin, say the level you want to start: easy, medium, hard, or extreme`,
        // `Hello! ${currentUser.currentRunStreakText}. I will ask you 5 math equations. Now, choose your level: easy, medium, hard, or extreme?`,
        // `Happy to see you! This is math quiz. ${currentUser.currentRunStreakText} To start, pick a level: easy, medium, hard, or extreme?`,
        // `How are you? ${currentUser.currentRunStreakText}. If you want to play this math quiz, pick a level: easy, medium, hard, or extreme?`,
        // `Dzien Dobry! You opened math quiz. ${currentUser.currentRunStreakText}. To start, choose a level: easy, medium, hard, or extreme`,
        // `Hello! ${currentUser.currentRunStreakText}. To start the game, pick the level: easy, medium, hard, extreme?`,
        `Hi! Today this game is being changed by adding new functions by our programmers. Sorry for all inconveniences. Easy, medium, hard or extreme level?`,
      ])}`;
    } catch (error) {
      console.log(`error message: ${error.message}`);
      console.log(`error stack: ${error.stack}`);
      console.log(`error status code: ${error.statusCode}`);
      console.log(`error response: ${error.response}`);
      speakOutput = `A launch request error occured.`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const GameLevelIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GameLevelIntent"
    );
  },
  handle(handlerInput) {
    speakOutput = "";
    currentUser.level =
      handlerInput.requestEnvelope.request.intent.slots.level.value;
    speakOutput += `${functions.randomFromArray(
      functions.messages.choosenLevel
    )} ${currentUser.level}. `;

    if (currentUser.level === "medium") {
      speakOutput += `Because of that level, you will have extra 3 seconds. Alright! `;
    }
    if (currentUser.level === "hard") {
      speakOutput += `Because of that level, you will have extra 6 seconds. Alright! `;
    }
    if (currentUser.level === "extreme") {
      speakOutput += `Because of that level, you will have extra 10 seconds. Alright! `;
    }

    reset();
    functions.newEquations();

    if (currentUser.level === "easy") {
      allQuestions = equationsEasy.equations;
      currentQuestion = allQuestions[count];
      speakOutput += currentQuestion.questionInWords;

      additionalTime = `${functions.audio.additionalTime(0)}`;
    } else if (currentUser.level === "medium") {
      allQuestions = equationsMedium.createQuestions();
      console.log(allQuestions);
      currentQuestion = allQuestions[count];
      speakOutput += currentQuestion.questionInWords;

      additionalTime = `${functions.audio.additionalTime(3)} ${
        functions.audio.answerTime
      }`;
      speakOutput += ` ${additionalTime}`;
    } else if (currentUser.level === "hard") {
      allQuestions = equationsHard.equations;
      currentQuestion = allQuestions[count];
      speakOutput += currentQuestion.questionInWords;

      additionalTime = `${functions.audio.additionalTime(6)} ${
        functions.audio.answerTime
      }`;
      speakOutput += ` ${additionalTime}`;
    } else if (currentUser.level === "extreme") {
      allQuestions = equationsExtreme.equations;
      currentQuestion = allQuestions[count];
      speakOutput += currentQuestion.questionInWords;

      additionalTime = `${functions.audio.additionalTime(10)} ${
        functions.audio.answerTime
      }`;
      speakOutput += ` ${additionalTime}`;
    } else {
      speakOutput = functions.randomFromArray(
        functions.messages.levelNotUnderstood
      );
    }
    console.log("Level:", currentUser.level);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(functions.audio.repromptClock)
      .getResponse();
  },
};

const ResultIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ResultIntent"
    );
  },
  handle(handlerInput) {
    //Jeśli poziom nie został wybrany, zwrócona zostanie od razu odpowiedź zeby wybrac level
    if (currentUser.level === undefined) {
      speakOutput = "Choose the level first: easy, medium, hard or extreme.";

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What is the level you want to choose?")
        .getResponse();
    }

    speakOutput = "";
    repromptText = "";

    const userResult =
      handlerInput.requestEnvelope.request.intent.slots.result.value;

    // Gdy odpowiedź użytkownika się zgadza
    if (Number(userResult) === currentQuestion.result) {
      speakOutput += ` ${functions.audio.correctAnswer} Correct! That will be ${currentQuestion.result}. `;
      console.log(currentQuestion);
      console.log("Count:", count);
      points++;
      count--;
      // Wywołanie funkcji która bierze pod uwagę dwaw przypadki ilości pytań (gdy ilość pytań jest większa lub równa 0, lub gdy ilość pytań jest mniejsza od 0)
      numberOfQuestions();
      // Gdy odpowiedź użytkownika się nie zgadza
    } else {
      speakOutput = `${
        functions.audio.incorrectAnswer
      } Unfortunately, ${functions.randomFromArray(
        functions.messages.result
      )} ${currentQuestion.result}. `;
      count--;
      // Wywołanie funkcji która bierze pod uwagę dwaw przypadki ilości pytań (gdy ilość pytań jest większa lub równa 0, lub gdy ilość pytań jest mniejsza od 0)
      numberOfQuestions();
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const dontKnowIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "dontKnowIntent"
    );
  },
  handle(handlerInput) {
    //Jeśli poziom nie został wybrany, zwrócona zostanie od razu odpowiedź zeby wybrac level
    if (currentUser.level === undefined) {
      speakOutput = "Choose the level first: easy, medium or hard.";

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What is the level you want to choose?")
        .getResponse();
    }

    speakOutput = "";
    repromptText = "";

    speakOutput += `No worries. ${functions.randomFromArray(
      functions.messages.result
    )} ${currentQuestion.result}. `;
    count--;
    numberOfQuestions();

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const RepatQuestionIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "RepatQuestionIntent"
    );
  },
  handle(handlerInput) {
    let speakOutputRepeat = `Of course! ${speakOutput}`;

    return handlerInput.responseBuilder
      .speak(speakOutputRepeat)
      .reprompt(`${repromptText} k`)
      .getResponse();
  },
};
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    speakOutput = functions.randomFromArray(functions.messages.help);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(
        "So if you want, choose a level to start playing: easy, medium, hard, or extreme."
      )
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput =
      // "Hope you had fun! If you can, leave a review. Good or bad, it should be honest. Honest answers will make this game much better. Goodbye!";
      "Thanks!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    reset();
    currentUser.level = undefined;
    // functions.newEquations();
    return handlerInput.responseBuilder.getResponse();
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GameLevelIntentHandler,
    ResultIntentHandler,
    dontKnowIntentHandler,
    HelpIntentHandler,
    RepatQuestionIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(
    new Adapter.DynamoDbPersistenceAdapter({
      tableName: dynamoDBTableName,
    })
  )
  .lambda();
