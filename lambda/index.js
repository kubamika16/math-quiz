// My ID:
// amzn1.ask.account.AGLNVAFCBGZQSIM3GLMMTNF3TF3NKVZBLVOQ4FKXRATXEHPPUD5BI72CSJZOGY7GIIJNDWPT6V6BEI2GQZROIF6I4XDYGWBCSVBWIC6EGEY6MNLDGLSYIWS737GMKV4ORARC4B32KKFFQ2CQYGBQUQHECIVPAAEB5W7HTHNETN6UO4SGSNKUOXQ7246E3KIM4VT37MVAZM5FPSI

// Podpowiedzi od Alexa Skills Insights @ amazon.com
// TO DO
// 1. Add Multimodal Experience

// Właśnie się za to zabieram
// https://www.youtube.com/watch?v=VfMNAkhkCCY
// https://stackoverflow.com/questions/54068857/dynamic-use-of-alexa-presentation-language

// 2. Add Reminders API - ZROBIONE
// 3. Add Feature to Save Progress - ZROBIONE
// 4. Include StartOver Intent - ZROBIONE
// 5. End a main response with a question - ZROBIONE
// 6. Improve the Natural Language Understanding (NLU) Accuracy of your skill - ZROBIONE
// 7. Add Fresh Content (More math questions) - ZROBIONE
// 8. Update skill’s metadata to provide more information

//Problemy na które jeszcze nie znalazłem rozwiązania:
//Gdy Alexa rozpocznie program, a uzytkownik powie 'dificult', zamiast 'hard', Alexa przejdzie od razu do odpowiedzi na pytanie matematyczne. Dodać do Handlera ResultIntentHandler funkcję if(level===undefined)...

// TO DO
// Przetestować 'don't know intent handler'

const Alexa = require('ask-sdk-core')
const moment = require('moment-timezone')

const functions = require('./helpers/functions')
const equationsEasy = require('./helpers/equationsEasy')
const equationsMedium = require('./helpers/equationsMedium')
const equationsHard = require('./helpers/equationsHard')
const equationsExtreme = require('./helpers/equationsExtreme')
const reminderRequestHelper = require('./helpers/reminderRequestHelper.js')

// Zmienne i biblioteki pozwalające na zapisanie danych w bazie
const dbHelper = require('./helpers/dbHelper.js')
const Adapter = require('ask-sdk-dynamodb-persistence-adapter')
const dynamoDBTableName = 'math-quiz-db'

const game = {
  count: 4,
  allQuestions: null,
  currentQuestion: null,
}

let additionalTime

let speakOutput = ''
let repromptText = ''

// Dane o użykowniku zapisane w obiekcie
let currentUser = {
  data: null, //Dane pobierane z bazy danych o danym użytkowniku
  currentRunStreak: 0,
  currentRunStreakText: null,
  userID: null,
  level: undefined,
  // Gdy użytkownik odpowiada na jakieś pytanie tak/nie
  userYesNo: null,
  points: 0,
  userTimeAmPm: null,
  userInputHour: null,
  userInputMinute: null,
}

// Obiekt dotyczący nieodpowiedzianych pytań przez użytkownika
let unanswered = { level: null, questions: [], scored: 0 }

