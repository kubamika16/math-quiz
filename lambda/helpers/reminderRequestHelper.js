// Funkcja dotycząca tworzenia obiektu który zawiera informacje dotyczące aktualnej pozycji użytkownika, oraz czasu w którym chciałby dostać przypomnienie
const settingReminderRequest = function (
  currentDateTime,
  userInputHour,
  userInputMinute,
  userTimeZone
) {
  return {
    requestTime: currentDateTime.format("YYYY-MM-DDTHH:mm:ss"),
    trigger: {
      type: "SCHEDULED_ABSOLUTE",
      scheduledTime: currentDateTime
        .set({
          hour: userInputHour,
          minute: userInputMinute,
          second: "00",
        })
        .format("YYYY-MM-DDTHH:mm:ss"),
      timeZoneId: userTimeZone,
      recurrence: {
        freq: "DAILY",
      },
    },
    alertInfo: {
      spokenInfo: {
        content: [
          {
            locale: "en-US",
            text: "Play Math Quiz",
            ssml: "<speak>Play Math Quiz</speak>",
          },
        ],
      },
    },
    pushNotification: {
      status: "ENABLED",
    },
  };
};

module.exports = { settingReminderRequest };
