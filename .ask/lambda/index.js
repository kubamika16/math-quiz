//Problemy na które jeszcze nie znalazłem rozwiązania:
//Gdy Alexa rozpocznie program, a uzytkownik powie 'dificult', zamiast 'hard', Alexa przejdzie od razu do odpowiedzi na pytanie matematyczne. Dodać do Handlera ResultIntentHandler funkcję if(level===undefined)...

// 1 sesja w pociągu (14/05/2022)

const Alexa = require("ask-sdk-core");
const functions = require("./helpers/functions");
const equationsEasy = require("./helpers/equationsEasy");
const equationsMedium = require("./helpers/equationsMedium");
const equationsHard = require("./helpers/equationsHard");
const equationsExtreme = require("./helpers/equationsExtreme");

let level;
let points = 0;
let count = 4;
let allQuestions;
let currentQuestion;
let additionalTime;
let speakOutput = "";
let repromptText = "";

const reset = function () {
  points = 0;
  count = 4;
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    // const speakOutput = 'Welcome, you can say Hello or Help. Which would you like to try?';
    speakOutput = functions.randomFromArray(functions.messages.welcome);
    functions.newEquations();
    level = undefined;

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
    level = handlerInput.requestEnvelope.request.intent.slots.level.value;
    speakOutput += `${functions.randomFromArray(
      functions.messages.choosenLevel
    )} ${level}. `;

    if (level === "medium") {
      speakOutput += `Because of that level, you will have extra 3 seconds. Alright! `;
    }
    if (level === "hard") {
      speakOutput += `Because of that level, you will have extra 6 seconds. Alright! `;
    }
    if (level === "extreme") {
      speakOutput += `Because of that level, you will have extra 10 seconds. Alright! `;
    }

    reset();
    functions.newEquations();

    if (level === "easy") {
      allQuestions = equationsEasy.equations;
      currentQuestion = allQuestions[count];
      speakOutput += currentQuestion.questionInWords;

      additionalTime = `${functions.audio.additionalTime(0)}`;
    } else if (level === "medium") {
      allQuestions = equationsMedium.createQuestions();
      console.log(allQuestions);
      currentQuestion = allQuestions[count];
      speakOutput += currentQuestion.questionInWords;

      additionalTime = `${functions.audio.additionalTime(3)} ${
        functions.audio.answerTime
      }`;
      speakOutput += ` ${additionalTime}`;
    } else if (level === "hard") {
      allQuestions = equationsHard.equations;
      currentQuestion = allQuestions[count];
      speakOutput += currentQuestion.questionInWords;

      additionalTime = `${functions.audio.additionalTime(6)} ${
        functions.audio.answerTime
      }`;
      speakOutput += ` ${additionalTime}`;
    } else if (level === "extreme") {
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
    console.log("Level:", level);

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
    console.log("Level:", level);
    //Jeśli poziom nie został wybrany, zwrócona zostanie od razu odpowiedź zeby wybrac level
    if (level === undefined) {
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

    if (Number(userResult) === currentQuestion.result) {
      speakOutput += ` ${functions.audio.correctAnswer} Correct! That will be ${currentQuestion.result}. `;
      console.log(currentQuestion);
      console.log("Count:", count);
      points++;
      count--;
      if (count >= 0) {
        currentQuestion = allQuestions[count];
        speakOutput += `${functions.randomFromArray(
          functions.messages.nextQuestion
        )} ${currentQuestion.questionInWords}? `;
        speakOutput += ` ${additionalTime} `;
        repromptText = functions.audio.repromptClock;
      } else {
        speakOutput += `Alright! You correctly answered ${points} out of 5 questions, earning ${functions.addingPoints(
          level,
          points
        )} points. `;
        repromptText = "";
      }
    } else {
      speakOutput = `${
        functions.audio.incorrectAnswer
      } Unfortunately, ${functions.randomFromArray(
        functions.messages.result
      )} ${currentQuestion.result}. `;
      count--;
      if (count >= 0) {
        currentQuestion = allQuestions[count];
        speakOutput += `${functions.randomFromArray(
          functions.messages.nextQuestion
        )} ${currentQuestion.questionInWords}?`;
        speakOutput += ` ${additionalTime} `;
        repromptText = functions.audio.repromptClock;
      } else {
        speakOutput += `Alright! You correctly answered ${points} out of 5 questions, earning ${functions.addingPoints(
          level,
          points
        )} points. `;
        repromptText = "";
      }
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
    if (level === undefined) {
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
    if (count >= 0) {
      currentQuestion = allQuestions[count];
      speakOutput += `${functions.randomFromArray(
        functions.messages.nextQuestion
      )} ${currentQuestion.questionInWords}?`;
      speakOutput += ` ${additionalTime} `;
      repromptText = functions.audio.repromptClock;
    } else {
      speakOutput += `Alright! You correctly answered ${points} out of 5 questions, earning ${functions.addingPoints(
        level,
        points
      )} points. `;
      repromptText = "";
    }

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
      "Hope you had fun! If you can, leave a review. Good or bad, it should be honest. Honest answers will make this game much better. Goodbye!";
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
    level = undefined;
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
  .lambda();