// Obiekt daty
const callendarDate = {
  today: functions.dateFunction(),
  yesterday: functions.getYesterdayDate(),
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNKCJE LOKALNE

const numberOfQuestions = async function () {
  //
  if (game.count >= 0) {
    //
    game.currentQuestion = game.allQuestions[game.count]
    //
    speakOutput += `${functions.randomFromArray(
      functions.messages.nextQuestion,
    )} ${game.currentQuestion.questionInWords}?`
    additionalTimeFunction(currentUser.level)
    speakOutput += ` ${additionalTime} `
    repromptText = functions.audio.repromptClock
    // Przypadek, gdy liczba pytań jest równa 0
  } else {
    // Pobranie danych z bazy o danym ID użytkownika
    currentUser.data = await dbHelper.getData(currentUser.userID)
    const dbReminders = currentUser.data.reminders
    // Zapisanie danych z 'runStreak' w tablicy
    const dbDates = currentUser.data.runStreak

    speakOutput += `Alright! You correctly answered ${currentUser.points} out of 5 questions! `
    repromptText = ''

    // Dodanie informacji na temat powiadomień, gdy w bazie, kolumny 'reminders' istnieje defaultowe 'none'
    if (currentUser.data.reminders === 'none') {
      speakOutput += ` By the way, This game would be much easier when you play it every day for just two minutes. I can create a daily reminder for you. If you agree, say the specific time for your daily reminder (for example: 8 a.m, or 5 p.m), otherwise say, no.`

      // Ustawienie wartości 'reminder'. Pozwoli to na przekazanie tej zmiennej do switch/case, gdy użytkownik nie chce ustawiać powiadomień
      // currentUser.userYesNo = 'reminder'
      currentUser.userYesNo = 'ReminderConfirmation'
      repromptText = `If you agree for a reminder, say the time for your daily reminder (for example: 8 a.m, or 5 p.m), otherwise say, no.`
    }

    if (dbReminders === 'off' || dbReminders === 'on') {
      speakOutput += ` If you want to play again, choose a level: easy, medium, hard, or extreme? `
      repromptText = `Easy, medium, hard or extreme?`
    }

    // Warunek który dodaje dzisiejszą datę, jeśli nie znajduje się ona w tablicy 'dbDates'
    if (!dbDates.includes(callendarDate.today))
      dbDates.push(callendarDate.today)

    // TO DO TO DO TO DO TO DO TO DO TO DO TO DO TO DO TO DO TO DO
    // Destrukturyzacja kodu - jestem tutaj

    // Dodanie do bazy tablicy i ID użytkownika w której odpowiedziałem na 5 pytań,
    await dbHelper.updateStreak(currentUser.userID, dbDates)

    // Usunięcie z bazy nieodpowiedzianych pytań przez użytkownika
    game.allQuestions = null
    unansweredReset()

    await dbHelper.updateUnanswered(currentUser.userID, unanswered)
    reset()
  }
}

const reset = function () {
  currentUser.points = 0
  game.count = 4
}

const unansweredReset = () => {
  unanswered = { level: null, questions: [], scored: 0 }
}

const additionalTimeFunction = (level) => {
  if (level === 'medium')
    additionalTime = `${functions.audio.additionalTime(3)} ${
      functions.audio.answerTime
    }`

  if (level === 'hard')
    additionalTime = `${functions.audio.additionalTime(6)} ${
      functions.audio.answerTime
    }`

  if (level === 'extreme')
    additionalTime = `${functions.audio.additionalTime(10)} ${
      functions.audio.answerTime
    }`
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
    )
  },
  async handle(handlerInput) {
    currentUser.userID = handlerInput.requestEnvelope.context.System.user.userId
    // console.log("User ID:", currentUser.userID, "[from file index.js]");

    try {
      // Zresetowanie nieodpowiedzianych odpowiedzi z poprzedniej sesji (?)
      game.allQuestions = null
      unansweredReset()
      reset()

      // Tutaj sprawdzę warunek. Jeśli w bazie, w kolumnie 'unansweredQuestions' istnieją pytania, to Alexa powie coś w stylu: 'Last time you did x/5 questions. Now, you have two options: resume a previous game, or choose a new game (easy, medium, hard or extreme)?'.

      // Pobranie danych z bazy w oparciu o użytkownika
      currentUser.data = await dbHelper.getData(currentUser.userID)
      // console.log(data);

      //Jeśli nie ma uzytkownika w bazie to tworzy się nowy
      if (currentUser.data === undefined) {
        // Dodanie nowego użytkownika do bazy danych
        await dbHelper.addUser(currentUser.userID)
        currentUser.data = await dbHelper.getData(currentUser.userID)
        console.log('User Data:', currentUser.data)
        // A jeśli istnieje już użytkownik w bazie...
      } else {
        // Jeśli użytkownik nie posiada kolumny o nazwie 'unansweredQuestions' to tworzy się ta kolumna z pustymi rekordami
        if (!currentUser.data.unansweredQuestions) {
          unansweredReset()

          await dbHelper.updateUnanswered(currentUser.userID, unanswered)
        }
        console.log('User Data:', currentUser.data)
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Początkowe ustawienie 'runStreak'
      const dates = currentUser.data.runStreak
      if (
        dates.includes(callendarDate.today) &&
        !dates.includes(callendarDate.yesterday)
      ) {
        currentUser.runStreak = 1
      }

      // Jeśli nie ma wczorajszej daty i nie ma dzisiejszej daty, ustaw 'runStreaks' na 0
      if (
        !dates.includes(callendarDate.today) &&
        !dates.includes(callendarDate.yesterday)
      ) {
        currentUser.runStreak = 0
        // Usunięcie wszystkich dat z bazy w kolumnie 'runStreak'
        await dbHelper.updateStreak(currentUser.userID, [])
      }

      // Jeśli znajduje się dzisiejsza data i wczorajsza data, wtedy ilość punktów === ilość elementów tablicy dat
      if (
        (dates.includes(callendarDate.today) &&
          dates.includes(callendarDate.yesterday)) ||
        (!dates.includes(callendarDate.today) &&
          dates.includes(callendarDate.yesterday))
      ) {
        currentUser.runStreak = dates.length
      }

      currentUser.currentRunStreakText = functions.runStreakOutput(
        currentUser.runStreak,
      )

      // Logiczna funkcji wczytania pytań z poprzedniej gdy (jeśli w ogóle takie istnieją)
      // Jeśli liczba 'unansweredQuestions' będzie większa od 0
      if (currentUser.data.unansweredQuestions.questions.length > 0) {
        speakOutput = `Welcome in the math quiz! ${
          currentUser.currentRunStreakText
        }. In your previous game you answered ${
          5 - currentUser.data.unansweredQuestions.questions.length
        }, out of five questions. Now, you have two options. Resume a previous game, or choose a new game (easy, medium, hard or extreme level)?`
        // Jeśli jednak w poprzedniej rozgrywce wszystkie pytania zostały odpowiedziane
      } else {
        // Zresetowanie poziomu użytkownika
        currentUser.level = undefined

        // Końcowa wypowiedź Alexy na powitanie
        speakOutput = `${functions.randomFromArray([
          `Welcome in the math quiz! ${currentUser.currentRunStreakText}. To begin, say the level you want to start: easy, medium, hard, or extreme`,
          `Hello! ${currentUser.currentRunStreakText}. I will ask you 5 math equations. Now, choose your level: easy, medium, hard, or extreme?`,
          `Happy to see you! This is math quiz. ${currentUser.currentRunStreakText} To start, pick a level: easy, medium, hard, or extreme?`,
          `How are you? ${currentUser.currentRunStreakText}. If you want to play this math quiz, pick a level: easy, medium, hard, or extreme?`,
          `Dzien Dobry! You opened math quiz. ${currentUser.currentRunStreakText}. To start, choose a level: easy, medium, hard, or extreme`,
          `Hello! ${currentUser.currentRunStreakText}. To start the game, pick the level: easy, medium, hard, extreme?`,
          // `Hi! Today this game is being changed by adding new functions by our programmers. Sorry for all inconveniences. Easy, medium, hard or extreme level?`,
        ])}`
      }
    } catch (error) {
      console.log(`error message: ${error.message}`)
      console.log(`error stack: ${error.stack}`)
      console.log(`error status code: ${error.statusCode}`)
      console.log(`error response: ${error.response}`)
      speakOutput = `A launch request error occured.`
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  },
}
const GameLevelIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'GameLevelIntent'
    )
  },
  async handle(handlerInput) {
    speakOutput = ''
    currentUser.level =
      handlerInput.requestEnvelope.request.intent.slots.level.value
    speakOutput += `${functions.randomFromArray(
      functions.messages.choosenLevel,
    )} ${currentUser.level}. `

    if (currentUser.level === 'medium') {
      speakOutput += `Because of that level, you will have extra 3 seconds. Alright! `
    }
    if (currentUser.level === 'hard') {
      speakOutput += `Because of that level, you will have extra 6 seconds. Alright! `
    }
    if (currentUser.level === 'extreme') {
      speakOutput += `Because of that level, you will have extra 10 seconds. Alright! `
    }

    // Zresetowanie poprzedniej gry
    game.allQuestions = null
    reset()
    unansweredReset()

    await dbHelper.updateUnanswered(currentUser.userID, unanswered)

    // Utworzenie nowych pytań dla KAŻDEGO LEVELU
    functions.newEquations()

    if (currentUser.level === 'easy') {
      game.allQuestions = equationsEasy.equations
      game.currentQuestion = game.allQuestions[game.count]
      speakOutput += game.currentQuestion.questionInWords

      additionalTime = `${functions.audio.additionalTime(0)}`
    } else if (currentUser.level === 'medium') {
      game.allQuestions = equationsMedium.createQuestions()
      console.log('All Questions:', game.allQuestions)
      game.currentQuestion = game.allQuestions[game.count]
      speakOutput += game.currentQuestion.questionInWords

      // additionalTime = `${functions.audio.additionalTime(3)} ${
      //   functions.audio.answerTime
      // }`;
      additionalTimeFunction('medium')
      speakOutput += ` ${additionalTime}`
    } else if (currentUser.level === 'hard') {
      game.allQuestions = equationsHard.equations
      game.currentQuestion = game.allQuestions[game.count]
      speakOutput += game.currentQuestion.questionInWords

      // additionalTime = `${functions.audio.additionalTime(6)} ${
      //   functions.audio.answerTime
      // }`;
      additionalTimeFunction('hard')
      speakOutput += ` ${additionalTime}`
    } else if (currentUser.level === 'extreme') {
      game.allQuestions = equationsExtreme.equations
      game.currentQuestion = game.allQuestions[game.count]
      speakOutput += game.currentQuestion.questionInWords

      // additionalTime = `${functions.audio.additionalTime(10)} ${
      //   functions.audio.answerTime
      // }`;
      additionalTimeFunction('extreme')
      speakOutput += ` ${additionalTime}`
    } else {
      speakOutput = functions.randomFromArray(
        functions.messages.levelNotUnderstood,
      )
    }
    console.log('Current Level:', currentUser.level)

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(functions.audio.repromptClock)
      .getResponse()
  },
}

const ResultIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResultIntent'
    )
  },
  async handle(handlerInput) {
    //Jeśli poziom nie został wybrany, zwrócona zostanie od razu odpowiedź zeby wybrac level
    if (currentUser.level === undefined) {
      speakOutput = 'Choose the level first: easy, medium, hard or extreme.'

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('What is the level you want to choose?')
        .getResponse()
    }

    speakOutput = ''
    repromptText = ''

    const userResult =
      handlerInput.requestEnvelope.request.intent.slots.userResult.value
    console.log('Odpowiedź użytkownika:', userResult, typeof userResult)

    // Gdy odpowiedź użytkownika się zgadza
    if (Number(userResult) === game.currentQuestion.result) {
      speakOutput += ` ${functions.audio.correctAnswer} Correct! That will be ${game.currentQuestion.result}. `
      console.log('Current Question', game.currentQuestion)
      console.log('Count:', game.count)
      currentUser.points++
      unanswered.scored++
      game.count = game.count - 1
      // Wywołanie funkcji która bierze pod uwagę dwa przypadki ilości pytań (gdy ilość pytań jest większa lub równa 0, lub gdy ilość pytań jest mniejsza od 0)
      await numberOfQuestions()
      // Gdy odpowiedź użytkownika się nie zgadza
    } else {
      speakOutput = `${
        functions.audio.incorrectAnswer
      } Unfortunately, ${functions.randomFromArray(
        functions.messages.result,
      )} ${game.currentQuestion.result}. `
      game.count = game.count - 1
      // Wywołanie funkcji która bierze pod uwagę dwa przypadki ilości pytań (gdy ilość pytań jest większa lub równa 0, lub gdy ilość pytań jest mniejsza od 0)
      await numberOfQuestions()
    }

    // console.log(speakOutput);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptText)
      .getResponse()
  },
}

const dontKnowIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'dontKnowIntent'
    )
  },
  async handle(handlerInput) {
    //Jeśli poziom nie został wybrany, zwrócona zostanie od razu odpowiedź zeby wybrac level
    if (currentUser.level === undefined) {
      speakOutput = 'Choose the level first: easy, medium or hard.'

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('What is the level you want to choose?')
        .getResponse()
    }

    // speakOutput = "";
    // repromptText = "";

    speakOutput = `No worries. ${functions.randomFromArray(
      functions.messages.result,
    )} ${game.currentQuestion.result}. `
    game.count = game.count - 1
    await numberOfQuestions()

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  },
}

const RepatQuestionIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'RepatQuestionIntent'
    )
  },
  handle(handlerInput) {
    let speakOutputRepeat = `Of course! ${speakOutput}`

    return handlerInput.responseBuilder
      .speak(speakOutputRepeat)
      .reprompt(`${repromptText} k`)
      .getResponse()
  },
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    )
  },
  handle(handlerInput) {
    speakOutput = functions.randomFromArray(functions.messages.help)

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(
        'So if you want, choose a level to start playing: easy, medium, hard, or extreme.',
      )
      .getResponse()
  },
}

const StartOverIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.StartOverIntent'
    )
  },
  async handle(handlerInput) {
    speakOutput = `Alright. Now that you want to restart the game, pick a level first: easy, medium, hard or extreme?`
    repromptText = `Which level would you like to play?`

    game.allQuestions = null
    reset()
    unansweredReset()
    currentUser.level === undefined

    await dbHelper.updateUnanswered(currentUser.userID, unanswered)

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptText)
      .getResponse()
  },
}

