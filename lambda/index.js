//Problemy na które jeszcze nie znalazłem rozwiązania:
//Gdy Alexa rozpocznie program, a uzytkownik powie 'dificult', zamiast 'hard', Alexa przejdzie od razu do odpowiedzi na pytanie matematyczne. Dodać do Handlera ResultIntentHandler funkcję if(level===undefined)...

const Alexa = require("ask-sdk-core");
const moment = require("moment-timezone");

const functions = require("./helpers/functions");
const equationsEasy = require("./helpers/equationsEasy");
const equationsMedium = require("./helpers/equationsMedium");
const equationsHard = require("./helpers/equationsHard");
const equationsExtreme = require("./helpers/equationsExtreme");
const reminderRequestHelper = require("./helpers/reminderRequestHelper.js");

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
  // Gdy użytkownik odpowiada na jakieś pytanie tak/nie
  userYesNo: null,
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
    speakOutput += `Alright! You correctly answered ${points} out of 5 questions! `;
    repromptText = "";

    // speakOutput += "I am proud.";

    // Pobranie danych z bazy o danym ID użytkownika
    const data = await dbHelper.getData(currentUser.userID);

    // BUG BUG BUG BUG BUG
    // Wyłączyć komentarze gdy aplikacja przejdzie certyfikacje.

    // // Dodanie informacji na temat powiadomień, gdy w bazie, kolumny 'reminders' istnieje defaultowe 'none'
    // if (data.reminders === "none") {
    //   speakOutput += `By the way, This game would be much easier when you play it every day for just two minutes. I can create a daily reminder for you. If you agree, say the specific time for your daily reminder (for example: 8 a.m, or 5 p.m), otherwise say, no.`;

    //   // Ustawienie wartości 'reminder'. Pozwoli to na przekazanie tej zmiennej do switch/case, gdy użytkownik nie chce ustawiać powiadomień
    //   currentUser.userYesNo = "reminder";
    // }

    if (data.reminders === "denied" || data.reminders === "none") {
      speakOutput += `If you want to play again, choose a level: easy, medium, hard, or extreme? `;
      repromptText = `Easy, medium, hard or extreme?`;
    }

    // Zapisanie danych z 'runStreak' w tablicy
    const dates = data.runStreak;
    // Warunek który dodaje dzisiejszą datę, jeśli nie znajduje się ona w tablicy 'dates'
    if (!dates.includes(callendarDate.today))
      dates.push(functions.dateFunction());

    // Dodanie do bazy tablicy i ID użytkownika w której odpowiedziałem na 5 pytań,
    await dbHelper.updateStreak(currentUser.userID, dates);
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
        `Welcome in the math quiz! ${currentUser.currentRunStreakText}. To begin, say the level you want to start: easy, medium, hard, or extreme`,
        `Hello! ${currentUser.currentRunStreakText}. I will ask you 5 math equations. Now, choose your level: easy, medium, hard, or extreme?`,
        `Happy to see you! This is math quiz. ${currentUser.currentRunStreakText} To start, pick a level: easy, medium, hard, or extreme?`,
        `How are you? ${currentUser.currentRunStreakText}. If you want to play this math quiz, pick a level: easy, medium, hard, or extreme?`,
        `Dzien Dobry! You opened math quiz. ${currentUser.currentRunStreakText}. To start, choose a level: easy, medium, hard, or extreme`,
        `Hello! ${currentUser.currentRunStreakText}. To start the game, pick the level: easy, medium, hard, extreme?`,
        // `Hi! Today this game is being changed by adding new functions by our programmers. Sorry for all inconveniences. Easy, medium, hard or extreme level?`,
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
  async handle(handlerInput) {
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
      await numberOfQuestions();
      // Gdy odpowiedź użytkownika się nie zgadza
    } else {
      speakOutput = `${
        functions.audio.incorrectAnswer
      } Unfortunately, ${functions.randomFromArray(
        functions.messages.result
      )} ${currentQuestion.result}. `;
      count--;
      // Wywołanie funkcji która bierze pod uwagę dwaw przypadki ilości pytań (gdy ilość pytań jest większa lub równa 0, lub gdy ilość pytań jest mniejsza od 0)
      await numberOfQuestions();
    }

    console.log(speakOutput);

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

