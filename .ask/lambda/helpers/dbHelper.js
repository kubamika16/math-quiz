let AWS = require("aws-sdk");
const functions = require("./functions");

//Tabela w bazie danych gdzie przechowujemy rekordy
const tableName = "math-quiz-db";

let dbHelper = function () {};
let docClient = new AWS.DynamoDB.DocumentClient();

// Funkcja pozwalająca na dodanie użytkownika do bazy, w oparciu o jego ID i o dzisiejszej dacie
dbHelper.prototype.addUser = (
  userID,
  dates = [],
  reminders = "none",
  unansweredQuestions = { level: null, questions: [], scored: 0 }
) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Item: {
        userId: userID,
        runStreak: dates,
        reminders: reminders,
        unansweredQuestions: unansweredQuestions,
      },
    };
    docClient.put(params, (err, data) => {
      if (err) {
        console.log("Unable to insert =>", JSON.stringify(err));
        return reject("Unable to insert");
      }
      resolve(data);
    });
  });
};

// Funkcja służąca do pobierania danych z bazy
dbHelper.prototype.getData = (userID) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      ExpressionAttributeValues: {
        ":user_id": userID,
      },
      KeyConditionExpression: "userId = :user_id",
    };
    docClient.query(params, (err, data) => {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        return reject(JSON.stringify(err, null, 2));
      }
      resolve(data.Items[0]);
    });
  });
};

// Aktualizacja 'runStreak (d/m/yyyy)' poszczególnego użytkownika w oparciu o jego ID
dbHelper.prototype.updateStreak = (userID, runStreak) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        userId: userID,
      },
      UpdateExpression: "set runStreak = :runStreak",
      ExpressionAttributeValues: {
        ":runStreak": runStreak,
      },
      ReturnValues: "UPDATED_NEW",
    };
    docClient.update(params, (err, data) => {
      if (err) {
        console.log(
          "Nie dało się zaaktualizować uzytkownika ------> ",
          JSON.stringify(err)
        );
        return reject("Nie dało się zaaktualizować");
      }
      resolve(data);
    });
  });
};

// Aktualizacja nieodpowiedzianych pytań przez użytkownika
dbHelper.prototype.updateUnanswered = (userID, unansweredQuestions) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        userId: userID,
      },
      UpdateExpression: "set unansweredQuestions = :unansweredQuestions",
      ExpressionAttributeValues: {
        ":unansweredQuestions": unansweredQuestions,
      },
      ReturnValues: "UPDATED_NEW",
    };
    docClient.update(params, (err, data) => {
      if (err) {
        console.log(
          "Nie dało się zaaktualizować uzytkownika ------> ",
          JSON.stringify(err)
        );
        return reject("Nie dało się zaaktualizować");
      }
      resolve(data);
    });
  });
};

// Aktualizacja powiadomień w bazie
dbHelper.prototype.updateReminders = (userID, reminders) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        userId: userID,
      },
      UpdateExpression: "set reminders = :reminders",
      ExpressionAttributeValues: {
        ":reminders": reminders,
      },
      ReturnValues: "UPDATED_NEW",
    };
    docClient.update(params, (err, data) => {
      if (err) {
        console.log(
          "Nie dało się zaaktualizować uzytkownika ------> ",
          JSON.stringify(err)
        );
        return reject("Nie dało się zaaktualizować");
      }
      resolve(data);
    });
  });
};

module.exports = new dbHelper();