// Handler dotyczący przypomnień
const ReminderIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReminderIntent'
    )
  },
  async handle(handlerInput) {
    // Godzina którą wypowiada użytkownik
    let userTimeInput =
      handlerInput.requestEnvelope.request.intent.slots.time.value
    console.log('Godzina którą ustawia użytkownik', userTimeInput)

    // Jeśli wybrana przez użytkownika godzina oddziela godziny i minuty dwukropkiem, to wtedy zostają one przedzielone i wrzucone do tablicy
    if (userTimeInput.includes(':')) {
      userTimeInput = userTimeInput.split(':')
      currentUser.userInputHour = userTimeInput[0]
      currentUser.userInputMinute = userTimeInput[1]

      // Jeśli nie ma minut w tej godzinie to zostają one usunięte
      currentUser.userInputMinute =
        currentUser.userInputMinute === '00' ||
        currentUser.userInputMinute === '0'
          ? ''
          : currentUser.userInputMinute

      console.log(
        'Wprowadzona godzina użytkownika i jej typ:',
        currentUser.userInputHour,
        typeof currentUser.userInputHour,
      )

      // Jeśli godzina wypowiedziana to np. 20:00, to program zamienia ją na 8 pm.
      if (Number(currentUser.userInputHour) > 12) {
        currentUser.userTimeAmPm = `${Number(currentUser.userInputHour) - 12} ${
          currentUser.userInputMinute
        } pm`
      }
      if (Number(currentUser.userInputHour) <= 12) {
        currentUser.userTimeAmPm = `${Number(currentUser.userInputHour)} ${
          currentUser.userInputMinute
        } am`
      }
      // Za to jeśli użtkownik zamiast godziny i minuty powie coś w stylu 'in the morning', to Alexa odpowie że tak nie można i poprosi żeby wybrać normalną godzinę zegarową
    } else {
      return handlerInput.responseBuilder
        .speak(
          'You need to tell me exact time for your daily reminder (for example, 8 am, or 5pm).',
        )
        .reprompt('What time would you like to be reminded about?')
        .getResponse()
    }

    try {
      // Ustawienie zmiennej dotyczącej wszystkich zezwoleń dla użytkownika
      const { permissions } = handlerInput.requestEnvelope.context.System.user

      // console.log(permissions);

      // Jeśli użytkownik nie ma żadnych zezwoleń, wtedy alexa o tym powiadamia oraz wysyła prośbę w aplikacji
      if (!permissions) {
        speakOutput = `Looks like you didn't set permissions to send you reminders. Go to the Alexa App on your phone, and turn the reminders on.`
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .withAskForPermissionsConsentCard([
            'alexa::alerts:reminders:skill:readwrite',
          ])
          .withShouldEndSession(true)
          .getResponse()
        // Jeśli użytkownik ustawił pozwolenie dotyczące przypomnień, wtedy Alexa może zadać pytanie dotyczące przypomnień.
      } else {
        speakOutput = `So you want to create a daily reminder at ${currentUser.userTimeAmPm}, is that correct?`
        // Ustawienie yesAnswer na ReminderConfirmation
        currentUser.userYesNo = 'ReminderConfirmation'
      }
    } catch (error) {
      console.log(`error message: ${error.message}`)
      console.log(`error stack: ${error.stack}`)
      console.log(`error status code: ${error.statusCode}`)
      console.log(`error response: ${error.response}`)
      speakOutput = `A reminder error occured.`
    }

    // speakOutput = `Soon you will have a permission to create a daily reminder. For now, it is not possible. Choose the level then. Easy, medium, hard or extreme?`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptText)
      .getResponse()
  },
}