// Handler dotyczący przypomnień
const ReminderIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ReminderIntent"
    );
  },
  async handle(handlerInput) {
    // BUG BUG BUG BUG BUG
    // Wyłączyć komentarze gdy aplikacja przejdzie certyfikacje.

    // let userTimeInput =
    //   handlerInput.requestEnvelope.request.intent.slots.time.value;
    // let userInputHour;
    // let userInputMinute;

    // if (userTimeInput.includes(":")) {
    //   userTimeInput = userTimeInput.split(":");
    //   userInputHour = userTimeInput[0];
    //   userInputMinute = userTimeInput[1];
    // }

    // console.log("userTimeInput", userTimeInput);

    // const reminderApiClient =
    //   handlerInput.serviceClientFactory.getReminderManagementServiceClient();
    // try {
    //   // Ustawienie zmiennej dotyczącej wszystkich zezwoleń dla użytkownika
    //   const { permissions } = handlerInput.requestEnvelope.context.System.user;

    //   console.log(permissions);

    //   // Jeśli użytkownik nie ma żadnych zezwoleń, wtedy alexa o tym powiadamia oraz wysyła prośbę w aplikacji
    //   if (!permissions) {
    //     speakOutput = `Looks like you didn't set permissions to send you reminders. Go to the Alexa App on your phone, and turn the reminders on.`;
    //     return handlerInput.responseBuilder
    //       .speak(speakOutput)
    //       .withAskForPermissionsConsentCard([
    //         "alexa::alerts:reminders:skill:readwrite",
    //       ])
    //       .getResponse();
    //   } else {
    //     // Pobranie danych urządzenia użytkownika (jego czas lokalny)
    //     const { deviceId } = handlerInput.requestEnvelope.context.System.device;
    //     const upsServiceClient =
    //       handlerInput.serviceClientFactory.getUpsServiceClient();
    //     const userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);

    //     // Ustawienie daty na datę lokalną użytkownika
    //     const currentDateTime = moment().tz(userTimeZone);

    //     // speakOutput = `This is a developement stage of creating reminders.`;
    //     speakOutput = `You successfully scheduled a daily reminder.`;

    //     // Wywołanie przypomnienia
    //     await reminderApiClient.createReminder(
    //       reminderRequestHelper.settingReminderRequest(
    //         currentDateTime,
    //         userInputHour,
    //         userInputMinute,
    //         userTimeZone
    //       )
    //     );

    //     // Aktualizacja w bazie dotycząca tego, że użytkownik pozwolił sobie na uruchomienie powiadomień
    //     await dbHelper.updateReminders(currentUser.userID, "on");

    //   }
    // } catch (error) {
    //   console.log(`error message: ${error.message}`);
    //   console.log(`error stack: ${error.stack}`);
    //   console.log(`error status code: ${error.statusCode}`);
    //   console.log(`error response: ${error.response}`);
    //   speakOutput = `A reminder error occured.`;
    // }

    speakOutput = `Soon you will have a permission to create a daily reminder. For now, it is not possible. Choose the level then. Easy, medium, hard or extreme?`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt()
      .getResponse();
  },
};

// Handler uruchamiający się w momencie gdy użytkownik powie 'nie'
const NoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "noIntent"
    );
  },
  async handle(handlerInput) {
    try {
      switch (currentUser.userYesNo) {
        case "reminder":
          speakOutput = `No worries. If you want to play again choose a level (easy, medium, hard or extreme), or say stop to exit.`;
          // Aktualizacja bazy w oparciu o to co powiedział użytkownik. Nie chce żeby dostawać powiadomienia, więc ta informacja zostaje dodana do bazy.
          await dbHelper.updateReminders(currentUser.userID, "off");
          break;
      }
    } catch (error) {
      console.log(`error message: ${error.message}`);
      console.log(`error stack: ${error.stack}`);
      console.log(`error status code: ${error.statusCode}`);
      console.log(`error response: ${error.response}`);
      speakOutput = `A launch request error occured.`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt()
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
      "Thanks for playing. See you soon!";
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
    currentUser.userYesNo = null;
    // userReset();
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
    ReminderIntentHandler,
    NoIntentHandler,
    RepatQuestionIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .withPersistenceAdapter(
    new Adapter.DynamoDbPersistenceAdapter({
      tableName: dynamoDBTableName,
    })
  )
  .lambda();