// Handler uruchamiający się w momencie gdy użytkownik powie 'nie'
const NoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'noIntent'
    )
  },
  async handle(handlerInput) {
    try {
      switch (currentUser.userYesNo) {
        case 'ReminderConfirmation':
          speakOutput = `No worries. If you want to play again choose a level (easy, medium, hard or extreme), or say stop to exit.`
          // Aktualizacja bazy w oparciu o to co powiedział użytkownik. Nie chce żeby dostawać powiadomienia, więc ta informacja zostaje dodana do bazy.
          await dbHelper.updateReminders(currentUser.userID, 'off')
          break
      }
    } catch (error) {
      console.log(`error message: ${error.message}`)
      console.log(`error stack: ${error.stack}`)
      console.log(`error status code: ${error.statusCode}`)
      console.log(`error response: ${error.response}`)
      speakOutput = `A launch request error occured.`
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt()
      .getResponse()
  },
}

// YESINTENT HANDLER
const YesIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
    )
  },
  async handle(handlerInput) {
    try {
      // Switch dotyczący tego co powie użytkownik (yes, no). Tym razem userYesNo jest ustawione na 'reminder'
      switch (currentUser.userYesNo) {
        case 'ReminderConfirmation':
          speakOutput = ``

          const reminderApiClient = handlerInput.serviceClientFactory.getReminderManagementServiceClient()

          // Pobranie danych urządzenia użytkownika (jego czas lokalny)
          const {
            deviceId,
          } = handlerInput.requestEnvelope.context.System.device
          const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient()
          const userTimeZone = await upsServiceClient.getSystemTimeZone(
            deviceId,
          )
          console.log('User Time Zone', userTimeZone)

          // Ustawienie daty na datę lokalną użytkownika
          const currentDateTime = moment().tz(userTimeZone)

          speakOutput = `You successfully scheduled a daily reminder. Now, if you want to play again, choose a level. Easy, medium, hard or extreme.`
          repromptText = `Easy, medium, hard or extreme?`

          // Wywołanie przypomnienia
          await reminderApiClient.createReminder(
            reminderRequestHelper.settingReminderRequest(
              currentDateTime,
              currentUser.userInputHour,
              currentUser.userInputMinute,
              userTimeZone,
            ),
          )

          // Aktualizacja bazy w oparciu o to co powiedział użytkownik. Nie chce żeby dostawać powiadomienia, więc ta informacja zostaje dodana do bazy.
          await dbHelper.updateReminders(currentUser.userID, 'on')
          break
      }
    } catch (error) {
      console.log(`error message: ${error.message}`)
      console.log(`error stack: ${error.stack}`)
      console.log(`error status code: ${error.statusCode}`)
      console.log(`error response: ${error.response}`)
      speakOutput = `A launch request error occured.`
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt()
      .getResponse()
  },
}
// Handler który uruchamia się gdy użytkownik chciałby wczytać poprzednią grę
const ResumePreviousIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'ResumePreviousIntent'
    )
  },
  async handle(handlerInput) {
    speakOutput = ''
    // Pozostały 2 pytania:
    // A: Alright. What is 10+10?
    // U: 20
    // A: Good. What is 20+20?
    // U: 40
    // A: Good. You correctly...

    // Pobrać dane z bazy n.t. użytkownika
    // Zapisać w zmiennej 'unansweredQuestions'
    // Count = unansweredQuestions.length

    // Klasyczne pobranie danych z bazy
    currentUser.data = await dbHelper.getData(currentUser.userID)
    // Ustawienie wszystkich pytań na tyle ile jest nieodpowiedzianych w bazie
    game.allQuestions = currentUser.data.unansweredQuestions.questions
    // Ustawienie liczby pytań na tyle ile jest w bazie (liczba powinna dochodzić do zera, dlatego jest '-1')
    game.count = game.allQuestions.length - 1
    // Ustawienie poziomu z poprzedniej rozgrywki
    currentUser.level = currentUser.data.unansweredQuestions.level
    // Ustawienie liczby poprawnych odpowiedzi z poprzedniej rozgrywki
    currentUser.points = currentUser.data.unansweredQuestions.scored
    unanswered.scored = currentUser.data.unansweredQuestions.scored

    // Wykorzystanie funkcji 'numberOfQuestions'
    await numberOfQuestions()

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  },
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'AMAZON.StopIntent')
    )
  },
  handle(handlerInput) {
    const speakOutput =
      // "Hope you had fun! If you can, leave a review. Good or bad, it should be honest. Honest answers will make this game much better. Goodbye!";
      'Thanks for playing. See you soon!'
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse()
  },
}
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'SessionEndedRequest'
    )
  },
  async handle(handlerInput) {
    // Jeśli pytania są w ogóle zdefiniowane
    if (game.allQuestions) {
      // Dodanie do obiektu, na jakim poziomie grał użytkownik w poprzedniej rozgrywce
      unanswered.level = currentUser.level

      // Wyświetlenie wszystkich działań w oparciu o 'count'
      for (let i = game.count; i >= 0; i--) {
        console.log('count w pętli', game.count)
        console.log(
          `Unanswered question number ${game.count}`,
          game.allQuestions[game.count],
        )
        // Dodanie do tablicy pytań na które nie została udzielona odpowiedź
        unanswered.questions.push(game.allQuestions[game.count])

        game.count = game.count - 1
      }
    }

    // Dodanie nieodpowiedzianych przez użytkownika pytań do bazy
    await dbHelper.updateUnanswered(currentUser.userID, unanswered)

    game.allQuestions = null
    currentUser.userYesNo = null
    reset()
    return handlerInput.responseBuilder.getResponse()
  },
}

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    )
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope)
    const speakOutput = `You just triggered ${intentName}`

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(true)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    )
  },
}

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`)
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  },
}

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
    StartOverIntentHandler,
    ReminderIntentHandler,
    NoIntentHandler,
    YesIntentHandler,
    RepatQuestionIntentHandler,
    ResumePreviousIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .withPersistenceAdapter(
    new Adapter.DynamoDbPersistenceAdapter({
      tableName: dynamoDBTableName,
    }),
  )
  .lambda()
